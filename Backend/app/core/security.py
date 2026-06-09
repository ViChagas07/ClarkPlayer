"""
Security utilities — JWT (signing), JWE (encryption), and password hashing.

-   JWT tokens are **signed** with HS256 via ``joserfc``.
-   JWE tokens are **encrypted** — useful for payloads that must remain
    confidential (e.g. backup data, account-recovery payloads).
-   Passwords are hashed with bcrypt via the ``bcrypt`` package directly
    (``passlib`` is abandoned and incompatible with bcrypt >= 4.0).

``joserfc`` is the actively maintained successor to ``authlib.jose``.
"""

import json
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any

from joserfc import jwe, jwt, jwk
from joserfc.errors import BadSignatureError, DecodeError
from passlib.context import CryptContext

from app.core.config import get_settings

# Password hashing 

_pwd_context = CryptContext(schemes=get_settings().PASSWORD_HASH_SCHEMES, deprecated="auto")

# Functions for hashing and verifying passwords, using the configured schemes (bcrypt by default).
def hash_password(plain: str) -> str:
    """Return a bcrypt hash of *plain*."""
    return _pwd_context.hash(plain)

# Verify a plaintext password against a stored hash, returning True if they match.
def verify_password(plain: str, hashed: str) -> bool:
    """Return ``True`` when *plain* matches the stored *hashed* value."""
    return _pwd_context.verify(plain, hashed)


# JWT helpers 

_settings = get_settings()

# 
def _jwt_key() -> jwk.OctKey:
    """Return the symmetric key for HS256 signing / verification."""
    return jwk.OctKey.import_key(_settings.JWT_SECRET_KEY.encode("utf-8"))


def _now() -> datetime:
    return datetime.now(timezone.utc)

# Manual expiration validation since joserfc does not auto-validate the exp claim.
def _validate_exp(payload: dict[str, Any]) -> None:
    """Manually validate the ``exp`` claim (joserfc does not auto-validate it)."""
    exp = payload.get("exp")
    if exp is not None and _now().timestamp() > exp:
        from app.core.exceptions import TokenExpiredError
        raise TokenExpiredError()

# JWT (JSON Web Token) helpers for creating and verifying access and refresh tokens.
def create_access_token(subject: str, extra_claims: dict[str, Any] | None = None) -> str:
    """Create and sign a JWT access token for *subject* (user UUID)."""
    header = {"alg": _settings.JWT_ALGORITHM}
    payload = {
        "iss": _settings.APP_NAME,
        "sub": subject,
        "jti": str(uuid.uuid4()),  # JWT ID for token blacklisting
        "iat": int(_now().timestamp()),
        "exp": int(
            (_now() + timedelta(minutes=_settings.ACCESS_TOKEN_EXPIRE_MINUTES)).timestamp()
        ),
        "type": "access",
    }
    if extra_claims:
        payload.update(extra_claims)

    return jwt.encode(header, payload, _jwt_key())

# Similar to create_access_token but with a longer expiration and "type" claim set to "refresh".
def create_refresh_token(subject: str, extra_claims: dict[str, Any] | None = None) -> str:
    """Create and sign a JWT refresh token for *subject* (user UUID)."""
    header = {"alg": _settings.JWT_ALGORITHM}
    payload = {
        "iss": _settings.APP_NAME,
        "sub": subject,
        "jti": str(uuid.uuid4()),  # JWT ID for token blacklisting
        "iat": int(_now().timestamp()),
        "exp": int(
            (_now() + timedelta(days=_settings.REFRESH_TOKEN_EXPIRE_DAYS)).timestamp()
        ),
        "type": "refresh",
    }
    if extra_claims:
        payload.update(extra_claims)

    return jwt.encode(header, payload, _jwt_key())

# Functions for decoding and validating JWT access and refresh tokens, ensuring the signature is valid, the token has not expired, and the 
# "type" claim matches the expected token type.
def decode_access_token(token: str) -> dict[str, Any]:
    """
    Verify the JWT signature and return the claims dict.

    Raises :class:`TokenExpiredError` if the token has expired,
    :class:`TokenInvalidError` on signature / decode failures.
    """
    try:
        decoded = jwt.decode(token, _jwt_key())
    except (BadSignatureError, DecodeError, ValueError) as exc:
        from app.core.exceptions import TokenInvalidError
        raise TokenInvalidError(str(exc)) from exc

    _validate_exp(decoded.claims)

    if decoded.claims.get("type") != "access":
        from app.core.exceptions import TokenInvalidError
        raise TokenInvalidError("Token is not an access token.")

    return decoded.claims

# Similar to decode_access_token but checks that the "type" claim is "refresh".
def decode_refresh_token(token: str) -> dict[str, Any]:
    """Verify and decode a JWT refresh token."""
    try:
        decoded = jwt.decode(token, _jwt_key())
    except (BadSignatureError, DecodeError, ValueError) as exc:
        from app.core.exceptions import TokenInvalidError
        raise TokenInvalidError(str(exc)) from exc

    _validate_exp(decoded.claims)

    if decoded.claims.get("type") != "refresh":
        from app.core.exceptions import TokenInvalidError
        raise TokenInvalidError("Token is not a refresh token.")

    return decoded.claims

# Unsafe decoding functions that extract claims without verifying the signature or validating expiration, useful for metadata extraction 
# (e.g. jti - JWT ID) before full validation.
def decode_token_unsafe(token: str) -> dict[str, Any] | None:
    """
    Decode a token without signature verification (for extracting metadata).
    
    This is useful for extracting the jti before validation, but should NOT
    be used for authentication decisions.
    
    Returns None if the token cannot be parsed.
    """
    try:
        # Decode without verification - only extracts payload
        decoded = jwt.decode(token, _jwt_key())
        return decoded.claims
    except Exception:
        return None

# Helper functions to extract specific claims (exp, jti, sub) from a token without full validation, using the unsafe decoder. These can be used
# for things like token blacklisting (jti) or checking expiration without verifying the signature (e.g. for cleanup tasks), but should not be
# used for authentication decisions since they do not verify the integrity of the token.

def get_token_expiry(token: str) -> datetime | None:
    """Extract the expiration time from a token without full validation."""
    claims = decode_token_unsafe(token)
    if claims and "exp" in claims:
        return datetime.fromtimestamp(claims["exp"], tz=timezone.utc)
    return None


def get_token_jti(token: str) -> str | None:
    """Extract the JWT ID from a token without full validation."""
    claims = decode_token_unsafe(token)
    return claims.get("jti") if claims else None


def get_token_subject(token: str) -> str | None:
    """Extract the subject (user ID) from a token without full validation."""
    claims = decode_token_unsafe(token)
    return claims.get("sub") if claims else None


# JWE (JSON Web Encryption) 

_jwe_key: jwk.RSAKey | None = None

# Helper function to get or generate the RSA key pair used for JWE encryption. It first tries to load the private key from the environment or a
# file, and if not found, it generates a new 2048-bit RSA key pair for development purposes. The key is cached in the module-level variable 
# _jwe_key to avoid regenerating it on every call.
def _get_jwe_key() -> jwk.RSAKey:
    """Return (or generate) the RSA key pair used for JWE encryption."""
    global _jwe_key
    if _jwe_key is not None:
        return _jwe_key

    # Try loading from environment / file first.
    private_pem = _settings._JWE_PRIVATE_KEY_PEM
    if private_pem:
        _jwe_key = jwk.RSAKey.import_key(private_pem)
    else:
        # Generate a fresh 2048-bit RSA key pair for development.
        _jwe_key = jwk.generate_key("RSA", 2048, private=True)
        assert isinstance(_jwe_key, jwk.RSAKey)
    return _jwe_key

# Function to encrypt a payload dict into a JWE compact serialization string, using RSA-OAEP for key encryption and A256GCM for content 
# encryption.

def encrypt_payload(payload: dict[str, Any]) -> str:
    """
    Encrypt *payload* into a JWE compact serialisation.

    Uses RSA-OAEP for key encryption and A256GCM for content encryption.
    """
    rsa_key = _get_jwe_key()
    # Derive the public half for encryption
    public_dict = rsa_key.as_dict(is_private=False)
    public_key = jwk.RSAKey.import_key(public_dict)

    protected = {"alg": "RSA-OAEP", "enc": "A256GCM"}
    payload_bytes = json.dumps(payload).encode("utf-8")
    return jwe.encrypt_compact(protected, payload_bytes, public_key)


def decrypt_token(token: str) -> dict[str, Any]:
    """Decrypt a JWE token and return its payload as a Python dict."""
    rsa_key = _get_jwe_key()
    decoded = jwe.decrypt_compact(token, rsa_key)
    return json.loads(decoded.plaintext)


# Re-export errors so callers can import from one place. Basically, all of this module is the "security" module, so it makes sense to have a 
# single import path for all related functionality and errors.
__all__ = [
    "hash_password",
    "verify_password",
    "create_access_token",
    "create_refresh_token",
    "decode_access_token",
    "decode_refresh_token",
    "decode_token_unsafe",
    "get_token_expiry",
    "get_token_jti",
    "get_token_subject",
    "encrypt_payload",
    "decrypt_token",
    "BadSignatureError",
    "DecodeError",
]
