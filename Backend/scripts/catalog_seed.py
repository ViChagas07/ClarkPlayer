"""
Catalog seed script — populates the local music catalog from external APIs.

Usage:
    python scripts/catalog_seed.py

Design:
    - asyncio-based with httpx connection pooling
    - Semaphore-bounded concurrency (max 10 concurrent artist fetches)
    - Exponential backoff retry (3 retries: 1s, 2s, 4s)
    - Batch commit every 50 artists
    - Deduplication by name for artists and (title, artist_id) for tracks
    - Works without Spotify credentials (iTunes-only fallback)
    - Target: 5000+ tracks, 1000+ artists, 500+ albums
"""

from __future__ import annotations

import asyncio
import logging
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

import httpx
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

_SCRIPT_DIR = Path(__file__).resolve().parent
_BACKEND_DIR = _SCRIPT_DIR.parent
if str(_BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(_BACKEND_DIR))

from app.core.config import get_settings
from app.core.redis import get_cache_redis
from app.infrastructure.models.catalog import (
    CatalogAlbumModel,
    CatalogArtistGenreModel,
    CatalogArtistModel,
    CatalogGenreModel,
    CatalogTrackModel,
)
from app.services.catalog.seed_data import BRAZILIAN_ARTISTS, TOP_ARTISTS
from app.services.music.clients.itunes import ITunesClient
from app.services.music.clients.spotify import SpotifyClient

logger = logging.getLogger("catalog_seed")

MAX_CONCURRENT = 10
BATCH_SIZE = 50
RETRY_BACKOFF = [1.0, 2.0, 4.0]
MAX_RETRIES = len(RETRY_BACKOFF)
MAX_TRACKS_PER_ARTIST = 20
HTTP_TIMEOUT = 30.0
HTTP_POOL_SIZE = 100


def _slugify(name: str) -> str:
    """Create a URL-safe slug from a genre name."""
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


def _chunks(iterable: list, size: int):
    """Yield successive chunks from *iterable*."""
    for i in range(0, len(iterable), size):
        yield iterable[i : i + size]


async def _retry(func, *args, **kwargs):
    """Call *func* with exponential backoff retry."""
    last_exc = None
    for attempt in range(MAX_RETRIES + 1):
        try:
            return await func(*args, **kwargs)
        except Exception as exc:
            last_exc = exc
            if attempt < MAX_RETRIES:
                wait = RETRY_BACKOFF[attempt]
                logger.debug(
                    "Retry %d/%d after %.1fs: %s", attempt + 1, MAX_RETRIES, wait, exc
                )
                await asyncio.sleep(wait)
            else:
                logger.warning("All %d retries exhausted: %s", MAX_RETRIES, exc)
    raise last_exc  # type: ignore[misc]


async def _redis_seen(key: str) -> bool:
    """Return True if *key* was already seen (Redis-backed dedup)."""
    redis = await get_cache_redis()
    exists = await redis.exists(key)
    if not exists:
        await redis.setex(key, 86400 * 7, "1")
    return bool(exists)


def _build_seed_artist_names() -> list[str]:
    """Return a deduplicated, sorted list of all seed artist names."""
    seen: set[str] = set()
    names: list[str] = []
    for genre_artists in TOP_ARTISTS.values():
        for name in genre_artists:
            lower = name.lower()
            if lower not in seen:
                seen.add(lower)
                names.append(name)
    for genre_artists in BRAZILIAN_ARTISTS.values():
        for name in genre_artists:
            lower = name.lower()
            if lower not in seen:
                seen.add(lower)
                names.append(name)
    return sorted(names, key=str.lower)


# ── Genre colour palette ────────────────────────────────────────────────────

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
    "gospel": ("#d1ccc0", "#a4b0be"),
    "punk": ("#ff4757", "#ff6b81"),
    "blues": ("#3498db", "#2980b9"),
    "world": ("#1abc9c", "#16a085"),
    "ambient": ("#2ed573", "#7bed9f"),
    "house": ("#ffa502", "#eccc68"),
    "techno": ("#70a1ff", "#5352ed"),
    "drum and bass": ("#ff6348", "#ff4757"),
    "lo-fi": ("#eccc68", "#ffa502"),
    "sertanejo": ("#27ae60", "#2ecc71"),
    "mpb": ("#16a085", "#1abc9c"),
    "samba": ("#f39c12", "#e67e22"),
    "pagode": ("#e67e22", "#d35400"),
    "forro": ("#e74c3c", "#c0392b"),
    "funk br": ("#8e44ad", "#9b59b6"),
    "rock br": ("#2c3e50", "#34495e"),
    "rap br": ("#e67e22", "#d35400"),
    "gospel br": ("#bdc3c7", "#95a5a6"),
}


class CatalogSeeder:
    """Populates catalog_artists, catalog_albums, catalog_tracks, and genre tables."""

    def __init__(
        self,
        session_factory: async_sessionmaker[AsyncSession],
        http_client: httpx.AsyncClient,
        semaphore: asyncio.Semaphore,
        spotify_available: bool,
        brazilian_names: set[str],
    ) -> None:
        self._session_factory = session_factory
        self._http = http_client
        self._semaphore = semaphore
        self._spotify_available = spotify_available
        self._brazilian_names = brazilian_names
        self._itunes = ITunesClient(http_client)
        self._spotify = SpotifyClient(http_client) if spotify_available else None

        self.stats: dict[str, int] = {
            "artists_processed": 0,
            "artists_created": 0,
            "artists_updated": 0,
            "albums_created": 0,
            "tracks_created": 0,
            "tracks_with_preview": 0,
            "genres_created": 0,
            "genre_links": 0,
            "errors": 0,
            "spotify_enriched": 0,
            "skipped_duplicates": 0,
        }

    async def seed_all(self, artist_names: list[str]) -> None:
        """Process all artists in batches."""
        total = len(artist_names)
        logger.info("Starting catalog seed: %d artists", total)

        for batch_idx, batch in enumerate(_chunks(artist_names, BATCH_SIZE), 1):
            logger.info(
                "Batch %d/%d (%d artists)",
                batch_idx,
                (total + BATCH_SIZE - 1) // BATCH_SIZE,
                len(batch),
            )
            await self._process_batch(batch)
            logger.info(
                "Progress: %d/%d artists | %d tracks (%d w/ preview) | %d errors",
                self.stats["artists_processed"],
                total,
                self.stats["tracks_created"],
                self.stats["tracks_with_preview"],
                self.stats["errors"],
            )

        self._print_summary()

    async def _process_batch(self, artist_names: list[str]) -> None:
        """Process a single batch, committing at the end."""
        async with self._session_factory() as session:
            for i, name in enumerate(artist_names):
                try:
                    await self._process_artist(session, name)
                    self.stats["artists_processed"] += 1
                except Exception:
                    logger.exception("Failed to process artist %r", name)
                    self.stats["errors"] += 1

                if (self.stats["artists_processed"] + 1) % 10 == 0:
                    logger.info(
                        "  Artists done: %d | tracks: %d (previews: %d)",
                        self.stats["artists_processed"],
                        self.stats["tracks_created"],
                        self.stats["tracks_with_preview"],
                    )

            await session.commit()

    async def _process_artist(self, session: AsyncSession, name: str) -> None:
        """Process a single artist: fetch metadata, upsert artist + tracks + albums."""
        async with self._semaphore:
            # ── Redis dedup check ────────────────────────────────────
            dedup_key = f"clark:seed:artist:{name.lower()}"
            if await _redis_seen(dedup_key):
                self.stats["skipped_duplicates"] += 1
                return

            # ── iTunes search ────────────────────────────────────────
            itunes_tracks = await _retry(
                self._itunes.search,
                term=name,
                media="music",
                entity="musicTrack",
                limit=MAX_TRACKS_PER_ARTIST,
                country="US",
            )
            itunes_albums = await _retry(
                self._itunes.search,
                term=name,
                media="music",
                entity="album",
                limit=10,
                country="US",
            )

            # ── Spotify enrichment ───────────────────────────────────
            spotify_data: dict | None = None
            genre_names: list[str] = []
            popularity: int = 0

            if self._spotify:
                try:
                    sp_search = await _retry(self._spotify.search_artist, query=name, limit=1)
                    if sp_search and sp_search.get("artists", {}).get("items"):
                        artist_item = sp_search["artists"]["items"][0]
                        spotify_data = artist_item
                        genre_names = artist_item.get("genres", [])
                        popularity = artist_item.get("popularity", 0)
                        self.stats["spotify_enriched"] += 1
                except Exception:
                    logger.debug("Spotify enrichment failed for %r", name, exc_info=True)

            # ── iTunes genre fallback ────────────────────────────────
            if not genre_names:
                itunes_genres: set[str] = set()
                for t in itunes_tracks:
                    g = t.get("primaryGenreName")
                    if g:
                        itunes_genres.add(g)
                genre_names = sorted(itunes_genres)

            # ── Image URL ────────────────────────────────────────────
            image_url: str | None = None
            if spotify_data:
                images = spotify_data.get("images", [])
                if images:
                    image_url = images[0].get("url")
            if not image_url and itunes_albums:
                for album in itunes_albums:
                    art = album.get("artworkUrl100")
                    if art:
                        image_url = ITunesClient.get_best_artwork(art, 600)
                        break

            # ── Spotify bio (followers note) ─────────────────────────
            bio = None
            if spotify_data:
                followers = spotify_data.get("followers", {}).get("total", 0)
                if followers:
                    bio = f"Spotify followers: {followers:,}"

            # ── Determine Brazilian flag ─────────────────────────────
            is_brazilian = name.lower() in self._brazilian_names

            # ── Upsert artist ────────────────────────────────────────
            artist = await self._upsert_artist(
                session,
                name=name,
                bio=bio,
                image_url=image_url,
                popularity=popularity,
                is_brazilian=is_brazilian,
                spotify_id=spotify_data.get("id") if spotify_data else None,
                itunes_id=str(track_data.get("artistId", ""))
                if itunes_tracks and (track_data := itunes_tracks[0])
                else None,
            )

            # ── Link genres ──────────────────────────────────────────
            await self._link_genres(session, artist, genre_names)

            # ── Collect albums ───────────────────────────────────────
            album_cache: dict[str, CatalogAlbumModel] = {}

            for track_data in itunes_tracks:
                track_title = track_data.get("trackName") or track_data.get("collectionName", "")
                if not track_title:
                    continue

                album_title = track_data.get("collectionName")
                album = None
                if album_title:
                    album_key = album_title.lower().strip()
                    if album_key not in album_cache:
                        artwork = track_data.get("artworkUrl100")
                        cover_url = ITunesClient.get_best_artwork(artwork, 600) if artwork else None
                        album = await self._upsert_album(
                            session,
                            title=album_title,
                            artist_id=artist.id,
                            cover_url=cover_url,
                            release_date=(track_data.get("releaseDate", "") or "")[:10] or None,
                            track_count=track_data.get("trackCount") or 0,
                            itunes_id=str(track_data.get("collectionId", "")),
                        )
                        album_cache[album_key] = album
                        self.stats["albums_created"] += 1
                    else:
                        album = album_cache[album_key]

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
                    explicit=track_data.get("isExplicit", False) if "isExplicit" in track_data else False,
                    popularity=popularity,
                    itunes_id=str(track_data.get("trackId", "")),
                )

                self.stats["tracks_created"] += 1
                if preview_url:
                    self.stats["tracks_with_preview"] += 1

    # ── Database helpers ─────────────────────────────────────────────────

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
            country=None,
        )
        stmt = stmt.on_conflict_do_update(
            constraint="catalog_artists_name_key",
            set_={
                "bio": stmt.excluded.bio,
                "image_url": stmt.excluded.image_url,
                "popularity": stmt.excluded.popularity,
                "is_brazilian": stmt.excluded.is_brazilian,
                "external_spotify_id": stmt.excluded.external_spotify_id,
                "external_itunes_id": stmt.excluded.external_itunes_id,
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
        """Insert or find an existing catalog_album row."""
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
            constraint="uq_catalog_albums_title_artist_id",
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
    ) -> None:
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
            constraint="uq_catalog_tracks_title_artist_id",
            set_={
                "preview_url": stmt.excluded.preview_url,
                "duration_ms": stmt.excluded.duration_ms,
                "popularity": stmt.excluded.popularity,
                "updated_at": datetime.now(timezone.utc),
            },
            where=(CatalogTrackModel.popularity < stmt.excluded.popularity),
        )
        await session.execute(stmt)

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
            gname = genre_name.strip().lower()
            slug = _slugify(gname)

            # Upsert genre
            stmt = pg_insert(CatalogGenreModel).values(
                name=gname,
                slug=slug,
                gradient_from=_GENRE_COLORS.get(gname, ("#1a1a2e", "#16213e"))[0],
                gradient_to=_GENRE_COLORS.get(gname, ("#1a1a2e", "#16213e"))[1],
            )
            stmt = stmt.on_conflict_do_update(
                constraint="catalog_genres_name_key",
                set_={"name": stmt.excluded.name},
            )
            await session.execute(stmt)
            self.stats["genres_created"] = self.stats.get("genres_created", 0) + 1

            result = await session.execute(
                select(CatalogGenreModel).where(CatalogGenreModel.name == gname)
            )
            genre = result.scalar_one()

            # Upsert junction
            link_stmt = pg_insert(CatalogArtistGenreModel).values(
                artist_id=artist.id,
                genre_id=genre.id,
            )
            link_stmt = link_stmt.on_conflict_do_nothing()
            await session.execute(link_stmt)
            self.stats["genre_links"] += 1

    def _print_summary(self) -> None:
        """Print a human-readable summary of the seeding run."""
        print("\n" + "=" * 60)
        print("  CATALOG SEED SUMMARY")
        print("=" * 60)
        print(f"  Artists processed  : {self.stats['artists_processed']:>6}")
        print(f"  Artists created    : {self.stats['artists_created']:>6}")
        print(f"  Artists updated    : {self.stats['artists_updated']:>6}")
        print(f"  Albums created     : {self.stats['albums_created']:>6}")
        print(f"  Tracks created     : {self.stats['tracks_created']:>6}")
        print(f"  Tracks with preview: {self.stats['tracks_with_preview']:>6}")
        print(f"  Genres created     : {self.stats['genres_created']:>6}")
        print(f"  Genre links        : {self.stats['genre_links']:>6}")
        print(f"  Errors             : {self.stats['errors']:>6}")
        print(f"  Skipped duplicates : {self.stats['skipped_duplicates']:>6}")
        print(f"  Spotify enriched   : {self.stats['spotify_enriched']:>6}")
        print("=" * 60)


# ── Entry point ─────────────────────────────────────────────────────────────


async def main() -> None:
    """Entry point for the catalog seed script."""
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
        datefmt="%H:%M:%S",
    )

    settings = get_settings()

    spotify_available = bool(settings.SPOTIFY_CLIENT_ID and settings.SPOTIFY_CLIENT_SECRET)
    if not spotify_available:
        logger.warning(
            "Spotify credentials not configured — running iTunes-only mode. "
            "Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET for richer data."
        )

    artist_names = _build_seed_artist_names()
    logger.info("Loaded %d unique seed artists", len(artist_names))

    # Build a set of lowercased Brazilian artist names for the is_brazilian flag
    brazilian_names: set[str] = set()
    for genre_artists in BRAZILIAN_ARTISTS.values():
        for name in genre_artists:
            brazilian_names.add(name.lower())

    engine = create_async_engine(
        settings.DATABASE_URL,
        echo=False,
        pool_size=20,
        max_overflow=30,
        pool_pre_ping=True,
    )
    session_factory = async_sessionmaker(
        engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )

    semaphore = asyncio.Semaphore(MAX_CONCURRENT)

    async with httpx.AsyncClient(
        timeout=httpx.Timeout(HTTP_TIMEOUT),
        limits=httpx.Limits(max_connections=HTTP_POOL_SIZE),
        follow_redirects=True,
    ) as http_client:
        seeder = CatalogSeeder(
            session_factory=session_factory,
            http_client=http_client,
            semaphore=semaphore,
            spotify_available=spotify_available,
            brazilian_names=brazilian_names,
        )
        await seeder.seed_all(artist_names)

    await engine.dispose()
    logger.info("Catalog seed completed.")


if __name__ == "__main__":
    asyncio.run(main())
