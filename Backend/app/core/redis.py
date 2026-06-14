"""
ClarkPlayer Redis client module — fully optional.

Pools are created lazily.  If ``REDIS_URL`` is missing, empty, or invalid,
the factory functions return ``None`` and every caller already handles that
gracefully (via try/except in the cache service and API clients).

Key naming convention:
  clarkplayer:{domain}:{identifier}
"""

from __future__ import annotations

import logging
from typing import TYPE_CHECKING

import redis.asyncio as aioredis

from app.core.config import get_settings

if TYPE_CHECKING:
    from redis.asyncio import Redis

logger = logging.getLogger("clarkplayer.redis")

# ── Lazy pool singletons (None until first successful connection) ──

_session_pool: aioredis.ConnectionPool | None = None
_cache_pool: aioredis.ConnectionPool | None = None
_ratelimit_pool: aioredis.ConnectionPool | None = None
_pools_initialized: bool = False


def _get_redis_url_for_db(db: int) -> str | None:
    """
    Build a Redis URL for *db*, or return ``None`` if Redis is not configured.

    Validates the URL has a recognised scheme (``redis://``, ``rediss://``,
    or ``unix://``).  Returns ``None`` for empty / missing / placeholder URLs
    so callers can fall back to PostgreSQL-only operation.
    """
    settings = get_settings()
    raw = (settings.REDIS_URL or "").strip()
    if not raw:
        logger.info("REDIS_URL is empty — Redis disabled, using PostgreSQL only.")
        return None

    # Validate scheme
    if not any(raw.startswith(scheme) for scheme in ("redis://", "rediss://", "unix://")):
        logger.warning(
            "REDIS_URL has invalid scheme (must be redis://, rediss://, or unix://). "
            "Redis disabled, using PostgreSQL only."
        )
        return None

    base = raw.rstrip("/")
    return f"{base}/{db}"


def _init_pools() -> None:
    """Initialise Redis connection pools (idempotent, safe to call multiple times)."""
    global _session_pool, _cache_pool, _ratelimit_pool, _pools_initialized
    if _pools_initialized:
        return
    _pools_initialized = True

    settings = get_settings()

    url_0 = _get_redis_url_for_db(settings.REDIS_SESSION_DB)
    url_1 = _get_redis_url_for_db(settings.REDIS_CACHE_DB)
    url_2 = _get_redis_url_for_db(settings.REDIS_RATELIMIT_DB)

    if url_0:
        try:
            _session_pool = aioredis.ConnectionPool.from_url(
                url_0, max_connections=20, decode_responses=True,
            )
        except Exception as exc:
            logger.warning("Failed to create Redis session pool: %s", exc)

    if url_1:
        try:
            _cache_pool = aioredis.ConnectionPool.from_url(
                url_1, max_connections=20, decode_responses=True,
            )
        except Exception as exc:
            logger.warning("Failed to create Redis cache pool: %s", exc)

    if url_2:
        try:
            _ratelimit_pool = aioredis.ConnectionPool.from_url(
                url_2, max_connections=10, decode_responses=True,
            )
        except Exception as exc:
            logger.warning("Failed to create Redis ratelimit pool: %s", exc)


# ── Factory functions ────────────────────────────────────────────────


async def get_session_redis() -> Redis | None:
    """Return a Redis client for session storage, or ``None`` if unavailable."""
    _init_pools()
    if _session_pool is None:
        return None
    return aioredis.Redis(connection_pool=_session_pool)


async def get_cache_redis() -> Redis | None:
    """Return a Redis client for caching, or ``None`` if unavailable."""
    _init_pools()
    if _cache_pool is None:
        return None
    return aioredis.Redis(connection_pool=_cache_pool)


async def get_ratelimit_redis() -> Redis | None:
    """Return a Redis client for rate-limiting, or ``None`` if unavailable."""
    _init_pools()
    if _ratelimit_pool is None:
        return None
    return aioredis.Redis(connection_pool=_ratelimit_pool)


# ── Convenience ──────────────────────────────────────────────────────


def redis_available() -> bool:
    """Return ``True`` if Redis is configured and pools were created successfully."""
    _init_pools()
    return _cache_pool is not None
