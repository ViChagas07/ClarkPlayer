"""
Spotify API client — OAuth2 Client Credentials Flow.

Token cached in Redis with 3500s TTL.
Used for: popularity, audio features (BPM, energy, danceability, key, valence),
genre tags, related artists, discography.
"""

import json
import logging
from typing import Any

import httpx

from app.core.config import get_settings
from app.core.redis import get_cache_redis

logger = logging.getLogger("spotify")

SPOTIFY_ACCOUNTS_URL = "https://accounts.spotify.com/api/token"
SPOTIFY_API_URL = "https://api.spotify.com/v1"

# Cache TTLs
TOKEN_TTL = 3500
ARTIST_TTL = 86400
AUDIO_FEATURES_TTL = 604800
RELATED_ARTISTS_TTL = 43200


class SpotifyClient:
    """Async client for the Spotify Web API with token caching."""

    def __init__(self, client: httpx.AsyncClient) -> None:
        self.client = client
        self._settings = get_settings()

    async def _get_token(self) -> str | None:
        """Get a cached Spotify access token or fetch a new one (Redis optional)."""
        cache_key = "api:spotify:token"

        # Try Redis cache (non-critical)
        try:
            redis = await get_cache_redis()
            cached = await redis.get(cache_key)
            if cached:
                return cached  # type: ignore[no-any-return]
        except Exception:
            pass

        try:
            response = await self.client.post(
                SPOTIFY_ACCOUNTS_URL,
                data={
                    "grant_type": "client_credentials",
                    "client_id": self._settings.SPOTIFY_CLIENT_ID,
                    "client_secret": self._settings.SPOTIFY_CLIENT_SECRET,
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"},
                timeout=15.0,
            )
            response.raise_for_status()
            token_data = response.json()
            access_token = token_data.get("access_token")
            if access_token:
                try:
                    redis = await get_cache_redis()
                    await redis.setex(cache_key, TOKEN_TTL, access_token)
                except Exception:
                    pass
                return access_token  # type: ignore[no-any-return]
        except Exception as exc:
            logger.warning("Spotify token request failed: %s", exc)
        return None

    async def _auth_headers(self) -> dict[str, str]:
        """Get authorization headers with a valid token."""
        token = await self._get_token()
        if not token:
            raise RuntimeError("Could not obtain Spotify access token")
        return {"Authorization": f"Bearer {token}"}

    async def _cached_get(
        self,
        cache_key: str,
        url: str,
        ttl: int = ARTIST_TTL,
        params: dict[str, Any] | None = None,
    ) -> dict[str, Any] | None:
        """Fetch with Redis caching (Redis optional — falls back to direct API call)."""
        # Try Redis cache (non-critical)
        try:
            redis = await get_cache_redis()
            cached = await redis.get(cache_key)
            if cached:
                return json.loads(cached)  # type: ignore[no-any-return]
        except Exception:
            pass

        try:
            headers = await self._auth_headers()
            response = await self.client.get(
                url,
                params=params,
                headers=headers,
                timeout=15.0,
            )
            if response.status_code == 401:
                # Token expired — clear and retry once
                await self._get_token()
                headers = await self._auth_headers()
                response = await self.client.get(
                    url, params=params, headers=headers, timeout=15.0
                )
            response.raise_for_status()
            data = response.json()
            # Try to cache (non-critical)
            try:
                redis = await get_cache_redis()
                await redis.setex(cache_key, ttl, json.dumps(data))
            except Exception:
                pass
            return data  # type: ignore[no-any-return]
        except Exception as exc:
            logger.warning("Spotify request failed: %s %s", url, exc)
            return None

    async def search_artist(self, query: str, limit: int = 5) -> dict[str, Any] | None:
        """Search Spotify for artists."""
        cache_key = f"api:spotify:artist_search:{query.lower()}:{limit}"
        return await self._cached_get(
            cache_key,
            f"{SPOTIFY_API_URL}/search",
            params={"q": query, "type": "artist", "limit": limit},
            ttl=ARTIST_TTL,
        )

    async def search_track(self, query: str, limit: int = 5) -> dict[str, Any] | None:
        """Search Spotify for tracks."""
        cache_key = f"api:spotify:track_search:{query.lower()}:{limit}"
        return await self._cached_get(
            cache_key,
            f"{SPOTIFY_API_URL}/search",
            params={"q": query, "type": "track", "limit": limit},
            ttl=ARTIST_TTL,
        )

    async def get_artist(self, spotify_id: str) -> dict[str, Any] | None:
        """Get full artist profile from Spotify."""
        cache_key = f"api:spotify:artist:{spotify_id}"
        return await self._cached_get(
            cache_key,
            f"{SPOTIFY_API_URL}/artists/{spotify_id}",
            ttl=ARTIST_TTL,
        )

    async def get_artist_top_tracks(self, spotify_id: str, market: str = "US") -> list[dict[str, Any]]:
        """Get an artist's top tracks by market."""
        cache_key = f"api:spotify:top_tracks:{spotify_id}:{market}"
        data = await self._cached_get(
            cache_key,
            f"{SPOTIFY_API_URL}/artists/{spotify_id}/top-tracks",
            params={"market": market},
            ttl=ARTIST_TTL,
        )
        if data:
            return data.get("tracks", [])  # type: ignore[no-any-return]
        return []

    async def get_related_artists(self, spotify_id: str) -> list[dict[str, Any]]:
        """Get related artists from Spotify."""
        cache_key = f"api:spotify:related:{spotify_id}"
        data = await self._cached_get(
            cache_key,
            f"{SPOTIFY_API_URL}/artists/{spotify_id}/related-artists",
            ttl=RELATED_ARTISTS_TTL,
        )
        if data:
            return data.get("artists", [])  # type: ignore[no-any-return]
        return []

    async def get_track(self, spotify_id: str) -> dict[str, Any] | None:
        """Get track details from Spotify by ID."""
        cache_key = f"api:spotify:track:{spotify_id}"
        return await self._cached_get(
            cache_key,
            f"{SPOTIFY_API_URL}/tracks/{spotify_id}",
            ttl=ARTIST_TTL,
        )

    async def get_audio_features(self, spotify_track_id: str) -> dict[str, Any] | None:
        """Get audio features (BPM, energy, danceability, etc.) for a track."""
        cache_key = f"api:spotify:audio_features:{spotify_track_id}"
        data = await self._cached_get(
            cache_key,
            f"{SPOTIFY_API_URL}/audio-features/{spotify_track_id}",
            ttl=AUDIO_FEATURES_TTL,
        )
        return data

    async def get_several_audio_features(self, track_ids: list[str]) -> list[dict[str, Any]]:
        """Get audio features for multiple tracks at once."""
        if not track_ids:
            return []
        ids_str = ",".join(track_ids)
        cache_key = f"api:spotify:audio_features_batch:{ids_str}"
        # Try Redis cache (non-critical)
        try:
            redis = await get_cache_redis()
            cached = await redis.get(cache_key)
            if cached:
                return json.loads(cached)  # type: ignore[no-any-return]
        except Exception:
            pass

        try:
            headers = await self._auth_headers()
            response = await self.client.get(
                f"{SPOTIFY_API_URL}/audio-features",
                params={"ids": ids_str},
                headers=headers,
                timeout=15.0,
            )
            response.raise_for_status()
            data = response.json()
            features = data.get("audio_features", [])
            # Try to cache (non-critical)
            try:
                redis = await get_cache_redis()
                await redis.setex(cache_key, AUDIO_FEATURES_TTL, json.dumps(features))
            except Exception:
                pass
            return features  # type: ignore[no-any-return]
        except Exception as exc:
            logger.warning("Spotify audio features batch failed: %s", exc)
            return []
