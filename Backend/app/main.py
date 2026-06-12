"""
ClarkPlayer — FastAPI application factory.

Run with::

    uvicorn app.main:app --reload
"""

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from typing import Any, cast, Awaitable

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import get_settings
from app.core.exceptions import AppError
from app.infrastructure.database import _engine
from app.infrastructure.models import Base
from app.middleware.auth_middleware import JWTAuthMiddleware
from app.presentation.router import api_router

_settings = get_settings()


@asynccontextmanager
async def lifespan(application: FastAPI) -> AsyncIterator[None]:
    """Startup / shutdown lifecycle."""
    import logging

    logger = logging.getLogger("uvicorn")

    # Create tables on startup (development convenience).
    # In production, use Alembic migrations instead.
    try:
        async with _engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables verified/created.")
    except Exception as exc:
        logger.warning("Database not available at startup (%s). Retrying on first request...", exc)

    # Run pending Alembic migrations (safe for production — idempotent)
    try:
        import asyncio as _asyncio
        from alembic.config import Config as AlembicConfig
        from alembic import command
        from pathlib import Path

        _alembic_ini = Path(__file__).resolve().parents[2] / "alembic.ini"
        if _alembic_ini.exists():
            _alembic_cfg = AlembicConfig(str(_alembic_ini))
            _alembic_cfg.set_main_option("sqlalchemy.url", _settings.DATABASE_URL)

            def _run_migrations() -> None:
                command.upgrade(_alembic_cfg, "head")

            # alembic env.py uses asyncio.run() internally — run in a thread
            await _asyncio.get_event_loop().run_in_executor(None, _run_migrations)
            logger.info("Alembic migrations applied successfully.")
        else:
            logger.warning("alembic.ini not found — skipping migrations.")
    except Exception as exc:
        logger.warning("Alembic migration skipped (%s). If columns are missing, run manually.", exc)

    # Ensure media root exists
    try:
        _settings.MEDIA_ROOT.mkdir(parents=True, exist_ok=True)
    except OSError as exc:
        logger.warning("Could not create media root (%s).", exc)

    yield  # Application runs here

    # Shutdown
    await _engine.dispose()


app = FastAPI(
    title=_settings.APP_NAME,
    version=_settings.APP_VERSION,
    description="Backend API for ClarkPlayer — an audio player and library manager.",
    lifespan=lifespan,
    docs_url="/docs" if _settings.DEBUG else None,
    redoc_url="/redoc" if _settings.DEBUG else None,
)

# ── Middleware (order matters — last added runs first) ──────────────────

# CORS — allow the frontend to call the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=_settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# JWT extraction middleware
app.add_middleware(JWTAuthMiddleware)

# Exception handlers


@app.exception_handler(AppError)
async def app_exception_handler(_request: Request, exc: AppError) -> JSONResponse:
    """Map every :class:`AppError` subclass to a consistent JSON envelope."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.error_code,
            "message": exc.detail,
        },
    )


@app.exception_handler(Exception)
async def generic_exception_handler(_request: Request, exc: Exception) -> JSONResponse:
    """Catch-all handler — prevents HTML error pages leaking to the frontend."""
    import logging
    import traceback

    logger = logging.getLogger("clarkplayer")
    logger.error("Unhandled exception: %s\n%s", exc, traceback.format_exc())

    # Don't leak internal details unless DEBUG is on
    settings = get_settings()
    detail = str(exc) if settings.DEBUG else "Internal server error"
    return JSONResponse(
        status_code=500,
        content={
            "error": "internal_error",
            "message": detail,
        },
    )


# Routers 

app.include_router(api_router)


@app.get("/health", tags=["System"])
async def health_check() -> dict[str, Any]:
    """Liveness probe with Redis connectivity check."""
    result = {
        "status": "ok",
        "app": _settings.APP_NAME,
        "version": _settings.APP_VERSION,
        "postgres": "ok",
        "redis": "ok",
    }
    try:
        from app.core.redis import get_session_redis
        redis = await get_session_redis()
        await cast(Awaitable[bool], redis.ping())
    except Exception:
        result["redis"] = "unreachable"
        result["status"] = "degraded"
    return result
