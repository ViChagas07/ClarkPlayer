"""
Incremental catalog expansion service.

Automatically discovers 100+ new artists per run using multiple strategies:
  1. Spotify "related artists" — discover artists similar to existing ones
  2. Spotify genre playlists — discover artists from Spotify-curated playlists
  3. LastFM "similar artists" — cross-reference with LastFM data

Only processes artists NOT already in the catalog.  Each run adds
~100 new artists with their tracks, albums, and genre links.

Tracks persisted ONLY when preview_url is available (iTunes).
"""

from __future__ import annotations

import asyncio
import logging
import time
from collections.abc import AsyncIterator

import httpx
from sqlalchemy import func, select

from app.infrastructure.database import _async_session_factory
from app.infrastructure.models.catalog import (
    CatalogArtistModel,
    CatalogTrackModel,
)
from app.services.catalog.ingestion import (
    CatalogIngestionWorker,
    MAX_CONCURRENT,
)

logger = logging.getLogger("catalog.expansion")

# How many new artists to add per expansion run
EXPANSION_BATCH_SIZE = 100

# Spotify genre playlists to mine for artists
SPOTIFY_GENRE_PLAYLISTS = [
    "37i9dQZF1DXcBWIGoYBM5M",  # Today's Top Hits
    "37i9dQZF1DX0XUsuxWHRQd",  # RapCaviar
    "37i9dQZF1DX4JAvHpjipBk",  # New Music Friday
    "37i9dQZF1DWXRqgorJj26U",  # Rock Classics
    "37i9dQZF1DX4dySttSOFjJ",  # Electronic Rising
    "37i9dQZF1DX10zKzsJ2jva",  # Viva Latino
    "37i9dQZF1DWY4xHQp97fN6",  # Beast Mode
    "37i9dQZF1DX0FOF1IUHxYy",  # K-Pop ON
    "37i9dQZF1DX1lVhptIYRda",  # Hot Country
]

# Popular Spotify category playlists (genre-based)
SPOTIFY_CATEGORIES = [
    "pop", "rock", "hiphop", "rnb", "country", "latin",
    "edm_dance", "indie_alt", "metal", "jazz", "classical",
    "reggae", "blues", "folk_americana", "soul", "funk",
    "punk", "gospel", "kpop", "ambient", "house", "techno",
]

# High-impact artist names to always expand from
SEED_EXPANSION_ARTISTS = [
    "Taylor Swift", "Drake", "Kendrick Lamar", "Beyoncé",
    "Ed Sheeran", "Billie Eilish", "The Weeknd", "Post Malone",
    "Bad Bunny", "BTS", "Adele", "Bruno Mars",
    "Rihanna", "Eminem", "Kanye West", "Lady Gaga",
    "Dua Lipa", "Harry Styles", "Justin Bieber", "Ariana Grande",
    "Metallica", "Queen", "Nirvana", "Bob Marley",
    "Shakira", "Coldplay", "Imagine Dragons", "Maroon 5",
    "SZA", "Olivia Rodrigo", "KAROL G", "J Balvin",
    "Anitta", "Rosalía", "Travis Scott", "21 Savage",
]


class CatalogExpansion:
    """
    Incremental catalog expansion via related-artist discovery.

    Uses existing catalog artists as seeds to discover new related
    artists from Spotify, then ingests them via the standard pipeline.
    """

    def __init__(self, http_client: httpx.AsyncClient) -> None:
        self._http = http_client
        self._worker = CatalogIngestionWorker(
            _async_session_factory, http_client
        )

    async def expand_catalog(self, max_new: int = EXPANSION_BATCH_SIZE) -> dict:
        """
        Discover and ingest up to *max_new* new artists.

        Returns dict with counts of discovered, ingested, and skipped artists.
        """
        start = time.monotonic()
        known_names = await self._get_existing_artist_names()

        # ── Strategy 1: Spotify related artists ──────────────────
        seed_artists = await self._get_seed_artists()
        discovered = await self._discover_related(seed_artists, known_names)

        # ── Strategy 2: Spotify genre playlists ──────────────────
        if len(discovered) < max_new:
            playlist_discovered = await self._discover_from_playlists(
                known_names, max_new - len(discovered)
            )
            discovered += playlist_discovered

        # ── Deduplicate and limit ────────────────────────────────
        discovered = list(dict.fromkeys(discovered))[:max_new]

        if not discovered:
            logger.info("No new artists to discover")
            return {"discovered": 0, "ingested": 0, "skipped": 0}

        # ── Ingest new artists ───────────────────────────────────
        logger.info("Ingesting %d new artists...", len(discovered))
        ingested = 0
        skipped = 0

        semaphore = asyncio.Semaphore(MAX_CONCURRENT)

        async def ingest_one(name: str) -> bool:
            async with semaphore:
                try:
                    result = await self._worker.ingest_artist(name)
                    return result is not None
                except Exception:
                    logger.debug("Expansion ingest failed: %s", name, exc_info=True)
                    return False

        # Process in sub-batches of 50 for commit frequency
        batch_size = 50
        for i in range(0, len(discovered), batch_size):
            batch = discovered[i : i + batch_size]
            results = await asyncio.gather(*[ingest_one(n) for n in batch])
            for r in results:
                if r:
                    ingested += 1
                else:
                    skipped += 1
            logger.info(
                "Expansion batch %d: %d ingested, %d skipped",
                i // batch_size + 1, ingested, skipped,
            )

        elapsed = time.monotonic() - start
        logger.info(
            "Expansion complete: %d discovered, %d ingested, %d skipped | %.0fs",
            len(discovered), ingested, skipped, elapsed,
        )

        return {
            "discovered": len(discovered),
            "ingested": ingested,
            "skipped": skipped,
            "elapsed_seconds": elapsed,
        }

    # ── Private helpers ───────────────────────────────────────────

    async def _get_existing_artist_names(self) -> set[str]:
        """Return set of lowercase artist names already in the catalog."""
        async with _async_session_factory() as session:
            result = await session.execute(
                select(CatalogArtistModel.name)
            )
            rows = result.all()
            return {row[0].lower().strip() for row in rows}

    async def _get_seed_artists(self, limit: int = 50) -> list[str]:
        """
        Return artist names to use as discovery seeds.

        Mix of:
        - Top high-impact artists (if present in catalog)
        - Top catalog artists by popularity
        """
        seeds: list[str] = []

        # Add known high-impact artists that are in the catalog
        async with _async_session_factory() as session:
            for name in SEED_EXPANSION_ARTISTS:
                result = await session.execute(
                    select(CatalogArtistModel).where(
                        CatalogArtistModel.name == name
                    )
                )
                if result.scalar_one_or_none() and name not in seeds:
                    seeds.append(name)

            # Top popular artists
            result = await session.execute(
                select(CatalogArtistModel.name)
                .order_by(CatalogArtistModel.popularity.desc())
                .limit(limit)
            )
            for row in result.all():
                if row[0] not in seeds:
                    seeds.append(row[0])
                if len(seeds) >= limit:
                    break

        return seeds

    async def _discover_related(
        self,
        seed_artists: list[str],
        known_names: set[str],
    ) -> list[str]:
        """
        Use Spotify "related artists" to discover new artists.

        Fetches related artists for each seed artist, filters out
        those already in the catalog.
        """
        from app.services.music.clients.spotify import SpotifyClient

        spotify = SpotifyClient(self._http)
        discovered: list[str] = []

        # First, get Spotify IDs for seed artists
        async with _async_session_factory() as session:
            for seed_name in seed_artists[:20]:  # Use up to 20 seeds
                result = await session.execute(
                    select(CatalogArtistModel.external_spotify_id)
                    .where(CatalogArtistModel.name == seed_name)
                )
                spotify_id = result.scalar_one_or_none()

                if not spotify_id:
                    continue

                try:
                    related = await spotify.get_related_artists(spotify_id)
                    for artist in related:
                        name = artist.get("name", "")
                        if name and name.lower() not in known_names:
                            discovered.append(name)
                            if len(discovered) >= EXPANSION_BATCH_SIZE * 2:
                                break
                except Exception:
                    logger.debug(
                        "Spotify related artists failed for %s", seed_name,
                        exc_info=True,
                    )

                if len(discovered) >= EXPANSION_BATCH_SIZE * 2:
                    break

        return discovered

    async def _discover_from_playlists(
        self,
        known_names: set[str],
        limit: int,
    ) -> list[str]:
        """
        Discover artists from Spotify genre playlists and categories.

        Fetches track artists from popular playlists.
        """
        from app.services.music.clients.spotify import SpotifyClient

        spotify = SpotifyClient(self._http)
        discovered: list[str] = []
        seen = set()

        # Try playlist-based discovery
        for playlist_id in SPOTIFY_GENRE_PLAYLISTS[:5]:
            if len(discovered) >= limit:
                break
            try:
                tracks = await spotify.get_playlist_tracks(playlist_id, limit=50)
                for item in tracks:
                    track = item.get("track", {})
                    for artist in track.get("artists", []):
                        name = artist.get("name", "")
                        if name and name.lower() not in known_names and name not in seen:
                            seen.add(name)
                            discovered.append(name)
            except Exception:
                logger.debug("Playlist discovery failed for %s", playlist_id, exc_info=True)

        return discovered[:limit]


async def run_expansion(max_new: int = EXPANSION_BATCH_SIZE) -> dict:
    """Convenience coroutine to run a single expansion cycle."""
    async with httpx.AsyncClient(
        timeout=httpx.Timeout(30.0),
        limits=httpx.Limits(max_connections=50),
        follow_redirects=True,
    ) as http:
        expansion = CatalogExpansion(http)
        return await expansion.expand_catalog(max_new=max_new)
