"""
iTunes Search API client — no authentication required.

Used for: high-resolution album covers, track previews (30s), artist images.
"""

import json
import logging
from typing import Any

from app.core.redis import get_cache_redis

logger = logging.getLogger("itunes")

BASE_URL = "https://itunes.apple.com/search"
LOOKUP_URL = "https://itunes.apple.com/lookup"
CACHE_TTL = 86400  # 24 hours


class ITunesClient:
    """Async client for the iTunes Search API."""

    def __init__(self, client):
        self.client = client

    async def _cached_get(self, cache_key: str, url: str, params: dict | None = None) -> dict | None:
        """Fetch with Redis caching."""
        redis = await get_cache_redis()
        cached = await redis.get(cache_key)
        if cached:
            return json.loads(cached)

        try:
            response = await self.client.get(
                url,
                params=params,
                timeout=15.0,
            )
            response.raise_for_status()
            data = response.json()
            await redis.setex(cache_key, CACHE_TTL, json.dumps(data))
            return data
        except Exception as exc:
            logger.warning("iTunes request failed: %s %s", url, exc)
            return None

    async def search(
        self,
        term: str,
        media: str = "music",
        entity: str | None = None,
        limit: int = 10,
        country: str = "US",
    ) -> list[dict[str, Any]]:
        """Search iTunes for music. Prefer this for album artwork."""
        cache_key = f"api:itunes:search:{term.lower()}:{media}:{entity}:{limit}:{country}"
        params: dict[str, Any] = {
            "term": term,
            "media": media,
            "limit": limit,
            "country": country,
        }
        if entity:
            params["entity"] = entity
        data = await self._cached_get(cache_key, BASE_URL, params)
        if not data:
            return []
        return data.get("results", [])

    async def get_cover_art(self, artist: str, album: str) -> str | None:
        """
        Get the highest-resolution album cover URL.
        Replace 100x100 with 600x600 or larger.
        """
        results = await self.search(
            term=f"{artist} {album}",
            entity="album",
            limit=3,
        )
        for result in results:
            artwork = result.get("artworkUrl100")
            if artwork:
                # Get higher resolution version
                return artwork.replace("100x100bb", "600x600bb")
        return None

    async def get_artist_image(self, artist: str) -> str | None:
        """Get high-quality artist image from iTunes."""
        results = await self.search(
            term=artist,
            entity="musicArtist",
            limit=3,
        )
        for result in results:
            if result.get("wrapperType") == "artist":
                return None  # iTunes doesn't return artist images directly in search
        # Try album search to get artist-adjacent artwork
        results = await self.search(
            term=artist,
            entity="album",
            limit=1,
        )
        if results:
            artwork = results[0].get("artworkUrl100")
            if artwork:
                return artwork.replace("100x100bb", "1200x1200bb")
        return None

    @staticmethod
    def get_best_artwork(artwork_url: str | None, size: int = 600) -> str | None:
        """Upgrade iTunes artwork URL to the requested size."""
        if not artwork_url:
            return None
        return artwork_url.replace("100x100bb", f"{size}x{size}bb").replace(
            "{w}x{h}bb", f"{size}x{size}bb"
        )
