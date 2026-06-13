"""
Redis caching layer for catalog entities.

Key naming convention (consistent with :mod:`app.core.redis`):
    clark:catalog:{type}:{identifier}

TTL strategy (aligned with :mod:`app.core.cache`):
  - Artists:      21600s (6h)   -- low mutation rate
  - Albums:       21600s (6h)   -- moderate mutation
  - Tracks:       21600s (6h)   -- consistent but preview URLs may refresh
  - Genres:       43200s (12h)  -- almost never change
  - Precomputed:  21600s (6h)   -- refreshed by background jobs
  - Search:       21600s (6h)   -- near-instant local DB, cache for hot queries
"""

import json
from typing import Any

from app.core.redis import get_cache_redis

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


class CatalogCacheService:
    """
    Redis caching layer for catalog entities.

    Tracks hit / miss counts via Redis ``INCR`` on ``clark:catalog:stats:hits``
    and ``clark:catalog:stats:misses``, providing visibility into cache
    effectiveness without an external monitoring system.
    """

    # ── Artists ────────────────────────────────────────────────────────────

    async def get_cached_artist(self, artist_id: str) -> dict | None:
        """Retrieve a cached artist by ID, or ``None`` on miss."""
        redis = await get_cache_redis()
        key = _cache_key("artist", artist_id)
        raw = await redis.get(key)
        if raw:
            await redis.incr(f"{_STATS_PREFIX}:hits")
            return json.loads(raw)  # type: ignore[no-any-return]
        await redis.incr(f"{_STATS_PREFIX}:misses")
        return None

    async def set_cached_artist(self, artist_id: str, data: dict, ttl: int = 21600) -> None:
        """Store an artist dict in cache with the given TTL."""
        redis = await get_cache_redis()
        key = _cache_key("artist", artist_id)
        await redis.setex(key, ttl, json.dumps(data))

    async def invalidate_artist(self, artist_id: str) -> None:
        """Remove an artist entry from cache."""
        redis = await get_cache_redis()
        await redis.delete(_cache_key("artist", artist_id))

    # ── Albums ─────────────────────────────────────────────────────────────

    async def get_cached_album(self, album_id: str) -> dict | None:
        """Retrieve a cached album by ID, or ``None`` on miss."""
        redis = await get_cache_redis()
        key = _cache_key("album", album_id)
        raw = await redis.get(key)
        if raw:
            await redis.incr(f"{_STATS_PREFIX}:hits")
            return json.loads(raw)  # type: ignore[no-any-return]
        await redis.incr(f"{_STATS_PREFIX}:misses")
        return None

    async def set_cached_album(self, album_id: str, data: dict, ttl: int = 21600) -> None:
        """Store an album dict in cache with the given TTL."""
        redis = await get_cache_redis()
        key = _cache_key("album", album_id)
        await redis.setex(key, ttl, json.dumps(data))

    async def invalidate_album(self, album_id: str) -> None:
        """Remove an album entry from cache."""
        redis = await get_cache_redis()
        await redis.delete(_cache_key("album", album_id))

    # ── Tracks ─────────────────────────────────────────────────────────────

    async def get_cached_track(self, track_id: str) -> dict | None:
        """Retrieve a cached track by ID, or ``None`` on miss."""
        redis = await get_cache_redis()
        key = _cache_key("track", track_id)
        raw = await redis.get(key)
        if raw:
            await redis.incr(f"{_STATS_PREFIX}:hits")
            return json.loads(raw)  # type: ignore[no-any-return]
        await redis.incr(f"{_STATS_PREFIX}:misses")
        return None

    async def set_cached_track(self, track_id: str, data: dict, ttl: int = 21600) -> None:
        """Store a track dict in cache with the given TTL."""
        redis = await get_cache_redis()
        key = _cache_key("track", track_id)
        await redis.setex(key, ttl, json.dumps(data))

    async def invalidate_track(self, track_id: str) -> None:
        """Remove a track entry from cache."""
        redis = await get_cache_redis()
        await redis.delete(_cache_key("track", track_id))

    # ── Genres ─────────────────────────────────────────────────────────────

    async def get_cached_genres(self) -> list[dict] | None:
        """Retrieve the cached genre list, or ``None`` on miss."""
        redis = await get_cache_redis()
        key = _cache_key("genres")
        raw = await redis.get(key)
        if raw:
            await redis.incr(f"{_STATS_PREFIX}:hits")
            return json.loads(raw)  # type: ignore[no-any-return]
        await redis.incr(f"{_STATS_PREFIX}:misses")
        return None

    async def set_cached_genres(self, data: list[dict]) -> None:
        """Store the full genre list in cache."""
        redis = await get_cache_redis()
        key = _cache_key("genres")
        await redis.setex(key, _CACHE_TTL["genres"], json.dumps(data))

    # ── Search ─────────────────────────────────────────────────────────────

    async def get_cached_search(self, query: str, limit: int, offset: int) -> dict | None:
        """Retrieve cached search results, or ``None`` on miss."""
        redis = await get_cache_redis()
        key = _cache_key("search", query, str(limit), str(offset))
        raw = await redis.get(key)
        if raw:
            await redis.incr(f"{_STATS_PREFIX}:hits")
            return json.loads(raw)  # type: ignore[no-any-return]
        await redis.incr(f"{_STATS_PREFIX}:misses")
        return None

    async def set_cached_search(
        self, query: str, limit: int, offset: int, data: dict, ttl: int = 21600
    ) -> None:
        """Store search results in cache with the given TTL."""
        redis = await get_cache_redis()
        key = _cache_key("search", query, str(limit), str(offset))
        await redis.setex(key, ttl, json.dumps(data))

    # ── Discovery ──────────────────────────────────────────────────────────

    async def get_cached_discovery(self, section: str) -> list[dict] | None:
        """Retrieve a cached discovery section, or ``None`` on miss."""
        redis = await get_cache_redis()
        key = _cache_key("discovery", section)
        raw = await redis.get(key)
        if raw:
            await redis.incr(f"{_STATS_PREFIX}:hits")
            return json.loads(raw)  # type: ignore[no-any-return]
        await redis.incr(f"{_STATS_PREFIX}:misses")
        return None

    async def set_cached_discovery(self, section: str, data: list[dict], ttl: int = 21600) -> None:
        """Store a discovery section in cache with the given TTL."""
        redis = await get_cache_redis()
        key = _cache_key("discovery", section)
        await redis.setex(key, ttl, json.dumps(data))

    # ── Stats ──────────────────────────────────────────────────────────────

    async def get_cache_stats(self) -> dict[str, int]:
        """Return current hit / miss counts from Redis."""
        redis = await get_cache_redis()
        hits_raw = await redis.get(f"{_STATS_PREFIX}:hits") or "0"
        misses_raw = await redis.get(f"{_STATS_PREFIX}:misses") or "0"
        return {
            "hits": int(hits_raw),
            "misses": int(misses_raw),
        }
