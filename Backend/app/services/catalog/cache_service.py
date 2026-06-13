"""
Redis caching layer for catalog entities (Redis optional — returns None on failure).

Key naming convention (consistent with :mod:`app.core.redis`):
    clark:catalog:{type}:{identifier}

TTL strategy (6h+ for all entities):
  - Artists:      21600s (6h)  -- low mutation rate
  - Albums:       21600s (6h)  -- moderate mutation
  - Tracks:       21600s (6h)  -- consistent but preview URLs may refresh
  - Genres:       43200s (12h) -- almost never change
  - Precomputed:  21600s (6h)  -- refreshed by background jobs
  - Search:       21600s (6h)  -- near-instant local DB, cache for hot queries
"""

import json
import logging

from app.core.redis import get_cache_redis

logger = logging.getLogger("catalog.cache")

_KEY_PREFIX = "clark:catalog"
_STATS_PREFIX = "clark:catalog:stats"

_CACHE_TTL: dict[str, int] = {
    "artist": 21600,
    "album": 21600,
    "track": 21600,
    "genres": 43200,
    "precomputed": 21600,
    "search": 21600,
}


def _cache_key(entity_type: str, *identifiers: str) -> str:
    """Build a consistent cache key."""
    parts = [_KEY_PREFIX, entity_type] + list(identifiers)
    return ":".join(parts)


async def _redis_get(key: str) -> str | None:
    """Get a key from Redis, returning None if Redis is unavailable."""
    try:
        redis = await get_cache_redis()
        return await redis.get(key)
    except Exception:
        return None


async def _redis_set(key: str, value: str, ttl: int) -> None:
    """Set a key in Redis, silently skipping if Redis is unavailable."""
    try:
        redis = await get_cache_redis()
        await redis.setex(key, ttl, value)
    except Exception:
        pass


async def _redis_delete(key: str) -> None:
    """Delete a key from Redis, silently skipping if Redis is unavailable."""
    try:
        redis = await get_cache_redis()
        await redis.delete(key)
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
    return ``None`` (cache miss) and setters silently skip.  The database
    remains the source of truth.
    """

    # ── Artists ────────────────────────────────────────────────────────────

    async def get_cached_artist(self, artist_id: str) -> dict | None:
        raw = await _redis_get(_cache_key("artist", artist_id))
        if raw:
            await _redis_incr(f"{_STATS_PREFIX}:hits")
            return json.loads(raw)  # type: ignore[no-any-return]
        await _redis_incr(f"{_STATS_PREFIX}:misses")
        return None

    async def set_cached_artist(self, artist_id: str, data: dict, ttl: int = 21600) -> None:
        key = _cache_key("artist", artist_id)
        await _redis_set(key, json.dumps(data), ttl)

    async def invalidate_artist(self, artist_id: str) -> None:
        await _redis_delete(_cache_key("artist", artist_id))

    # ── Albums ─────────────────────────────────────────────────────────────

    async def get_cached_album(self, album_id: str) -> dict | None:
        raw = await _redis_get(_cache_key("album", album_id))
        if raw:
            await _redis_incr(f"{_STATS_PREFIX}:hits")
            return json.loads(raw)  # type: ignore[no-any-return]
        await _redis_incr(f"{_STATS_PREFIX}:misses")
        return None

    async def set_cached_album(self, album_id: str, data: dict, ttl: int = 21600) -> None:
        key = _cache_key("album", album_id)
        await _redis_set(key, json.dumps(data), ttl)

    async def invalidate_album(self, album_id: str) -> None:
        await _redis_delete(_cache_key("album", album_id))

    # ── Tracks ─────────────────────────────────────────────────────────────

    async def get_cached_track(self, track_id: str) -> dict | None:
        raw = await _redis_get(_cache_key("track", track_id))
        if raw:
            await _redis_incr(f"{_STATS_PREFIX}:hits")
            return json.loads(raw)  # type: ignore[no-any-return]
        await _redis_incr(f"{_STATS_PREFIX}:misses")
        return None

    async def set_cached_track(self, track_id: str, data: dict, ttl: int = 21600) -> None:
        key = _cache_key("track", track_id)
        await _redis_set(key, json.dumps(data), ttl)

    async def invalidate_track(self, track_id: str) -> None:
        await _redis_delete(_cache_key("track", track_id))

    # ── Genres ─────────────────────────────────────────────────────────────

    async def get_cached_genres(self) -> list[dict] | None:
        raw = await _redis_get(_cache_key("genres"))
        if raw:
            await _redis_incr(f"{_STATS_PREFIX}:hits")
            return json.loads(raw)  # type: ignore[no-any-return]
        await _redis_incr(f"{_STATS_PREFIX}:misses")
        return None

    async def set_cached_genres(self, data: list[dict]) -> None:
        key = _cache_key("genres")
        await _redis_set(key, json.dumps(data), _CACHE_TTL["genres"])

    # ── Search ─────────────────────────────────────────────────────────────

    async def get_cached_search(self, query: str, limit: int, offset: int) -> dict | None:
        raw = await _redis_get(_cache_key("search", query, str(limit), str(offset)))
        if raw:
            await _redis_incr(f"{_STATS_PREFIX}:hits")
            return json.loads(raw)  # type: ignore[no-any-return]
        await _redis_incr(f"{_STATS_PREFIX}:misses")
        return None

    async def set_cached_search(
        self, query: str, limit: int, offset: int, data: dict, ttl: int = 21600
    ) -> None:
        key = _cache_key("search", query, str(limit), str(offset))
        await _redis_set(key, json.dumps(data), ttl)

    # ── Discovery ──────────────────────────────────────────────────────────

    async def get_cached_discovery(self, section: str) -> list[dict] | None:
        raw = await _redis_get(_cache_key("discovery", section))
        if raw:
            await _redis_incr(f"{_STATS_PREFIX}:hits")
            return json.loads(raw)  # type: ignore[no-any-return]
        await _redis_incr(f"{_STATS_PREFIX}:misses")
        return None

    async def set_cached_discovery(self, section: str, data: list[dict], ttl: int = 21600) -> None:
        key = _cache_key("discovery", section)
        await _redis_set(key, json.dumps(data), ttl)

    # ── Stats ──────────────────────────────────────────────────────────────

    async def get_cache_stats(self) -> dict[str, int]:
        """Return current hit / miss counts from Redis (zeros if Redis unavailable)."""
        hits_raw = await _redis_get(f"{_STATS_PREFIX}:hits") or "0"
        misses_raw = await _redis_get(f"{_STATS_PREFIX}:misses") or "0"
        return {
            "hits": int(hits_raw),
            "misses": int(misses_raw),
        }
