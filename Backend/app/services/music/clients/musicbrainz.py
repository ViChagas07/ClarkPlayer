"""
MusicBrainz API client — no authentication required.

Rate limit: 1 request/second (enforced by RateLimiter).
Used for: artist info, album metadata, release dates, countries, MBIDs.
"""

import json
import logging
from typing import Any

from app.core.redis import get_cache_redis
from app.services.music.ratelimit import rate_limited

logger = logging.getLogger("musicbrainz")

BASE_URL = "https://musicbrainz.org/ws/2/"
USER_AGENT = "MusicApp/1.0 (dev@email.com)"
CACHE_TTL = 86400  # 24 hours


class MusicBrainzClient:
    """Async client for the MusicBrainz Web Service v2."""

    def __init__(self, client):
        self.client = client

    async def _cached_get(self, cache_key: str, url: str, params: dict | None = None) -> dict | None:
        """Fetch with Redis caching and rate limiting."""
        redis = await get_cache_redis()
        cached = await redis.get(cache_key)
        if cached:
            return json.loads(cached)

        await rate_limited("musicbrainz")
        try:
            response = await self.client.get(
                url,
                params=params,
                headers={"User-Agent": USER_AGENT},
                timeout=15.0,
            )
            response.raise_for_status()
            data = response.json()
            await redis.setex(cache_key, CACHE_TTL, json.dumps(data))
            return data
        except Exception as exc:
            logger.warning("MusicBrainz request failed: %s %s", url, exc)
            return None

    async def search_artist(self, query: str, limit: int = 5) -> list[dict[str, Any]]:
        """Search for artists by name. Returns list of artist dicts with MBIDs."""
        cache_key = f"api:musicbrainz:artist_search:{query.lower()}:{limit}"
        data = await self._cached_get(
            cache_key,
            f"{BASE_URL}artist/",
            {"query": query, "fmt": "json", "limit": limit},
        )
        if not data:
            return []
        return data.get("artists", [])

    async def get_artist(self, mbid: str) -> dict[str, Any] | None:
        """Get detailed artist info by MusicBrainz ID."""
        cache_key = f"api:musicbrainz:artist:{mbid}"
        return await self._cached_get(
            cache_key,
            f"{BASE_URL}artist/{mbid}",
            {"fmt": "json", "inc": "tags+genres+url-rels"},
        )

    async def search_release(self, query: str, limit: int = 5) -> list[dict[str, Any]]:
        """Search for releases (albums/singles) by title and artist."""
        cache_key = f"api:musicbrainz:release_search:{query.lower()}:{limit}"
        data = await self._cached_get(
            cache_key,
            f"{BASE_URL}release/",
            {"query": query, "fmt": "json", "limit": limit},
        )
        if not data:
            return []
        return data.get("releases", [])

    async def get_release(self, mbid: str) -> dict[str, Any] | None:
        """Get detailed release info by MusicBrainz ID."""
        cache_key = f"api:musicbrainz:release:{mbid}"
        return await self._cached_get(
            cache_key,
            f"{BASE_URL}release/{mbid}",
            {"fmt": "json", "inc": "artists+labels+recordings+release-groups"},
        )

    async def search_recording(self, query: str, limit: int = 5) -> list[dict[str, Any]]:
        """Search for recordings (tracks) by title/artist."""
        cache_key = f"api:musicbrainz:recording_search:{query.lower()}:{limit}"
        data = await self._cached_get(
            cache_key,
            f"{BASE_URL}recording/",
            {"query": query, "fmt": "json", "limit": limit},
        )
        if not data:
            return []
        return data.get("recordings", [])

    async def get_recording(self, mbid: str) -> dict[str, Any] | None:
        """Get detailed recording info by MusicBrainz ID."""
        cache_key = f"api:musicbrainz:recording:{mbid}"
        return await self._cached_get(
            cache_key,
            f"{BASE_URL}recording/{mbid}",
            {"fmt": "json", "inc": "artists+releases+tags+genres"},
        )
