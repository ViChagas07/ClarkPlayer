"""
Redis caching layer for catalog entities (Redis optional — returns None on failure).

Uses :func:`app.core.cache_keys.make_cache_key` for consistent namespace keys.
"""

import json
import logging

from app.core.cache_keys import (
    CacheTTL,
    log_cache_hit,
    log_cache_invalidation,
    log_cache_miss,
    log_cache_set,
    make_cache_key,
    make_stats_key,
)
from app.core.redis import get_cache_redis

logger = logging.getLogger("catalog.cache")


async def _redis_get(key: str) -> str | None:
    """Get a key from Redis, returning None if Redis is unavailable."""
    try:
        redis = await get_cache_redis()
        value = await redis.get(key)
        if value is not None:
            log_cache_hit(key)
        else:
            log_cache_miss(key)
        return value
    except Exception:
        log_cache_miss(key)
        return None


async def _redis_set(key: str, value: str, ttl: int) -> None:
    """Set a key in Redis, silently skipping if Redis is unavailable."""
    try:
        redis = await get_cache_redis()
        await redis.setex(key, ttl, value)
        log_cache_set(key, ttl)
    except Exception:
        pass


async def _redis_delete(key: str) -> None:
    """Delete a key, silently skipping if Redis is unavailable."""
    try:
        redis = await get_cache_redis()
        await redis.delete(key)
        log_cache_invalidation(key)
    except Exception:
        pass


async def _redis_incr(key: str) -> None:
    """Increment a counter, silently skipping if Redis is unavailable."""
    try:
        redis = await get_cache_redis()
        await redis.incr(key)
    except Exception:
        pass


class CatalogCacheService:
    """
    Redis caching layer for catalog entities.

    **All Redis operations are optional** — if Redis is unavailable, getters
    return ``None`` (cache miss) and setters silently skip.  PostgreSQL
    remains the source of truth.

    All keys are built via :func:`make_cache_key` using the ``clarkplayer:``
    namespace, ensuring no collisions with other projects sharing the same
    Redis instance.
    """

    # ── Artists ────────────────────────────────────────────────────────────

    async def get_cached_artist(self, artist_id: str) -> dict | None:
        raw = await _redis_get(make_cache_key("artist", artist_id))
        if raw:
            await _redis_incr(make_stats_key("hits"))
            return json.loads(raw)  # type: ignore[no-any-return]
        await _redis_incr(make_stats_key("misses"))
        return None

    async def set_cached_artist(self, artist_id: str, data: dict, ttl: int = CacheTTL.ARTIST) -> None:
        await _redis_set(make_cache_key("artist", artist_id), json.dumps(data), ttl)

    async def invalidate_artist(self, artist_id: str) -> None:
        await _redis_delete(make_cache_key("artist", artist_id))

    # ── Albums ─────────────────────────────────────────────────────────────

    async def get_cached_album(self, album_id: str) -> dict | None:
        raw = await _redis_get(make_cache_key("album", album_id))
        if raw:
            await _redis_incr(make_stats_key("hits"))
            return json.loads(raw)  # type: ignore[no-any-return]
        await _redis_incr(make_stats_key("misses"))
        return None

    async def set_cached_album(self, album_id: str, data: dict, ttl: int = CacheTTL.ALBUM) -> None:
        await _redis_set(make_cache_key("album", album_id), json.dumps(data), ttl)

    async def invalidate_album(self, album_id: str) -> None:
        await _redis_delete(make_cache_key("album", album_id))

    # ── Tracks ─────────────────────────────────────────────────────────────

    async def get_cached_track(self, track_id: str) -> dict | None:
        raw = await _redis_get(make_cache_key("track", track_id))
        if raw:
            await _redis_incr(make_stats_key("hits"))
            return json.loads(raw)  # type: ignore[no-any-return]
        await _redis_incr(make_stats_key("misses"))
        return None

    async def set_cached_track(self, track_id: str, data: dict, ttl: int = CacheTTL.TRACK) -> None:
        await _redis_set(make_cache_key("track", track_id), json.dumps(data), ttl)

    async def invalidate_track(self, track_id: str) -> None:
        await _redis_delete(make_cache_key("track", track_id))

    # ── Genres ─────────────────────────────────────────────────────────────

    async def get_cached_genres(self) -> list[dict] | None:
        raw = await _redis_get(make_cache_key("genres"))
        if raw:
            await _redis_incr(make_stats_key("hits"))
            return json.loads(raw)  # type: ignore[no-any-return]
        await _redis_incr(make_stats_key("misses"))
        return None

    async def set_cached_genres(self, data: list[dict]) -> None:
        await _redis_set(make_cache_key("genres"), json.dumps(data), CacheTTL.GENRES)

    # ── Search ─────────────────────────────────────────────────────────────

    async def get_cached_search(self, query: str, limit: int, offset: int) -> dict | None:
        normalized_query = query.strip().lower()
        raw = await _redis_get(make_cache_key("search", normalized_query, str(limit), str(offset)))
        if raw:
            await _redis_incr(make_stats_key("hits"))
            return json.loads(raw)  # type: ignore[no-any-return]
        await _redis_incr(make_stats_key("misses"))
        return None

    async def set_cached_search(
        self, query: str, limit: int, offset: int, data: dict, ttl: int = CacheTTL.SEARCH
    ) -> None:
        normalized_query = query.strip().lower()
        await _redis_set(
            make_cache_key("search", normalized_query, str(limit), str(offset)),
            json.dumps(data),
            ttl,
        )

    # ── Discovery / Precomputed ────────────────────────────────────────────

    async def get_cached_discovery(self, section: str) -> list[dict] | None:
        raw = await _redis_get(make_cache_key("discovery", section))
        if raw:
            await _redis_incr(make_stats_key("hits"))
            return json.loads(raw)  # type: ignore[no-any-return]
        await _redis_incr(make_stats_key("misses"))
        return None

    async def set_cached_discovery(
        self, section: str, data: list[dict], ttl: int = CacheTTL.DISCOVERY
    ) -> None:
        await _redis_set(make_cache_key("discovery", section), json.dumps(data), ttl)

    # ── Trending ───────────────────────────────────────────────────────────

    async def get_cached_trending(self) -> dict | None:
        raw = await _redis_get(make_cache_key("trending"))
        if raw:
            return json.loads(raw)  # type: ignore[no-any-return]
        return None

    async def set_cached_trending(self, data: dict, ttl: int = CacheTTL.TRENDING) -> None:
        await _redis_set(make_cache_key("trending"), json.dumps(data), ttl)

    # ── Stats ──────────────────────────────────────────────────────────────

    async def get_cache_stats(self) -> dict[str, int]:
        """Return current hit / miss counts (zeros if Redis unavailable)."""
        hits_raw = await _redis_get(make_stats_key("hits")) or "0"
        misses_raw = await _redis_get(make_stats_key("misses")) or "0"
        return {"hits": int(hits_raw), "misses": int(misses_raw)}
