"""
Authentication routes — registration, login, logout, token refresh, and Google OIDC callback.

Refresh tokens are stored in Redis DB 0 with HttpOnly; SameSite=Strict cookies.
Access tokens are JWT (stateless) returned in the JSON body.
"""

import uuid
from typing import TYPE_CHECKING

from fastapi import APIRouter, HTTPException, Response, status

if TYPE_CHECKING:
    from passlib.context import CryptContext

from app.application.services.auth_service import AuthService
from app.core.dependencies import CurrentUserId, SessionDep
from app.core.redis import get_session_redis
from app.infrastructure.repositories.token_blacklist_repository import TokenBlacklistRepository
from app.infrastructure.repositories.user_repository import UserRepository
from app.presentation.schemas.auth import (
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    GoogleCallbackRequest,
    GoogleCallbackResponse,
    LoginRequest,
    LogoutResponse,
    RefreshRequest,
    RegisterRequest,
    ResendVerificationRequest,
    ResendVerificationResponse,
    ResetPasswordRequest,
    ResetPasswordResponse,
    TokenResponse,
    UserResponse,
    VerifyEmailRequest,
    VerifyEmailResponse,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])

REFRESH_KEY_PREFIX = "clark:refresh:"
REFRESH_COOKIE_NAME = "clark_refresh_token"


def _auth_service(session: SessionDep) -> AuthService:
    return AuthService(
        UserRepository(session),
        TokenBlacklistRepository(session),
    )


# ── Password helpers (lazy-loads passlib to avoid import overhead) ────────

_pwd_ctx: "CryptContext | None" = None


def _get_pwd_context() -> "CryptContext":
    global _pwd_ctx
    if _pwd_ctx is None:
        from passlib.context import CryptContext

        _pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")
    return _pwd_ctx


def _hash_password(plain: str) -> str:
    return _get_pwd_context().hash(plain)  # type: ignore[no-any-return]


def _verify_password(plain: str, hashed: str) -> bool:
    return _get_pwd_context().verify(plain, hashed)  # type: ignore[no-any-return]


# ── Refresh token helpers ────────────────────────────────────────────────────

async def _create_refresh_token(user_id: str) -> str:
    """Create an opaque UUID refresh token and store it in Redis DB 0."""
    from app.core.config import get_settings
    settings = get_settings()

    token = str(uuid.uuid4())
    redis = await get_session_redis()
    ttl = settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400
    await redis.setex(f"{REFRESH_KEY_PREFIX}{token}", ttl, user_id)
    return token


async def _validate_refresh_token(token: str) -> str:
    """Return user_id if refresh token is valid, raise ValueError otherwise."""

    redis = await get_session_redis()
    user_id: str | None = await redis.get(f"{REFRESH_KEY_PREFIX}{token}")
    if not user_id:
        raise ValueError("Refresh token not found or expired")
    return user_id


async def _revoke_refresh_token(token: str) -> None:
    """Delete refresh token from Redis."""
    redis = await get_session_redis()
    await redis.delete(f"{REFRESH_KEY_PREFIX}{token}")


async def _revoke_all_user_tokens(user_id: str) -> None:
    """Logout from all devices — scans DB 0 for all tokens belonging to this user."""
    redis = await get_session_redis()
    cursor = 0
    while True:
        cursor, keys = await redis.scan(cursor, match=f"{REFRESH_KEY_PREFIX}*", count=100)
        for key in keys:
            if await redis.get(key) == user_id:
                await redis.delete(key)
        if cursor == 0:
            break


# ── Endpoints ────────────────────────────────────────────────────────────────

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    body: RegisterRequest,
    session: SessionDep,
) -> UserResponse:
    """Create a new user account and send a verification email."""
    service = _auth_service(session)
    user = await service.register(
        username=body.username,
        email=body.email,
        password=body.password,
        display_name=body.display_name,
    )

    # Send verification email (fire-and-forget — don't block registration on email failure)
    try:
        from app.services.email_service import send_verification_email
        token = await service.generate_email_verification_token(user.id)
        await send_verification_email(
            to=user.email,
            display_name=user.display_name or user.username,
            token=token,
        )
    except Exception as exc:
        # Log but don't fail the request
        import logging
        logging.getLogger("uvicorn").warning("Failed to send verification email: %s", str(exc))

    return UserResponse(
        id=str(user.id),
        username=user.username,
        email=user.email,
        display_name=user.display_name,
        avatar_url=user.avatar_url,
        is_active=user.is_active,
        email_verified=user.email_verified,
    )


@router.post("/login", response_model=TokenResponse)
async def login(
    body: LoginRequest,
    session: SessionDep,
    response: Response,
) -> TokenResponse:
    """Authenticate, issue tokens, set refresh token as HttpOnly cookie."""
    from app.core.config import get_settings
    settings = get_settings()

    _auth_service(session)
    user = await UserRepository(session).get_by_email(body.email)

    if user is None or not _verify_password(body.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account is deactivated",
        )

    # Create access token (JWT, stateless)
    from app.core.security import create_access_token as _create_access_token
    access_token = _create_access_token(str(user.id))

    # Create refresh token (Redis)
    refresh_token = await _create_refresh_token(str(user.id))

    # Set HttpOnly cookie
    max_age = settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400
    response.set_cookie(
        key=REFRESH_COOKIE_NAME,
        value=refresh_token,
        max_age=max_age,
        httponly=True,
        samesite="strict",
        secure=True,
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    response: Response,
    session: SessionDep,
    body: RefreshRequest | None = None,
) -> TokenResponse:
    """
    Exchange a refresh token for a new access token.

    Token rotation: always revoke the old refresh token and issue a new one.
    """
    from app.core.config import get_settings
    from app.core.security import create_access_token as _create_access_token
    settings = get_settings()

    # Extract refresh token from cookie if not in body
    token = body.refresh_token if body and body.refresh_token else None
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token required",
        )

    # Validate and rotate
    user_id = await _validate_refresh_token(token)
    await _revoke_refresh_token(token)

    # Issue new access token
    new_access_token = _create_access_token(user_id)

    # Issue new refresh token
    new_refresh_token = await _create_refresh_token(user_id)

    # Update cookie
    max_age = settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400
    response.set_cookie(
        key=REFRESH_COOKIE_NAME,
        value=new_refresh_token,
        max_age=max_age,
        httponly=True,
        samesite="strict",
        secure=True,
    )

    return TokenResponse(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
        token_type="bearer",
    )


@router.post("/logout", response_model=LogoutResponse, status_code=status.HTTP_200_OK)
async def logout(
    response: Response,
    session: SessionDep,
    body: RefreshRequest | None = None,
) -> LogoutResponse:
    """Revoke refresh token and clear cookie."""
    if body and body.refresh_token:
        await _revoke_refresh_token(body.refresh_token)

    response.delete_cookie(key=REFRESH_COOKIE_NAME)
    return LogoutResponse(message="Logout successful")


@router.post("/logout-all", response_model=LogoutResponse, status_code=status.HTTP_200_OK)
async def logout_all(
    user_id: CurrentUserId,
    session: SessionDep,
    response: Response,
) -> LogoutResponse:
    """Revoke all refresh tokens for this user across all devices."""
    await _revoke_all_user_tokens(str(user_id))
    response.delete_cookie(key=REFRESH_COOKIE_NAME)
    return LogoutResponse(message="Logged out from all devices")


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    user_id: CurrentUserId,
    session: SessionDep,
) -> UserResponse:
    """Return the authenticated user's profile."""
    service = _auth_service(session)
    user = await service.get_current_user(user_id)
    return UserResponse(
        id=str(user.id),
        username=user.username,
        email=user.email,
        display_name=user.display_name,
        avatar_url=user.avatar_url,
        is_active=user.is_active,
        email_verified=user.email_verified,
    )


# ── Email verification ─────────────────────────────────────────────────────────

@router.post("/verify-email", response_model=VerifyEmailResponse)
async def verify_email(
    body: VerifyEmailRequest,
    session: SessionDep,
) -> VerifyEmailResponse:
    """
    Consume the email-verification token, mark the account as verified,
    and send the welcome email.
    """
    service = _auth_service(session)
    user_id = await service.verify_email_token(body.token)
    await service.confirm_email_verified(user_id)

    user = await service.get_current_user(user_id)
    try:
        from app.services.email_service import send_welcome_email
        await send_welcome_email(
            to=user.email,
            display_name=user.display_name or user.username,
        )
    except Exception:
        import logging
        logging.getLogger("uvicorn").warning("Failed to send welcome email")

    return VerifyEmailResponse()


@router.post("/resend-verification", response_model=ResendVerificationResponse)
async def resend_verification(
    body: ResendVerificationRequest,
    session: SessionDep,
) -> ResendVerificationResponse:
    """
    Re-send the verification email if the user hasn't verified yet.
    Safe to call for non-existent accounts (no information leakage).
    """
    service = _auth_service(session)
    user = await UserRepository(session).get_by_email(body.email)
    if user and not user.email_verified:
        try:
            from app.services.email_service import send_verification_email
            token = await service.generate_email_verification_token(user.id)
            await send_verification_email(
                to=user.email,
                display_name=user.display_name or user.username,
                token=token,
            )
        except Exception as exc:
            import logging
            logging.getLogger("uvicorn").warning("Failed to resend verification email: %s", str(exc))
    # Always return success to prevent email enumeration
    return ResendVerificationResponse()


# ── Password reset ─────────────────────────────────────────────────────────────

@router.post("/forgot-password", response_model=ForgotPasswordResponse)
async def forgot_password(
    body: ForgotPasswordRequest,
    session: SessionDep,
) -> ForgotPasswordResponse:
    """
    Generate a password-reset token and send the reset email.
    Returns success regardless of whether the account exists
    (prevents email enumeration).
    """
    service = _auth_service(session)
    token = await service.generate_password_reset_token(body.email)
    if token:
        user = await UserRepository(session).get_by_email(body.email)
        if user is not None:
            try:
                from app.services.email_service import send_password_reset_email
                await send_password_reset_email(
                    to=user.email,
                    display_name=user.display_name or user.username,
                    token=token,
                )
            except Exception as exc:
                import logging
                logging.getLogger("uvicorn").warning("Failed to send password reset email: %s", str(exc))
    return ForgotPasswordResponse()


@router.post("/reset-password", response_model=ResetPasswordResponse)
async def reset_password(
    body: ResetPasswordRequest,
    session: SessionDep,
) -> ResetPasswordResponse:
    """Consume the reset token and update the user's password."""
    service = _auth_service(session)
    user_id = await service.verify_password_reset_token(body.token)

    # Get user and update password directly (token flow — no current password needed)
    from app.domain.entities import User
    user_repo = UserRepository(session)
    user = await user_repo.get_by_id(user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )
    updated = User(
        id=user.id,
        username=user.username,
        email=user.email,
        hashed_password=_hash_password(body.new_password),
        display_name=user.display_name,
        avatar_url=user.avatar_url,
        is_active=user.is_active,
        email_verified=user.email_verified,
    )
    await user_repo.update(updated)
    return ResetPasswordResponse()


@router.post("/google/callback", response_model=GoogleCallbackResponse)
async def google_oidc_callback(
    body: GoogleCallbackRequest,
    session: SessionDep,
    response: Response,
) -> GoogleCallbackResponse:
    """
    Google OIDC callback — exchange the authorization ``code`` for our JWT pair.
    """
    from app.core.config import get_settings
    settings = get_settings()

    service = _auth_service(session)
    result = await service.handle_google_callback(body.code, body.redirect_uri)

    user = result["user"]

    # Issue new refresh token in Redis (non-critical — if Redis is down,
    # the user still gets an access token and the front-end can fall back).
    refresh_token: str | None = None
    try:
        refresh_token = await _create_refresh_token(str(user.id))
    except Exception as exc:
        import logging
        logging.getLogger("clarkplayer").warning(
            "Failed to store Google OIDC refresh token in Redis: %s", exc
        )

    # Set HttpOnly cookie (only if we have a refresh token)
    if refresh_token:
        max_age = settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400
        response.set_cookie(
            key=REFRESH_COOKIE_NAME,
            value=refresh_token,
            max_age=max_age,
            httponly=True,
            samesite="strict",
            secure=True,
        )

    return GoogleCallbackResponse(
        access_token=result["access_token"],
        refresh_token=refresh_token,
        token_type=result["token_type"],
        user=UserResponse(
            id=str(user.id),
            username=user.username,
            email=user.email,
            display_name=user.display_name,
            avatar_url=user.avatar_url,
            is_active=user.is_active,
        ),
    )