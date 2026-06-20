"""
Async ingestion workers for incremental catalog updates.

Provides ``CatalogIngestionWorker`` — a self-contained worker that fetches
artist/track metadata from external APIs (Spotify, iTunes, MusicBrainz,
Last.fm) and upserts it into the local catalog tables.

Features:
    - asyncio-based with ``httpx.AsyncClient`` connection pooling
      (100 connections, 30s timeout)
    - Semaphore-bounded concurrency (max 10)
    - Exponential backoff retry (max 3 retries: 1s, 2s, 4s)
    - Batch processing (commit every 50 records)
    - Deduplication by name for artists and (title, artist_id) for tracks
"""

from __future__ import annotations

import asyncio
import logging
import re
from datetime import datetime, timezone
from uuid import UUID

import httpx
from sqlalchemy import func, select, text
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from app.core.config import get_settings
from app.core.redis import get_cache_redis
from app.infrastructure.models.catalog import (
    CatalogAlbumModel,
    CatalogArtistGenreModel,
    CatalogArtistModel,
    CatalogGenreModel,
    CatalogTrackModel,
)
from app.services.music.clients.itunes import ITunesClient
from app.services.music.clients.lastfm import LastFmClient
from app.services.music.clients.musicbrainz import MusicBrainzClient
from app.services.music.clients.spotify import SpotifyClient

logger = logging.getLogger("catalog.ingestion.worker")

MAX_CONCURRENT = 10
BATCH_SIZE = 50
RETRY_BACKOFF = [1.0, 2.0, 4.0]
MAX_RETRIES = len(RETRY_BACKOFF)
HTTP_POOL_SIZE = 100
HTTP_TIMEOUT = 30.0
PREVIEW_STALE_SECONDS = 86400 * 7  # 7 days
DEDUP_REDIS_TTL = 86400 * 30  # 30 days

# ── Genre name validation ───────────────────────────────────────────────

_MBID_PATTERN = re.compile(
    r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$", re.IGNORECASE
)
_BARCODE_PATTERN = re.compile(r"^\d{8,14}$")


def is_valid_genre_name(name: str) -> bool:
    """Reject raw MBIDs and barcodes that leak from external API tag fields."""
    stripped = name.strip()
    if not stripped:
        return False
    if _MBID_PATTERN.match(stripped):
        return False
    if _BARCODE_PATTERN.match(stripped):
        return False
    return True


_GENRE_COLORS: dict[str, tuple[str, str]] = {
    "pop": ("#ff6b6b", "#ee5a24"),
    "rock": ("#d63031", "#b71540"),
    "hip hop": ("#fdcb6e", "#f9ca24"),
    "rap": ("#fdcb6e", "#e17055"),
    "r&b": ("#a29bfe", "#6c5ce7"),
    "electronic": ("#00cec9", "#00b894"),
    "jazz": ("#fab1a0", "#e17055"),
    "classical": ("#dfe6e9", "#b2bec3"),
    "country": ("#f8a5c2", "#e66767"),
    "metal": ("#636e72", "#2d3436"),
    "reggae": ("#55efc4", "#00b894"),
    "latin": ("#fd79a8", "#e84393"),
    "k-pop": ("#ff9ff3", "#f368e0"),
    "indie": ("#c7ecee", "#7ed6df"),
    "folk": ("#e1b12c", "#fbc531"),
    "soul": ("#9c88ff", "#8c7ae6"),
    "funk": ("#ff793f", "#e15f41"),
    "punk": ("#ff4757", "#ff6b81"),
    "blues": ("#3498db", "#2980b9"),
    "alternative": ("#a29bfe", "#6c5ce7"),
    "house": ("#ffa502", "#eccc68"),
    "techno": ("#70a1ff", "#5352ed"),
}


def _slugify(name: str) -> str:
    """Create a URL-safe slug from a genre name."""
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


class CatalogIngestionWorker:
    """
    Background worker for incremental catalog updates.

    Uses a shared ``httpx.AsyncClient`` for all API calls with
    connection-pooling and a ``Semaphore`` to bound concurrency.

    Typical usage::

        async with httpx.AsyncClient(...) as http:
            worker = CatalogIngestionWorker(session_factory, http)
            artist = await worker.ingest_artist("Taylor Swift")
    """

    def __init__(
        self,
        session_factory: async_sessionmaker[AsyncSession],
        http_client: httpx.AsyncClient,
        *,
        semaphore: asyncio.Semaphore | None = None,
    ) -> None:
        self._session_factory = session_factory
        self._http = http_client
        self._semaphore = semaphore or asyncio.Semaphore(MAX_CONCURRENT)

        self._itunes = ITunesClient(http_client)
        self._musicbrainz = MusicBrainzClient(http_client)
        self._lastfm = LastFmClient(http_client)
        self._spotify: SpotifyClient | None = None
        self._spotify_initialized = False

    # ── Public API ──────────────────────────────────────────────────────

    async def ingest_artist(self, name: str) -> CatalogArtistModel | None:
        """
        Full ingestion pipeline for a single artist.

        1. Search iTunes for tracks and albums
        2. Enrich with Spotify (genres, popularity, image)
        3. Enrich with MusicBrainz (MBID, tags)
        4. Enrich with Last.fm (similar artists, tags, bio)
        5. Upsert artist, albums, tracks, and genre links

        Returns the ``CatalogArtistModel`` or ``None`` on failure.
        """
        async with self._semaphore:
            return await self._ingest_artist_impl(name)

    async def ingest_artists_batch(
        self, names: list[str]
    ) -> list[CatalogArtistModel | None]:
        """
        Ingest multiple artists concurrently and commit after each batch.

        Each artist is processed independently; failures for one artist
        do not halt the rest.
        """
        results: list[CatalogArtistModel | None] = []
        async with self._session_factory() as session:
            for i, name in enumerate(names):
                try:
                    artist = await self.ingest_artist(name)
                    results.append(artist)
                except Exception:
                    logger.exception("Batch ingest failed for %r", name)
                    results.append(None)

                if (i + 1) % BATCH_SIZE == 0:
                    await session.commit()

            await session.commit()
        return results

    async def enrich_artist(self, artist_id: UUID) -> CatalogArtistModel | None:
        """
        Re-fetch metadata from all available APIs for an existing artist.

        Useful for periodically updating popularity, genres, and imagery.
        """
        async with self._session_factory() as session:
            artist = await session.get(CatalogArtistModel, artist_id)
            if not artist:
                logger.warning("Artist %s not found for enrichment", artist_id)
                return None

            async with self._semaphore:
                enriched = await self._enrich_existing(session, artist)
                await session.commit()
                return enriched

    async def sync_artist_top_tracks(
        self, artist_id: UUID, limit: int = 20
    ) -> list[CatalogTrackModel]:
        """
        Fetch top tracks from Spotify for an artist and upsert them.

        Requires a valid Spotify artist ID on the catalog record.
        Falls back to iTunes search if Spotify data is unavailable.
        """
        async with self._session_factory() as session:
            artist = await session.get(CatalogArtistModel, artist_id)
            if not artist:
                return []

            spotify_id = artist.external_spotify_id
            tracks_data: list[dict] = []

            if spotify_id and self._spotify_available:
                try:
                    sp_tracks = await self._retry(
                        self._spotify.get_artist_top_tracks, spotify_id
                    )
                    if sp_tracks:
                        tracks_data = sp_tracks[:limit]
                except Exception:
                    logger.debug("Spotify top-tracks failed for %r", artist.name, exc_info=True)

            if not tracks_data:
                try:
                    tracks_data = await self._retry(
                        self._itunes.search,
                        term=artist.name,
                        media="music",
                        entity="musicTrack",
                        limit=limit,
                    )
                except Exception:
                    logger.warning("iTunes fallback failed for %r", artist.name, exc_info=True)
                    return []

            results: list[CatalogTrackModel] = []
            for td in tracks_data:
                track = await self._upsert_track_from_data(session, artist, td)
                if track:
                    results.append(track)

            await session.commit()
            return results

    async def refresh_previews(self) -> int:
        """
        Check all catalog tracks for expired or missing preview URLs
        and attempt to refresh them from iTunes.

        Returns the number of previews successfully refreshed.
        """
        stale_cutoff = datetime.now(timezone.utc).timestamp() - PREVIEW_STALE_SECONDS
        refreshed = 0

        async with self._session_factory() as session:
            result = await session.execute(
                select(CatalogTrackModel).where(
                    CatalogTrackModel.preview_url.is_(None)
                    | (
                        CatalogTrackModel.updated_at
                        < datetime.fromtimestamp(stale_cutoff, tz=timezone.utc)
                    )
                ).limit(200)
            )
            tracks = result.scalars().all()

            semaphore = asyncio.Semaphore(MAX_CONCURRENT)

            async def _refresh_one(track: CatalogTrackModel):
                nonlocal refreshed
                async with semaphore:
                    try:
                        artist = await session.get(CatalogArtistModel, track.artist_id)
                        artist_name = artist.name if artist else ""
                        itunes_data = await self._retry(
                            self._itunes.search,
                            term=f"{track.title} {artist_name}",
                            media="music",
                            entity="musicTrack",
                            limit=1,
                        )
                        if itunes_data and itunes_data[0].get("previewUrl"):
                            track.preview_url = itunes_data[0]["previewUrl"]
                            track.updated_at = datetime.now(timezone.utc)
                            return 1
                    except Exception:
                        logger.debug("Preview refresh failed for track %r", track.id, exc_info=True)
                    return 0

            tasks = [_refresh_one(t) for t in tracks]
            counts = await asyncio.gather(*tasks, return_exceptions=True)
            for c in counts:
                if isinstance(c, int):
                    refreshed += c

            await session.commit()

        logger.info("Refreshed %d previews", refreshed)
        return refreshed

    async def deduplicate_catalog(self) -> int:
        """
        Find and merge duplicate artists/tracks in the catalog.

        Returns the number of duplicate records removed.
        """
        removed = 0

        async with self._session_factory() as session:
            dup_artists_sql = text("""
                WITH ranked AS (
                    SELECT id, name, popularity,
                           ROW_NUMBER() OVER (
                               PARTITION BY lower(name)
                               ORDER BY popularity DESC, created_at DESC
                           ) AS rn
                    FROM catalog_artists
                )
                DELETE FROM catalog_artists
                WHERE id IN (SELECT id FROM ranked WHERE rn > 1)
            """)
            result = await session.execute(dup_artists_sql)
            removed += result.rowcount or 0

            dup_tracks_sql = text("""
                WITH ranked AS (
                    SELECT id, title, artist_id, popularity,
                           ROW_NUMBER() OVER (
                               PARTITION BY lower(title), artist_id
                               ORDER BY popularity DESC, created_at DESC
                           ) AS rn
                    FROM catalog_tracks
                )
                DELETE FROM catalog_tracks
                WHERE id IN (SELECT id FROM ranked WHERE rn > 1)
            """)
            result = await session.execute(dup_tracks_sql)
            removed += result.rowcount or 0

            await session.commit()

        logger.info("Deduplication removed %d records", removed)
        return removed

    async def run_full_ingestion(self) -> dict:
        """
        Run complete catalog ingestion from the seed artist lists.

        Iterates over all artists defined in ``massive_seed.py`` (and
        fallback ``seed_data.py``), ingests each one through the full
        enrichment pipeline (iTunes → Spotify → MusicBrainz → Last.fm),
        and returns summary statistics.

        Returns a ``dict`` with keys ``"artists"`` (int), ``"tracks"``
        (int), and ``"previews"`` (int).
        """
        # ── Load seed artist lists ──────────────────────────────────
        from app.services.catalog.massive_seed import ALL_ARTISTS as MASSIVE_ALL
        from app.services.catalog.seed_data import TOP_ARTISTS

        # Prefer the massive seed list; fall back to TOP_ARTISTS
        if MASSIVE_ALL:
            artists_to_ingest = MASSIVE_ALL
            logger.info(
                "Full ingestion starting — %d artists in massive seed",
                len(artists_to_ingest),
            )
        else:
            artists_to_ingest: list[str] = []
            for genre_artists in TOP_ARTISTS.values():
                artists_to_ingest.extend(genre_artists)
            artists_to_ingest = list(dict.fromkeys(artists_to_ingest))
            logger.info(
                "Full ingestion starting — %d artists in seed data",
                len(artists_to_ingest),
            )

        # ── Ingest artists in batches ───────────────────────────────
        results = await self.ingest_artists_batch(artists_to_ingest)
        ingested_artists = sum(1 for r in results if r is not None)

        logger.info(
            "Ingestion completed — %d/%d artists successfully ingested",
            ingested_artists, len(artists_to_ingest),
        )

        # ── Collect final statistics from the database ──────────────
        async with self._session_factory() as session:
            artist_result = await session.execute(
                select(func.count()).select_from(CatalogArtistModel)
            )
            total_artists: int = artist_result.scalar_one()

            track_result = await session.execute(
                select(func.count()).select_from(CatalogTrackModel)
            )
            total_tracks: int = track_result.scalar_one()

            preview_result = await session.execute(
                select(func.count()).select_from(CatalogTrackModel).where(
                    CatalogTrackModel.preview_url.is_not(None)
                )
            )
            total_previews: int = preview_result.scalar_one()

        logger.info(
            "Final catalog: %d artists, %d tracks, %d with preview",
            total_artists, total_tracks, total_previews,
        )
        return {
            "artists": total_artists,
            "tracks": total_tracks,
            "previews": total_previews,
        }

    async def close(self) -> None:
        """Cleanup resources. The httpx client is managed externally."""

    # ── Internal helpers ────────────────────────────────────────────────

    @property
    def _spotify_available(self) -> bool:
        if not self._spotify_initialized:
            settings = get_settings()
            if settings.SPOTIFY_CLIENT_ID and settings.SPOTIFY_CLIENT_SECRET:
                self._spotify = SpotifyClient(self._http)
            self._spotify_initialized = True
        return self._spotify is not None

    async def _retry(self, func, *args, **kwargs):
        """Call *func* with exponential backoff retry."""
        last_exc = None
        for attempt in range(MAX_RETRIES + 1):
            try:
                return await func(*args, **kwargs)
            except Exception as exc:
                last_exc = exc
                if attempt < MAX_RETRIES:
                    wait = RETRY_BACKOFF[attempt]
                    await asyncio.sleep(wait)
        logger.warning("All %d retries exhausted", MAX_RETRIES)
        raise last_exc  # type: ignore[misc]

    async def _ingest_artist_impl(self, name: str) -> CatalogArtistModel | None:
        """Core ingestion logic for a single artist."""

        # ── 1. iTunes search ─────────────────────────────────────────
        itunes_tracks = await self._retry(
            self._itunes.search,
            term=name,
            media="music",
            entity="musicTrack",
            limit=20,
            country="US",
        )
        itunes_albums = await self._retry(
            self._itunes.search,
            term=name,
            media="music",
            entity="album",
            limit=10,
            country="US",
        )

        # ── 2. Spotify enrichment ────────────────────────────────────
        spotify_data: dict | None = None
        genre_names: list[str] = []
        popularity: int = 0
        image_url: str | None = None

        if self._spotify:
            try:
                sp_search = await self._retry(
                    self._spotify.search_artist, query=name, limit=1
                )
                if sp_search and sp_search.get("artists", {}).get("items"):
                    artist_item = sp_search["artists"]["items"][0]
                    spotify_data = artist_item
                    genre_names = artist_item.get("genres", [])
                    popularity = artist_item.get("popularity", 0)
                    images = artist_item.get("images", [])
                    if images:
                        image_url = images[0].get("url")
            except Exception:
                logger.debug("Spotify enrichment failed for %r", name, exc_info=True)

        # ── 3. MusicBrainz tags ──────────────────────────────────────
        mbid: str | None = None
        mb_tags: list[str] = []
        try:
            mb_results = await self._retry(
                self._musicbrainz.search_artist, query=name, limit=1
            )
            if mb_results:
                mb_artist = mb_results[0]
                mbid = mb_artist.get("id")
                mb_tags = [t.get("name", "") for t in mb_artist.get("tags", [])]
                if mb_tags and not genre_names:
                    genre_names = mb_tags
        except Exception:
            logger.debug("MusicBrainz enrichment failed for %r", name, exc_info=True)

        # ── 4. Last.fm enrichment ────────────────────────────────────
        bio: str | None = None
        lastfm_genres: list[str] = []
        lastfm_url: str | None = None
        try:
            lfm_data = await self._retry(
                self._lastfm.get_artist_info, artist=name, mbid=mbid
            )
            if lfm_data:
                artist_info = lfm_data.get("artist", {})
                bio_data = artist_info.get("bio", {})
                bio = bio_data.get("summary") or bio_data.get("content")
                lastfm_url = artist_info.get("url")
                lfm_tags = await self._retry(
                    self._lastfm.get_top_tags, artist=name, mbid=mbid
                )
                for tag in lfm_tags:
                    lastfm_genres.append(tag.get("name", ""))
                if lastfm_genres and not genre_names:
                    genre_names = lastfm_genres[:5]
                for g in lastfm_genres:
                    if g.lower() not in (existing.lower() for existing in genre_names):
                        genre_names.append(g)
        except Exception:
            logger.debug("Last.fm enrichment failed for %r", name, exc_info=True)

        # ── 5. iTunes genre fallback ─────────────────────────────────
        if not genre_names:
            itunes_genre_set: set[str] = set()
            for t in itunes_tracks:
                g = t.get("primaryGenreName")
                if g:
                    itunes_genre_set.add(g)
            genre_names = sorted(itunes_genre_set)

        # ── 6. iTunes image fallback ─────────────────────────────────
        if not image_url and itunes_albums:
            for album in itunes_albums:
                art = album.get("artworkUrl100")
                if art:
                    image_url = ITunesClient.get_best_artwork(art, 600)
                    break

        # ── 7. Determine external IDs ────────────────────────────────
        spotify_id = spotify_data.get("id") if spotify_data else None
        first_track = itunes_tracks[0] if itunes_tracks else {}
        itunes_artist_id = str(first_track.get("artistId", "")) or None

        # ── 8. Persist ───────────────────────────────────────────────
        async with self._session_factory() as session:
            artist = await self._upsert_artist(
                session,
                name=name,
                bio=bio,
                image_url=image_url,
                popularity=popularity,
                is_brazilian=False,
                spotify_id=spotify_id,
                itunes_id=itunes_artist_id,
                mbid=mbid,
                lastfm_url=lastfm_url,
            )

            # ── 9. Link genres ───────────────────────────────────────
            await self._link_genres(session, artist, genre_names)

            # ── 10. Upsert albums and tracks ─────────────────────────
            album_cache: dict[str, CatalogAlbumModel] = {}

            for track_data in itunes_tracks:
                track_title = track_data.get("trackName") or track_data.get(
                    "collectionName", ""
                )
                if not track_title:
                    continue

                album_title = track_data.get("collectionName")
                album = None
                if album_title:
                    key = album_title.lower().strip()
                    if key not in album_cache:
                        art = track_data.get("artworkUrl100")
                        album = await self._upsert_album(
                            session,
                            title=album_title,
                            artist_id=artist.id,
                            cover_url=ITunesClient.get_best_artwork(art, 600)
                            if art
                            else None,
                            release_date=(track_data.get("releaseDate", "") or "")[
                                :10
                            ]
                            or None,
                            track_count=track_data.get("trackCount") or 0,
                            itunes_id=str(track_data.get("collectionId", "")),
                        )
                        album_cache[key] = album
                    else:
                        album = album_cache[key]

                preview_url = track_data.get("previewUrl")
                duration_ms = track_data.get("trackTimeMillis")

                await self._upsert_track(
                    session,
                    title=track_title,
                    artist_id=artist.id,
                    album_id=album.id if album else None,
                    duration_ms=duration_ms,
                    track_number=track_data.get("trackNumber"),
                    disc_number=track_data.get("discNumber"),
                    preview_url=preview_url,
                    explicit=track_data.get("isExplicit", False)
                    if "isExplicit" in track_data
                    else False,
                    popularity=popularity,
                    itunes_id=str(track_data.get("trackId", "")),
                )

            await session.commit()
            return artist

    async def _enrich_existing(
        self, session: AsyncSession, artist: CatalogArtistModel
    ) -> CatalogArtistModel:
        """Re-fetch metadata for an existing artist record."""
        name = artist.name

        if self._spotify:
            try:
                sp_search = await self._retry(
                    self._spotify.search_artist, query=name, limit=1
                )
                if sp_search and sp_search.get("artists", {}).get("items"):
                    item = sp_search["artists"]["items"][0]
                    artist.popularity = item.get("popularity", artist.popularity)
                    artist.external_spotify_id = (
                        item.get("id") or artist.external_spotify_id
                    )
                    images = item.get("images", [])
                    if images:
                        artist.image_url = images[0].get("url") or artist.image_url
                    # Add Spotify genres
                    genres = item.get("genres", [])
                    await self._link_genres(session, artist, genres)
            except Exception:
                logger.debug("Enrich: Spotify failed for %r", name, exc_info=True)

        try:
            lfm_tags = await self._retry(self._lastfm.get_top_tags, artist=name)
            tag_names = [t.get("name", "") for t in lfm_tags]
            await self._link_genres(session, artist, tag_names)
        except Exception:
            logger.debug("Enrich: Last.fm failed for %r", name, exc_info=True)

        artist.updated_at = datetime.now(timezone.utc)
        return artist

    # ── Persistence helpers ─────────────────────────────────────────────

    async def _upsert_artist(
        self,
        session: AsyncSession,
        *,
        name: str,
        bio: str | None,
        image_url: str | None,
        popularity: int,
        is_brazilian: bool,
        spotify_id: str | None,
        itunes_id: str | None,
        mbid: str | None,
        lastfm_url: str | None,
    ) -> CatalogArtistModel:
        """Insert or update a catalog_artist row (name is unique)."""
        stmt = pg_insert(CatalogArtistModel).values(
            name=name,
            bio=bio,
            image_url=image_url,
            popularity=popularity,
            is_brazilian=is_brazilian,
            external_spotify_id=spotify_id,
            external_itunes_id=itunes_id,
            external_mb_id=mbid,
            external_lastfm_url=lastfm_url,
            country=None,
        )
        stmt = stmt.on_conflict_do_update(
            index_elements=["name"],
            set_={
                "bio": stmt.excluded.bio,
                "image_url": stmt.excluded.image_url,
                "popularity": stmt.excluded.popularity,
                "is_brazilian": stmt.excluded.is_brazilian,
                "external_spotify_id": stmt.excluded.external_spotify_id,
                "external_itunes_id": stmt.excluded.external_itunes_id,
                "external_mb_id": stmt.excluded.external_mb_id,
                "external_lastfm_url": stmt.excluded.external_lastfm_url,
                "updated_at": datetime.now(timezone.utc),
            },
            where=(CatalogArtistModel.popularity < stmt.excluded.popularity),
        )
        await session.execute(stmt)

        result = await session.execute(
            select(CatalogArtistModel).where(CatalogArtistModel.name == name)
        )
        return result.scalar_one()

    async def _upsert_album(
        self,
        session: AsyncSession,
        *,
        title: str,
        artist_id,
        cover_url: str | None,
        release_date: str | None,
        track_count: int,
        itunes_id: str | None,
    ) -> CatalogAlbumModel:
        """Insert or update a catalog_album row."""
        stmt = pg_insert(CatalogAlbumModel).values(
            title=title,
            artist_id=artist_id,
            cover_url=cover_url,
            release_date=release_date,
            track_count=track_count,
            external_itunes_id=itunes_id,
            country=None,
        )
        stmt = stmt.on_conflict_do_update(
            index_elements=["title", "artist_id"],
            set_={
                "cover_url": stmt.excluded.cover_url,
                "updated_at": datetime.now(timezone.utc),
            },
        )
        await session.execute(stmt)

        result = await session.execute(
            select(CatalogAlbumModel).where(
                CatalogAlbumModel.title == title,
                CatalogAlbumModel.artist_id == artist_id,
            )
        )
        return result.scalar_one()

    async def _upsert_track(
        self,
        session: AsyncSession,
        *,
        title: str,
        artist_id,
        album_id,
        duration_ms: int | None,
        track_number: int | None,
        disc_number: int | None,
        preview_url: str | None,
        explicit: bool,
        popularity: int,
        itunes_id: str | None,
    ) -> CatalogTrackModel | None:
        """Insert or update a catalog_track row."""
        stmt = pg_insert(CatalogTrackModel).values(
            title=title,
            artist_id=artist_id,
            album_id=album_id,
            duration_ms=duration_ms,
            track_number=track_number,
            disc_number=disc_number,
            preview_url=preview_url,
            explicit=explicit,
            popularity=popularity,
            external_itunes_id=itunes_id,
        )
        stmt = stmt.on_conflict_do_update(
            index_elements=["title", "artist_id"],
            set_={
                "duration_ms": stmt.excluded.duration_ms,
                "popularity": stmt.excluded.popularity,
                "album_id": stmt.excluded.album_id,
                "updated_at": datetime.now(timezone.utc),
            },
        )
        await session.execute(stmt)

        result = await session.execute(
            select(CatalogTrackModel).where(
                CatalogTrackModel.title == title,
                CatalogTrackModel.artist_id == artist_id,
            )
        )
        return result.scalar_one_or_none()

    async def _upsert_track_from_data(
        self,
        session: AsyncSession,
        artist: CatalogArtistModel,
        track_data: dict,
    ) -> CatalogTrackModel | None:
        """Upsert a track from a dict (iTunes or Spotify format)."""
        title = track_data.get("name") or track_data.get("trackName") or ""
        if not title:
            return None

        album_title = track_data.get("album", {}).get("name") or track_data.get(
            "collectionName"
        )
        album_id = None
        if album_title:
            existing = await session.execute(
                select(CatalogAlbumModel).where(
                    CatalogAlbumModel.title == album_title,
                    CatalogAlbumModel.artist_id == artist.id,
                )
            )
            album = existing.scalar_one_or_none()
            if album:
                album_id = album.id

        preview_url = track_data.get("preview_url") or track_data.get("previewUrl")
        duration_ms = track_data.get("duration_ms") or track_data.get("trackTimeMillis")
        popularity = track_data.get("popularity", 0)
        is_spotify = "id" in track_data and track_data.get("type") == "track"

        return await self._upsert_track(
            session,
            title=title,
            artist_id=artist.id,
            album_id=album_id,
            duration_ms=duration_ms,
            track_number=track_data.get("track_number"),
            disc_number=track_data.get("disc_number"),
            preview_url=preview_url,
            explicit=track_data.get("explicit", False),
            popularity=popularity,
            itunes_id=None if is_spotify else str(track_data.get("trackId", "")),
        )

    async def _link_genres(
        self,
        session: AsyncSession,
        artist: CatalogArtistModel,
        genre_names: list[str],
    ) -> None:
        """Ensure genre records exist and link them to the artist."""
        for genre_name in genre_names:
            if not genre_name or not genre_name.strip():
                continue
            if not is_valid_genre_name(genre_name):
                logger.warning("Nome de gênero inválido descartado: %r", genre_name)
                continue
            gname = genre_name.strip().lower()
            slug = _slugify(gname)

            stmt = pg_insert(CatalogGenreModel).values(
                name=gname,
                slug=slug,
                gradient_from=_GENRE_COLORS.get(gname, ("#1a1a2e", "#16213e"))[0],
                gradient_to=_GENRE_COLORS.get(gname, ("#1a1a2e", "#16213e"))[1],
            )
            stmt = stmt.on_conflict_do_nothing(
                index_elements=["slug"],
            )
            await session.execute(stmt)

            result = await session.execute(
                select(CatalogGenreModel).where(CatalogGenreModel.slug == slug)
            )
            genre = result.scalar_one()

            link_stmt = pg_insert(CatalogArtistGenreModel).values(
                artist_id=artist.id,
                genre_id=genre.id,
            )
            link_stmt = link_stmt.on_conflict_do_nothing()
            await session.execute(link_stmt)


# ── Convenience factory ─────────────────────────────────────────────────


def create_ingestion_worker(
    session_factory: async_sessionmaker[AsyncSession],
) -> CatalogIngestionWorker:
    """
    Create a ``CatalogIngestionWorker`` with a fresh ``httpx.AsyncClient``.

    The caller is responsible for closing the returned client::

        worker = create_ingestion_worker(sf)
        async with worker._http:
            await worker.ingest_artist("...")
    """
    client = httpx.AsyncClient(
        timeout=httpx.Timeout(HTTP_TIMEOUT),
        limits=httpx.Limits(max_connections=HTTP_POOL_SIZE),
        follow_redirects=True,
    )
    worker = CatalogIngestionWorker(session_factory, client)
    return worker
