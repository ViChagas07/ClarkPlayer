"""
Centralised application configuration loaded from environment variables.

Uses `pydantic-settings`-style pattern (plain Pydantic `BaseSettings` replacement
via `os.getenv`) to keep the dependency footprint small.
"""

import os
from functools import lru_cache
from pathlib import Path
from typing import Literal

from dotenv import load_dotenv

# Load a .env file sitting next to this config module (project root).
_ENV_PATH = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(dotenv_path=_ENV_PATH)


class Settings:
    """Immutable application settings loaded from environment variables."""

    # ── Application ──────────────────────────────────────────────────────
    APP_NAME: str = "ClarkPlayer"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    ENVIRONMENT: Literal["development", "staging", "production"] = os.getenv(
        "ENVIRONMENT", "development"
    )  # type: ignore[assignment]

    # ── Server ───────────────────────────────────────────────────────────
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))

    # ── Database ─────────────────────────────────────────────────────────
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql+asyncpg://postgres:Dbs171920@localhost:5432/ClarkPlayer",
    )
    DATABASE_ECHO: bool = os.getenv("DATABASE_ECHO", "false").lower() == "true"

    # ── Auth / JWT ───────────────────────────────────────────────────────
    JWT_SECRET_KEY: str = os.getenv(
        "JWT_SECRET_KEY",
        "clarkplayer-dev-secret-change-in-production",
    )
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(
        os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30")
    )
    REFRESH_TOKEN_EXPIRE_DAYS: int = int(
        os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7")
    )

    # ── Redis ─────────────────────────────────────────────────────────────
    REDIS_URL: str = os.getenv(
        "REDIS_URL",
        "redis://localhost:6379/0",
    )
    REDIS_PASSWORD: str = os.getenv("REDIS_PASSWORD", "")
    REDIS_SESSION_DB: int = int(os.getenv("REDIS_SESSION_DB", "0"))
    REDIS_CACHE_DB: int = int(os.getenv("REDIS_CACHE_DB", "1"))
    REDIS_RATELIMIT_DB: int = int(os.getenv("REDIS_RATELIMIT_DB", "2"))

    # ── JWE (JSON Web Encryption) ────────────────────────────────────────
    # RSA key pair for JWE. In production use proper key management.
    _JWE_PRIVATE_KEY_PEM: str | None = os.getenv("JWE_PRIVATE_KEY_PEM")
    _JWE_PUBLIC_KEY_PEM: str | None = os.getenv("JWE_PUBLIC_KEY_PEM")

    # ── Password hashing ─────────────────────────────────────────────────
    BCRYPT_ROUNDS: int = 12
    PASSWORD_HASH_SCHEMES: list[str] = ["bcrypt"]

    # ── File storage ─────────────────────────────────────────────────────
    MEDIA_ROOT: Path = Path(
        os.getenv("MEDIA_ROOT", str(Path(__file__).resolve().parents[3] / "media"))
    )
    MAX_UPLOAD_SIZE_MB: int = int(os.getenv("MAX_UPLOAD_SIZE_MB", "500"))
    ALLOWED_AUDIO_EXTENSIONS: set[str] = {
        ".mp3",
        ".flac",
        ".wav",
        ".aac",
        ".ogg",
        ".wma",
        ".m4a",
        ".opus",
    }

    # ── Backup ───────────────────────────────────────────────────────────
    BACKUP_ENCRYPTION_ENABLED: bool = (
        os.getenv("BACKUP_ENCRYPTION_ENABLED", "true").lower() == "true"
    )

    # ── CORS ─────────────────────────────────────────────────────────────
    CORS_ORIGINS: list[str] = os.getenv("CORS_ORIGINS", "*").split(",")

    # ── Google OIDC ──────────────────────────────────────────────────────
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "")
    GOOGLE_CLIENT_SECRET: str = os.getenv("GOOGLE_CLIENT_SECRET", "")
    GOOGLE_OIDC_REDIRECT_URI: str = os.getenv(
        "GOOGLE_OIDC_REDIRECT_URI", "http://localhost:3000/auth/callback"
    )
    GOOGLE_DISCOVERY_URL: str = "https://accounts.google.com/.well-known/openid-configuration"

    # ── Music Metadata APIs ──────────────────────────────────────────────
    SPOTIFY_CLIENT_ID: str = os.getenv("SPOTIFY_CLIENT_ID", "")
    SPOTIFY_CLIENT_SECRET: str = os.getenv("SPOTIFY_CLIENT_SECRET", "")
    GENIUS_ACCESS_TOKEN: str = os.getenv("GENIUS_ACCESS_TOKEN", "")
    GENIUS_CLIENT_ACCESS_TOKEN: str = os.getenv("GENIUS_CLIENT_ACCESS_TOKEN", "")
    LASTFM_API_KEY: str = os.getenv("LASTFM_API_KEY", "")
    LASTFM_SHARED_SECRET: str = os.getenv("LASTFM_SHARED_SECRET", "")

    # ── Resend transactional email ─────────────────────────────────────────
    RESEND_API_KEY: str = os.getenv("RESEND_API_KEY", "")
    RESEND_FROM: str = os.getenv("RESEND_FROM", "onboarding@resend.dev")
    EMAIL_VERIFICATION_TOKEN_EXPIRE_MINUTES: int = int(
        os.getenv("EMAIL_VERIFICATION_TOKEN_EXPIRE_MINUTES", "60")
    )
    PASSWORD_RESET_TOKEN_EXPIRE_MINUTES: int = int(
        os.getenv("PASSWORD_RESET_TOKEN_EXPIRE_MINUTES", "15")
    )
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")


@lru_cache
def get_settings() -> Settings:
    """Return a cached Settings singleton."""
    return Settings()
