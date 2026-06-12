"""
Pydantic schemas for authentication endpoints — requests and responses.
"""

from pydantic import BaseModel, ConfigDict, EmailStr, Field

# Request schemas that'll be used as the expected body for the authentication-related endpoints. These include the fields required for user 
# registration, login, token refresh, logout, and the Google OIDC callback. The validation rules (e.g. min_length, max_length, regex patterns) 
# help ensure that incoming data is well-formed before it reaches the service layer.


class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, pattern=r"^[a-zA-Z0-9_]+$")
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    display_name: str | None = Field(None, max_length=100)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


class LogoutRequest(BaseModel):
    """Request body for logout — optionally provide refresh token to invalidate."""
    refresh_token: str | None = Field(
        None,
        description="Refresh token to invalidate (blacklist). If provided, the token will be added to a blacklist to prevent future use."
    )


class LogoutResponse(BaseModel):
    """Response returned after a successful logout."""
    message: str = "Logout successful"


class GoogleCallbackRequest(BaseModel):
    """Request body for the Google OIDC callback — the frontend POSTs the code here."""
    code: str = Field(..., description="Authorization code received from Google")
    redirect_uri: str | None = Field(
        None,
        description="The redirect_uri that was used in the Google auth request. "
                    "If omitted, the server falls back to GOOGLE_OIDC_REDIRECT_URI.",
    )


# Response schemas, whose function is mostly to provide type hints and documentation for the structure of the JSON responses returned by the
# authentication endpoints. These include the access token, refresh token, and user information returned after a successful login or Google 
# OIDC callback. 


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str | None = None
    token_type: str = "bearer"


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str  # UUID as string
    username: str
    email: str
    display_name: str | None = None
    avatar_url: str | None = None
    is_active: bool
    email_verified: bool = False
    provider: str | None = None
    provider_id: str | None = None


class GoogleCallbackResponse(BaseModel):
    """Response returned after a successful Google OIDC callback."""
    access_token: str
    refresh_token: str | None = None
    token_type: str = "bearer"
    user: UserResponse


# ── Email verification ────────────────────────────────────────────────────────


class VerifyEmailRequest(BaseModel):
    token: str = Field(..., description="Email verification token")


class VerifyEmailResponse(BaseModel):
    message: str = "Email verified successfully"


class ResendVerificationRequest(BaseModel):
    email: EmailStr


class ResendVerificationResponse(BaseModel):
    message: str = "Verification email sent if the account exists"


# ── Password reset ───────────────────────────────────────────────────────────


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ForgotPasswordResponse(BaseModel):
    message: str = "If the account exists, a password reset email has been sent"


class ResetPasswordRequest(BaseModel):
    token: str = Field(..., description="Password reset token")
    new_password: str = Field(..., min_length=8, max_length=128)


class ResetPasswordResponse(BaseModel):
    message: str = "Password reset successful"
