"""
Centralized cache key builder for ClarkPlayer.

Ensures every Redis key uses the ``clarkplayer:`` namespace so multiple
projects can safely share a Redis instance without key collisions.

Usage::

    from app.core.cache_keys import make_cache_key

    key = make_cache_key("artist", artist_id)
    # → "clarkplayer:catalog:artist:abc-123"

    key = make_cache_key("genres")
    # → "clarkplayer:catalog:genres"

Standardised TTL policy (seconds):

    ==============  ===========  =============
    Entity           TTL          Rationale
    ==============  ===========  =============
    Artists          21600 (6h)   Low mutation
    Albums           21600 (6h)   Moderate mutation
    Tracks           21600 (6h)   Previews may refresh
    Genres           43200 (12h)  Rarely change
    Discovery         3600 (1h)   Refreshed by scheduler
    Trending          3600 (1h)   Refreshed by scheduler
    Search            1800 (30m)  User expects fresh results
    ==============  ===========  =============
"""

from __future__ import annotations

import logging
from functools import lru_cache

from app.core.config import get_settings

logger = logging.getLogger("clarkplayer.cache")


@lru_cache
def _namespace() -> str:
    """Return the cache namespace from configuration."""
    settings = get_settings()
    return getattr(settings, "CACHE_NAMESPACE", "clarkplayer")


# ── Standardised TTLs ─────────────────────────────────────────────────


class CacheTTL:
    """Standard TTL constants for every cache domain."""

    ARTIST: int = 21600       # 6 hours
    ALBUM: int = 21600        # 6 hours
    TRACK: int = 21600        # 6 hours
    GENRES: int = 43200       # 12 hours
    GENRE_COVERS: int = 86400 # 24 hours (genre covers change once a day)
    DISCOVERY: int = 3600     # 1 hour
    TRENDING: int = 3600      # 1 hour
    SEARCH: int = 1800        # 30 minutes
    RECENTLY_PLAYED: int = 60  # 1 minute (frequently updated)
    STATIC: int = 86400        # 24 hours (rarely-changing data)


# ── Key builder ───────────────────────────────────────────────────────


def make_cache_key(entity_type: str, *identifiers: str) -> str:
    """
    Build a namespaced cache key.

    All keys follow the pattern::

        {namespace}:catalog:{entity_type}:{identifiers...}

    Examples::

        >>> make_cache_key("artist", "abc-123")
        "clarkplayer:catalog:artist:abc-123"

        >>> make_cache_key("genres")
        "clarkplayer:catalog:genres"

        >>> make_cache_key("search", "taylor swift", "20", "0")
        "clarkplayer:catalog:search:taylor swift:20:0"
    """
    ns = _namespace()
    parts = [ns, "catalog", entity_type] + list(identifiers)
    return ":".join(parts)


def make_stats_key(metric: str) -> str:
    """Build a namespaced stats key (hit/miss counters)."""
    ns = _namespace()
    return f"{ns}:catalog:stats:{metric}"


# ── Cache logging helpers ─────────────────────────────────────────────


def log_cache_hit(key: str) -> None:
    """Log a cache HIT event."""
    logger.debug("Cache HIT  | key=%s", key)


def log_cache_miss(key: str) -> None:
    """Log a cache MISS event."""
    logger.debug("Cache MISS | key=%s", key)


def log_cache_set(key: str, ttl: int) -> None:
    """Log a cache SET event."""
    logger.debug("Cache SET  | key=%s ttl=%ds", key, ttl)


def log_cache_invalidation(key: str) -> None:
    """Log a cache INVALIDATION event."""
    logger.debug("Cache INV  | key=%s", key)
