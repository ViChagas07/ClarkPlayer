"""
Last.fm API client — api_key auth.

Used for: similar artists, similar tracks, detailed genre tags,
global play counts, artist biography.
"""

import json
import logging
from typing import Any

from app.core.config import get_settings
from app.core.redis import get_cache_redis
from app.services.music.ratelimit import rate_limited

logger = logging.getLogger("lastfm")

BASE_URL = "https://ws.audioscrobbler.com/2.0/"
SIMILAR_ARTISTS_TTL = 43200  # 12 hours
ARTIST_INFO_TTL = 86400  # 24 hours
TRACK_INFO_TTL = 86400  # 24 hours


class LastFmClient:
    """Async client for the Last.fm API."""

    def __init__(self, client):
        self.client = client
        self._settings = get_settings()

    async def _cached_get(
        self,
        cache_key: str,
        params: dict[str, Any],
        ttl: int = ARTIST_INFO_TTL,
    ) -> dict | None:
        """Fetch with Redis caching and rate limiting."""
        redis = await get_cache_redis()
        cached = await redis.get(cache_key)
        if cached:
            return json.loads(cached)

        await rate_limited("lastfm")
        try:
            response = await self.client.get(
                BASE_URL,
                params=params,
                timeout=15.0,
            )
            response.raise_for_status()
            data = response.json()
            await redis.setex(cache_key, ttl, json.dumps(data))
            return data
        except Exception as exc:
            logger.warning("Last.fm request failed: %s %s", params, exc)
            return None

    def _base_params(self, method: str, **extra: Any) -> dict[str, Any]:
        return {
            "method": method,
            "api_key": self._settings.LASTFM_API_KEY,
            "format": "json",
            **extra,
        }

    async def get_artist_info(self, artist: str, mbid: str | None = None) -> dict[str, Any] | None:
        """Get detailed artist info including bio, tags, stats."""
        cache_key = f"api:lastfm:artist_info:{mbid or artist.lower()}"
        params = self._base_params("artist.getInfo", artist=artist)
        if mbid:
            params["mbid"] = mbid
        return await self._cached_get(cache_key, params, ttl=ARTIST_INFO_TTL)

    async def get_similar_artists(self, artist: str, mbid: str | None = None, limit: int = 10) -> list[dict[str, Any]]:
        """Get similar artists from Last.fm."""
        cache_key = f"api:lastfm:similar_artists:{mbid or artist.lower()}:{limit}"
        params = self._base_params("artist.getSimilar", artist=artist, limit=limit)
        if mbid:
            params["mbid"] = mbid
        data = await self._cached_get(cache_key, params, ttl=SIMILAR_ARTISTS_TTL)
        if not data:
            return []
        artists = data.get("similarartists", {})
        return artists.get("artist", [])

    async def get_top_tags(self, artist: str, mbid: str | None = None) -> list[dict[str, Any]]:
        """Get top tags (genres) for an artist from Last.fm."""
        cache_key = f"api:lastfm:top_tags:{mbid or artist.lower()}"
        params = self._base_params("artist.getTopTags", artist=artist)
        if mbid:
            params["mbid"] = mbid
        data = await self._cached_get(cache_key, params, ttl=ARTIST_INFO_TTL)
        if not data:
            return []
        tags = data.get("toptags", {})
        return tags.get("tag", [])

    async def get_track_info(self, artist: str, track: str, mbid: str | None = None) -> dict[str, Any] | None:
        """Get track info including playcount, listeners."""
        cache_key = f"api:lastfm:track_info:{mbid or f'{artist.lower()}:{track.lower()}'}"
        params = self._base_params("track.getInfo", artist=artist, track=track)
        if mbid:
            params["mbid"] = mbid
        return await self._cached_get(cache_key, params, ttl=TRACK_INFO_TTL)

    async def get_similar_tracks(self, artist: str, track: str, limit: int = 10) -> list[dict[str, Any]]:
        """Get similar tracks from Last.fm."""
        cache_key = f"api:lastfm:similar_tracks:{artist.lower()}:{track.lower()}:{limit}"
        params = self._base_params(
            "track.getSimilar", artist=artist, track=track, limit=limit
        )
        data = await self._cached_get(cache_key, params, ttl=SIMILAR_ARTISTS_TTL)
        if not data:
            return []
        tracks = data.get("similartracks", {})
        return tracks.get("track", [])

    async def search_artist(self, query: str, limit: int = 5) -> list[dict[str, Any]]:
        """Search Last.fm for artists."""
        cache_key = f"api:lastfm:artist_search:{query.lower()}:{limit}"
        params = self._base_params("artist.search", artist=query, limit=limit)
        data = await self._cached_get(cache_key, params, ttl=ARTIST_INFO_TTL)
        if not data:
            return []
        results = data.get("results", {})
        matches = results.get("artistmatches", {})
        return matches.get("artist", [])

    async def search_track(self, query: str, limit: int = 5) -> list[dict[str, Any]]:
        """Search Last.fm for tracks."""
        cache_key = f"api:lastfm:track_search:{query.lower()}:{limit}"
        params = self._base_params("track.search", track=query, limit=limit)
        data = await self._cached_get(cache_key, params, ttl=TRACK_INFO_TTL)
        if not data:
            return []
        results = data.get("results", {})
        matches = results.get("trackmatches", {})
        return matches.get("track", [])
