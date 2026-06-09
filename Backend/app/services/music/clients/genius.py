"""
Genius API client — Bearer token auth.

Uses GENIUS_ACCESS_TOKEN for API calls.
For full lyrics, scrapes the Genius song page with BeautifulSoup
(Genius API does not return full lyrics directly).
"""

import json
import logging
from typing import Any

import httpx
from bs4 import BeautifulSoup

from app.core.config import get_settings
from app.core.redis import get_cache_redis

logger = logging.getLogger("genius")

GENIUS_API_URL = "https://api.genius.com"
LYRICS_CACHE_TTL = 604800  # 7 days
METADATA_CACHE_TTL = 86400  # 24 hours


class GeniusClient:
    """Async client for the Genius API and lyrics scraping."""

    def __init__(self, client: httpx.AsyncClient) -> None:
        self.client = client
        self._settings = get_settings()

    def _auth_headers(self) -> dict[str, str]:
        return {"Authorization": f"Bearer {self._settings.GENIUS_ACCESS_TOKEN}"}

    async def _cached_get(
        self,
        cache_key: str,
        url: str,
        ttl: int = METADATA_CACHE_TTL,
        params: dict[str, Any] | None = None,
    ) -> dict[str, Any] | None:
        """Fetch with Redis caching."""
        redis = await get_cache_redis()
        cached = await redis.get(cache_key)
        if cached:
            return json.loads(cached)  # type: ignore[no-any-return]

        try:
            response = await self.client.get(
                url,
                params=params,
                headers=self._auth_headers(),
                timeout=15.0,
            )
            response.raise_for_status()
            data = response.json()
            await redis.setex(cache_key, ttl, json.dumps(data))
            return data  # type: ignore[no-any-return]
        except Exception as exc:
            logger.warning("Genius request failed: %s %s", url, exc)
            return None

    async def search(self, query: str, limit: int = 3) -> list[dict[str, Any]]:
        """Search Genius for songs. Returns list of hits."""
        cache_key = f"api:genius:search:{query.lower()}:{limit}"
        data = await self._cached_get(
            cache_key,
            f"{GENIUS_API_URL}/search",
            params={"q": query, "per_page": limit},
            ttl=METADATA_CACHE_TTL,
        )
        if not data:
            return []
        hits = data.get("response", {}).get("hits", [])
        return [h.get("result", {}) for h in hits if h.get("result")]

    async def get_song(self, song_id: int) -> dict[str, Any] | None:
        """Get song details from Genius API."""
        cache_key = f"api:genius:song:{song_id}"
        data = await self._cached_get(
            cache_key,
            f"{GENIUS_API_URL}/songs/{song_id}",
            params={"text_format": "plain"},
            ttl=METADATA_CACHE_TTL,
        )
        if not data:
            return None
        return data.get("response", {}).get("song")  # type: ignore[no-any-return]

    async def get_artist(self, artist_id: int) -> dict[str, Any] | None:
        """Get artist details from Genius API."""
        cache_key = f"api:genius:artist:{artist_id}"
        data = await self._cached_get(
            cache_key,
            f"{GENIUS_API_URL}/artists/{artist_id}",
            ttl=METADATA_CACHE_TTL,
        )
        if not data:
            return None
        return data.get("response", {}).get("artist")  # type: ignore[no-any-return]

    async def get_lyrics(self, query: str) -> str | None:
        """
        Search for a song and scrape its lyrics from the Genius page.
        Genius API does not return full lyrics directly, so we scrape.
        """
        cache_key = f"api:genius:lyrics:{query.lower()}"
        redis = await get_cache_redis()
        cached = await redis.get(cache_key)
        if cached:
            return cached  # type: ignore[no-any-return]

        # 1. Search for the song to get the page URL
        results = await self.search(query, limit=1)
        if not results:
            logger.warning("Genius lyrics: no search results for '%s'", query)
            return None

        song_url = results[0].get("url")
        if not song_url:
            return None

        # 2. Fetch the song page
        try:
            response = await self.client.get(
                song_url,
                headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"},
                timeout=15.0,
                follow_redirects=True,
            )
            response.raise_for_status()
        except Exception as exc:
            logger.warning("Genius lyrics page fetch failed for '%s': %s", query, exc)
            return None

        # 3. Parse with BeautifulSoup
        lyrics = self._extract_lyrics(response.text)
        if lyrics:
            await redis.setex(cache_key, LYRICS_CACHE_TTL, lyrics)
            return lyrics

        return None

    def _extract_lyrics(self, html: str) -> str | None:
        """
        Extract lyrics from a Genius song page using BeautifulSoup.
        Genius uses JavaScript-rendered lyrics, but embeds them in a meta tag
        or various div structures.
        """
        soup = BeautifulSoup(html, "html.parser")

        # Method 1: Try the Lyrics__Container divs (new Genius layout)
        lyric_divs = soup.select('[data-lyrics-container="true"]')
        if lyric_divs:
            lines: list[str] = []
            for div in lyric_divs:
                # Get text with line breaks preserved
                for br in div.find_all("br"):
                    br.replace_with("\n")
                text = div.get_text(separator="\n")
                lines.append(text)
            full_text = "\n".join(lines).strip()
            if full_text and len(full_text) > 50:
                return full_text

        # Method 2: Fallback to old-style .lyrics div
        old_lyrics = soup.find("div", class_="lyrics")
        if old_lyrics:
            text = old_lyrics.get_text(separator="\n").strip()
            if text and len(text) > 50:
                return text

        # Method 3: Check for meta description or any large text block
        # Genius sometimes embeds structured data
        # Look for large text blocks in script tags (JSON-LD)
        for script in soup.find_all("script", type="application/ld+json"):
            try:
                data = json.loads(script.string or "")
                if isinstance(data, list):
                    data = data[0] if data else {}
                description = data.get("description")
                if description and len(description) > 200:
                    return description  # type: ignore[no-any-return]
            except (json.JSONDecodeError, TypeError):
                pass

        return None

    async def get_song_description(self, song_id: int) -> str | None:
        """Get the song description/annotation from Genius."""
        song = await self.get_song(song_id)
        if song:
            desc = song.get("description", {}).get("plain")
            if desc:
                return desc  # type: ignore[no-any-return]
            # Also check top-level description
            return song.get("description_preview")
        return None
