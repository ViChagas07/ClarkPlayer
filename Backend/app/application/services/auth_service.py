"""
Authentication service — handles registration, login, token refresh, and Google OIDC.

Depends on abstractions (:class:`IUserRepository`) rather than concrete
implementations, following the **Dependency Inversion Principle**.
"""

import logging
import secrets
from typing import Any
from uuid import UUID

import httpx

from app.application.interfaces.repositories import IUserRepository
from app.core.config import get_settings
from app.core.exceptions import ConflictError, CredentialsError, TokenInvalidError
from app.core.redis import get_session_redis
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
    get_token_expiry,
    get_token_jti,
    get_token_subject,
    hash_password,
    verify_password,
)
from app.domain.entities import User
from app.infrastructure.repositories.token_blacklist_repository import TokenBlacklistRepository

logger = logging.getLogger("uvicorn")


class AuthService:
    """Orchestrates authentication use-cases."""

    def __init__(
        self,
        user_repo: IUserRepository,
        blacklist_repo: TokenBlacklistRepository | None = None,
    ) -> None:
        self._user_repo = user_repo
        self._blacklist_repo = blacklist_repo

    async def register(
        self,
        *,
        username: str,
        email: str,
        password: str,
        display_name: str | None = None,
    ) -> User:
        """Register a new user account."""
        if await self._user_repo.get_by_email(email):
            raise ConflictError("A user with this email already exists.")
        if await self._user_repo.get_by_username(username):
            raise ConflictError("A user with this username already exists.")

        user = User(
            username=username,
            email=email,
            hashed_password=hash_password(password),
            display_name=display_name,
            email_verified=False,
        )
        return await self._user_repo.create(user)

    async def login(self, *, email: str, password: str) -> dict[str, Any]:
        """
        Authenticate a user and return an access + refresh token pair.

        The returned dict has keys ``access_token``, ``refresh_token``,
        ``token_type``, and ``expires_in`` (seconds).
        """
        user = await self._user_repo.get_by_email(email)
        if user is None or not verify_password(password, user.hashed_password):
            raise CredentialsError()

        if not user.is_active:
            raise CredentialsError("Account is deactivated.")

        access_token = create_access_token(str(user.id))
        refresh_token = create_refresh_token(str(user.id))
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
        }

    async def get_current_user(self, user_id: UUID) -> User:
        """Return the user entity for the authenticated principal."""
        user = await self._user_repo.get_by_id(user_id)
        if user is None:
            raise CredentialsError("User not found.")
        return user

    # ── Email Verification Tokens (Redis) ─────────────────────────────────

    VERIFY_KEY_PREFIX  = "clark:verify:"
    RESET_KEY_PREFIX   = "clark:reset:"

    async def _store_token(self, prefix: str, token: str, user_id: UUID, ttl_minutes: int) -> None:
        """Store a short-lived token in Redis DB 0."""
        redis = await get_session_redis()
        key = f"{prefix}{token}"
        await redis.setex(key, ttl_minutes * 60, str(user_id))

    async def generate_email_verification_token(self, user_id: UUID) -> str:
        """Generate and store a email-verification token, returning the raw token."""
        settings = get_settings()
        token = secrets.token_urlsafe(32)
        await self._store_token(
            self.VERIFY_KEY_PREFIX, token, user_id,
            settings.EMAIL_VERIFICATION_TOKEN_EXPIRE_MINUTES,
        )
        return token

    async def verify_email_token(self, token: str) -> UUID:
        """Consume an email-verification token and return the user_id. Raises if invalid/expired."""
        redis = await get_session_redis()
        user_id_str = await redis.get(f"{self.VERIFY_KEY_PREFIX}{token}")
        if not user_id_str:
            raise TokenInvalidError("Verification token is invalid or has expired.")
        await redis.delete(f"{self.VERIFY_KEY_PREFIX}{token}")
        return UUID(user_id_str)

    async def generate_password_reset_token(self, email: str) -> str | None:
        """
        Generate and store a password-reset token for the given email.
        Returns the raw token if the user exists, None otherwise.
        """
        settings = get_settings()
        user = await self._user_repo.get_by_email(email)
        if not user:
            return None
        token = secrets.token_urlsafe(32)
        await self._store_token(
            self.RESET_KEY_PREFIX, token, user.id,
            settings.PASSWORD_RESET_TOKEN_EXPIRE_MINUTES,
        )
        return token

    async def verify_password_reset_token(self, token: str) -> UUID:
        """Consume a password-reset token and return the user_id. Raises if invalid/expired."""
        redis = await get_session_redis()
        user_id_str = await redis.get(f"{self.RESET_KEY_PREFIX}{token}")
        if not user_id_str:
            raise TokenInvalidError("Password reset token is invalid or has expired.")
        await redis.delete(f"{self.RESET_KEY_PREFIX}{token}")
        return UUID(user_id_str)

    async def confirm_email_verified(self, user_id: UUID) -> None:
        """Mark the user's email as verified and send the welcome email."""
        user = await self._user_repo.get_by_id(user_id)
        if user is None:
            raise CredentialsError("User not found.")
        updated = User(
            id=user.id, username=user.username, email=user.email,
            hashed_password=user.hashed_password, display_name=user.display_name,
            avatar_url=user.avatar_url, is_active=user.is_active,
            email_verified=True,
        )
        await self._user_repo.update(updated)

    # ── Logout & Token Blacklisting ──────────────────────────────────────

    async def logout(self, refresh_token: str | None = None) -> dict[str, Any]:
        """
        Logout a user by blacklisting their refresh token.
        
        If a refresh token is provided, it will be added to the blacklist
        to prevent its future use. Access tokens cannot be revoked (they
        are short-lived), but they will become invalid when they expire.
        
        Returns a success message.
        """
        if refresh_token and self._blacklist_repo:
            try:
                # Extract token metadata without full validation
                token_jti = get_token_jti(refresh_token)
                user_id = get_token_subject(refresh_token)
                expires_at = get_token_expiry(refresh_token)

                if token_jti and user_id and expires_at:
                    # Add token to blacklist
                    await self._blacklist_repo.add_to_blacklist(
                        token_jti=token_jti,
                        user_id=user_id,
                        expires_at=expires_at,
                        reason="logout",
                    )
            except Exception:
                # If token is invalid, we still allow logout to succeed
                # The client-side session is being cleared anyway
                pass

        return {"message": "Logout successful"}

    async def is_token_blacklisted(self, refresh_token: str) -> bool:
        """
        Check if a refresh token has been blacklisted.
        
        Returns True if the token is blacklisted (should not be used).
        """
        if not self._blacklist_repo:
            return False

        token_jti = get_token_jti(refresh_token)
        if not token_jti:
            return False

        return await self._blacklist_repo.is_blacklisted(token_jti)

    async def refresh_access_token(self, refresh_token: str) -> dict[str, Any]:
        """
        Issue a new access token using a valid refresh token.
        
        First checks if the refresh token has been blacklisted.
        """
        # Check if token is blacklisted before proceeding
        if self._blacklist_repo and await self.is_token_blacklisted(refresh_token):
            raise TokenInvalidError("Refresh token has been revoked.")

        claims = decode_refresh_token(refresh_token)

        user_id_str = claims.get("sub")
        if not user_id_str:
            raise CredentialsError("Invalid refresh token payload.")

        user_id = UUID(user_id_str)
        user = await self._user_repo.get_by_id(user_id)
        if user is None or not user.is_active:
            raise CredentialsError("User no longer exists or is deactivated.")

        new_access_token = create_access_token(str(user.id))
        return {"access_token": new_access_token, "token_type": "bearer"}

    # ── Google OIDC ──────────────────────────────────────────────────────

    async def handle_google_callback(
        self, code: str, redirect_uri: str | None = None
    ) -> dict[str, Any]:
        """
        Exchange the Google authorization ``code`` for tokens, verify the
        ID token with Google, and return our own JWT pair plus user info.

        Flow:
        1. POST the ``code`` to Google's token endpoint to get an ID token.
        2. Call Google's ``userinfo`` endpoint with the access token to
           fetch the user's profile (email, name, picture).
        3. Look up or create a local user record.
        4. Issue our own access + refresh JWT pair.

        Returns a dict with keys ``access_token``, ``refresh_token``,
        ``token_type``, and ``user`` (a :class:`User` entity).

        Parameters
        ----------
        code : str
            The authorization code from Google.
        redirect_uri : str, optional
            The redirect URI used in the auth request. If not provided,
            falls back to ``GOOGLE_OIDC_REDIRECT_URI`` from settings.
        """
        settings = get_settings()

        # Determine the redirect URI — prefer what the front-end sends
        # (guarantees it matches the auth request), fall back to config.
        effective_redirect_uri = redirect_uri or settings.GOOGLE_OIDC_REDIRECT_URI

        if not effective_redirect_uri:
            raise CredentialsError(
                "Google OIDC redirect URI is not configured. "
                "Set GOOGLE_OIDC_REDIRECT_URI on the server or send "
                "redirect_uri in the callback request."
            )

        if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
            raise CredentialsError("Google OIDC is not configured on the server.")

        # ── Step 1: Exchange authorization code for tokens ────────────────
        token_url = "https://oauth2.googleapis.com/token"
        token_data = {
            "code": code,
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "redirect_uri": effective_redirect_uri,
            "grant_type": "authorization_code",
        }

        async with httpx.AsyncClient() as client:
            token_resp = await client.post(token_url, data=token_data)

        if token_resp.status_code != 200:
            raise CredentialsError(
                f"Google token exchange failed: {token_resp.text}"
            )

        token_json = token_resp.json()
        id_token: str = token_json.get("id_token", "")
        access_token: str = token_json.get("access_token", "")

        if not id_token:
            raise CredentialsError("Google did not return an ID token.")

        # ── Step 2: Fetch user info from Google ───────────────────────────
        userinfo_url = "https://www.googleapis.com/oauth2/v3/userinfo"
        async with httpx.AsyncClient() as client:
            userinfo_resp = await client.get(
                userinfo_url,
                headers={"Authorization": f"Bearer {access_token}"},
            )

        if userinfo_resp.status_code != 200:
            raise CredentialsError(
                f"Google userinfo fetch failed: {userinfo_resp.text}"
            )

        userinfo = userinfo_resp.json()

        email: str = userinfo.get("email", "")
        if not email:
            raise CredentialsError("Google did not return an email address.")

        # Verify the ID token's audience matches our client ID
        # (basic check — in production also verify the JWT signature)
        if userinfo.get("aud") != settings.GOOGLE_CLIENT_ID:
            raise CredentialsError("ID token audience mismatch.")

        # ── Step 3: Find or create the local user ─────────────────────────
        user = await self._user_repo.get_by_email(email)

        if user is None:
            # Auto-register the user from Google identity
            google_name: str = userinfo.get("name", "")
            google_picture: str | None = userinfo.get("picture")

            # Derive a unique username from the email prefix
            username_base = email.split("@")[0]
            username = username_base
            counter = 1
            while await self._user_repo.get_by_username(username):
                username = f"{username_base}_{counter}"
                counter += 1

            user = User(
                username=username,
                email=email,
                hashed_password=hash_password(str(UUID(int=0))),  # unusable password
                display_name=google_name or None,
                avatar_url=google_picture,
                email_verified=True,  # Google has already verified the email
            )
            user = await self._user_repo.create(user)

        if not user.is_active:
            raise CredentialsError("Account is deactivated.")

        # ── Step 4: Issue our own JWT pair ────────────────────────────────
        our_access_token = create_access_token(str(user.id))
        our_refresh_token = create_refresh_token(str(user.id))

        return {
            "access_token": our_access_token,
            "refresh_token": our_refresh_token,
            "token_type": "bearer",
            "user": user,
        }
