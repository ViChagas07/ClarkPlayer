"""
Small catalog seed script — populates ~100 artists for quick testing.

Usage:
    python scripts/catalog_seed_small.py

This script seeds a representative subset of artists across all genres
to validate the catalog pipeline without the full runtime of the main seed.
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
from app.services.music.clients.itunes import ITunesClient
from app.services.music.clients.spotify import SpotifyClient

logger = logging.getLogger("catalog_seed_small")

MAX_CONCURRENT = 10
BATCH_SIZE = 25
MAX_RETRIES = 3
RETRY_BACKOFF = [1.0, 2.0, 4.0]
MAX_TRACKS_PER_ARTIST = 20
HTTP_TIMEOUT = 30.0
HTTP_POOL_SIZE = 100

SMALL_SEED_ARTISTS: list[str] = [
    # Pop (8)
    "Taylor Swift", "Ed Sheeran", "Dua Lipa", "Billie Eilish",
    "The Weeknd", "SZA", "Olivia Rodrigo", "Sabrina Carpenter",
    # Rock (8)
    "Queen", "Nirvana", "Foo Fighters", "Red Hot Chili Peppers",
    "Coldplay", "Linkin Park", "Arctic Monkeys", "Radiohead",
    # Hip-Hop (8)
    "Kendrick Lamar", "Drake", "J. Cole", "Travis Scott",
    "Eminem", "Kanye West", "Tyler the Creator", "Post Malone",
    # R&B (5)
    "Beyonce", "Frank Ocean", "Alicia Keys", "H.E.R.",
    "Daniel Caesar",
    # Electronic (8)
    "Calvin Harris", "David Guetta", "Avicii", "Disclosure",
    "ODESZA", "Kygo", "Skrillex", "Marshmello",
    # Latin (6)
    "Bad Bunny", "Shakira", "Rosalia", "J Balvin",
    "Karol G", "Anitta",
    # K-Pop (4)
    "BTS", "BLACKPINK", "NewJeans", "Stray Kids",
    # Jazz (4)
    "Miles Davis", "John Coltrane", "Herbie Hancock", "Kamasi Washington",
    # Classical (4)
    "Ludovico Einaudi", "Max Richter", "Hans Zimmer", "Yo-Yo Ma",
    # Metal (4)
    "Tool", "System of a Down", "Slipknot", "Rammstein",
    # Indie (6)
    "Tame Impala", "Vampire Weekend", "Bon Iver", "Glass Animals",
    "Mac DeMarco", "Foster the People",
    # Country (6)
    "Luke Combs", "Morgan Wallen", "Chris Stapleton", "Zach Bryan",
    "Carrie Underwood", "Luke Bryan",
    # Reggae (3)
    "Bob Marley", "Damian Marley", "Jimmy Cliff",
    # Gospel (6)
    "Kirk Franklin", "CeCe Winans", "Donnie McClurkin", "Hillsong United",
    "Elevation Worship", "Maverick City Music",
    # Blues (4)
    "B.B. King", "Buddy Guy", "John Lee Hooker", "Robert Johnson",
    # Brazilian (30)
    "Caetano Veloso", "Gilberto Gil", "Elis Regina", "Tom Jobim",
    "Marisa Monte", "Djavan", "Anitta", "Ludmilla",
    "Marilia Mendonca", "Gusttavo Lima", "Jorge e Mateus",
    "Zeca Pagodinho", "Legiao Urbana", "Charlie Brown Jr",
    "Racionais Mcs", "Ivete Sangalo", "Seu Jorge",
    "Alceu Valenca", "Gal Costa", "Chico Buarque",
    "Tim Maia", "Jorge Ben Jor", "Roberto Carlos", "Luan Santana",
    "Matheus e Kauan", "Simone e Simaria", "Maiara e Maraisa",
    "Henrique e Juliano", "Zezé Di Camargo e Luciano", "Alok",
    # Soul/Funk (5)
    "Stevie Wonder", "Marvin Gaye", "Prince", "Anderson Paak",
    "James Brown",
    # Alternative (6)
    "Nine Inch Nails", "Bjork", "The Smashing Pumpkins", "Beck",
    "Radiohead", "Arcade Fire",
    # Singer-Songwriter (5)
    "Adele", "John Mayer", "Norah Jones", "Tracy Chapman",
    "Ed Sheeran",
    # Folk (4)
    "Bob Dylan", "Hozier", "Noah Kahan", "Mumford and Sons",
]

BRAZILIAN_NAMES = {n.lower() for n in [
    "Caetano Veloso", "Gilberto Gil", "Elis Regina", "Tom Jobim",
    "Marisa Monte", "Djavan", "Anitta", "Ludmilla",
    "Marília Mendonça", "Gusttavo Lima", "Jorge & Mateus",
    "Zeca Pagodinho", "Legião Urbana", "Charlie Brown Jr.",
    "Racionais MC's",
]}

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
    "alternative": ("#a29bfe", "#6c5ce7"),
    "sertanejo": ("#27ae60", "#2ecc71"),
    "mpb": ("#16a085", "#1abc9c"),
    "samba": ("#f39c12", "#e67e22"),
    "rock br": ("#2c3e50", "#34495e"),
    "rap br": ("#e67e22", "#d35400"),
}


def _slugify(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


def _chunks(iterable: list, size: int):
    for i in range(0, len(iterable), size):
        yield iterable[i : i + size]


async def _retry(func, *args, **kwargs):
    last_exc = None
    for attempt in range(MAX_RETRIES + 1):
        try:
            return await func(*args, **kwargs)
        except Exception as exc:
            last_exc = exc
            if attempt < MAX_RETRIES:
                wait = RETRY_BACKOFF[attempt]
                logger.debug("Retry %d/%d after %.1fs", attempt + 1, MAX_RETRIES, wait)
                await asyncio.sleep(wait)
            else:
                logger.warning("All %d retries exhausted", MAX_RETRIES)
    raise last_exc  # type: ignore[misc]


async def _redis_seen(key: str) -> bool:
    """Return True if *key* was already seen (Redis-backed dedup, optional)."""
    try:
        redis = await get_cache_redis()
        exists = await redis.exists(key)
        if not exists:
            await redis.setex(key, 86400 * 7, "1")
        return bool(exists)
    except Exception:
        return False  # Redis unavailable — skip dedup, rely on DB constraints


class SmallCatalogSeeder:
    """Lightweight seeder for quick testing."""

    def __init__(
        self,
        session_factory: async_sessionmaker[AsyncSession],
        http_client: httpx.AsyncClient,
        semaphore: asyncio.Semaphore,
        spotify_available: bool,
    ) -> None:
        self._session_factory = session_factory
        self._http = http_client
        self._semaphore = semaphore
        self._itunes = ITunesClient(http_client)
        self._spotify = SpotifyClient(http_client) if spotify_available else None

        self.stats: dict[str, int] = {
            "artists_processed": 0,
            "albums_created": 0,
            "tracks_created": 0,
            "tracks_with_preview": 0,
            "genres_created": 0,
            "errors": 0,
        }

    async def seed_all(self, artist_names: list[str]) -> None:
        total = len(artist_names)
        logger.info("Starting small catalog seed: %d artists", total)

        for batch in _chunks(artist_names, BATCH_SIZE):
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
        for name in artist_names:
            try:
                async with self._session_factory() as session:
                    await self._process_artist(session, name)
                    await session.commit()
                    self.stats["artists_processed"] += 1
            except Exception:
                logger.exception("Failed to process %r", name)
                self.stats["errors"] += 1

                if self.stats["artists_processed"] % 5 == 0:
                    logger.info(
                        "  Done %d artists | tracks: %d (previews: %d)",
                        self.stats["artists_processed"],
                        self.stats["tracks_created"],
                        self.stats["tracks_with_preview"],
                    )

            await session.commit()

    async def _process_artist(self, session: AsyncSession, name: str) -> None:
        async with self._semaphore:
            dedup_key = f"clark:seed:small:{name.lower()}"
            if await _redis_seen(dedup_key):
                return

            itunes_tracks = await _retry(
                self._itunes.search,
                term=name,
                media="music",
                entity="musicTrack",
                limit=MAX_TRACKS_PER_ARTIST,
                country="US",
            )

            genre_names: list[str] = []
            popularity: int = 0
            image_url: str | None = None

            if self._spotify:
                try:
                    sp_search = await _retry(self._spotify.search_artist, query=name, limit=1)
                    if sp_search and sp_search.get("artists", {}).get("items"):
                        item = sp_search["artists"]["items"][0]
                        genre_names = item.get("genres", [])
                        popularity = item.get("popularity", 0)
                        images = item.get("images", [])
                        if images:
                            image_url = images[0].get("url")
                except Exception:
                    logger.debug("Spotify enrichment failed for %r", name, exc_info=True)

            # Fallback: fetch artist image from iTunes if Spotify didn"t provide one
            if not image_url:
                try:
                    image_url = await _retry(
                        self._itunes.get_artist_image, artist=name
                    )
                except Exception:
                    logger.debug("iTunes artist image failed for %r", name, exc_info=True)

            if not genre_names:
                itunes_genres: set[str] = set()
                for t in itunes_tracks:
                    g = t.get("primaryGenreName")
                    if g:
                        itunes_genres.add(g)
                genre_names = sorted(itunes_genres)

            is_brazilian = name.lower() in BRAZILIAN_NAMES

            artist = await self._upsert_artist(
                session,
                name=name,
                image_url=image_url,
                popularity=popularity,
                is_brazilian=is_brazilian,
            )

            await self._link_genres(session, artist, genre_names)

            album_cache: dict[str, CatalogAlbumModel] = {}
            for track_data in itunes_tracks:
                track_title = track_data.get("trackName") or track_data.get("collectionName", "")
                if not track_title:
                    continue

                album_title = track_data.get("collectionName")
                album = None
                if album_title:
                    key = album_title.lower().strip()
                    if key not in album_cache:
                        art = track_data.get("artworkUrl100")
                        cover = ITunesClient.get_best_artwork(art, 600) if art else None
                        album = await self._upsert_album(
                            session,
                            title=album_title,
                            artist_id=artist.id,
                            cover_url=cover,
                            release_date=(track_data.get("releaseDate", "") or "")[:10] or None,
                            track_count=track_data.get("trackCount") or 0,
                        )
                        album_cache[key] = album
                        self.stats["albums_created"] += 1
                    else:
                        album = album_cache[key]

                preview_url = track_data.get("previewUrl")
                await self._upsert_track(
                    session,
                    title=track_title,
                    artist_id=artist.id,
                    album_id=album.id if album else None,
                    duration_ms=track_data.get("trackTimeMillis"),
                    preview_url=preview_url,
                    popularity=popularity,
                )

                self.stats["tracks_created"] += 1
                if preview_url:
                    self.stats["tracks_with_preview"] += 1

    async def _upsert_artist(
        self, session: AsyncSession, *, name: str, image_url: str | None,
        popularity: int, is_brazilian: bool,
    ) -> CatalogArtistModel:
        stmt = pg_insert(CatalogArtistModel).values(
            name=name, image_url=image_url, popularity=popularity,
            is_brazilian=is_brazilian, country=None,
        )
        stmt = stmt.on_conflict_do_update(
            index_elements=["name"],
            set_={
                "image_url": stmt.excluded.image_url,
                "popularity": stmt.excluded.popularity,
                "is_brazilian": stmt.excluded.is_brazilian,
                "updated_at": datetime.now(timezone.utc),
            },
        )
        await session.execute(stmt)
        result = await session.execute(
            select(CatalogArtistModel).where(CatalogArtistModel.name == name)
        )
        return result.scalar_one()

    async def _upsert_album(
        self, session: AsyncSession, *, title: str, artist_id,
        cover_url: str | None, release_date: str | None, track_count: int,
    ) -> CatalogAlbumModel:
        stmt = pg_insert(CatalogAlbumModel).values(
            title=title, artist_id=artist_id, cover_url=cover_url,
            release_date=release_date, track_count=track_count, country=None,
        )
        stmt = stmt.on_conflict_do_update(
            index_elements=["title", "artist_id"],
            set_={"cover_url": stmt.excluded.cover_url, "updated_at": datetime.now(timezone.utc)},
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
        self, session: AsyncSession, *, title: str, artist_id,
        album_id, duration_ms: int | None, preview_url: str | None,
        popularity: int,
    ) -> None:
        stmt = pg_insert(CatalogTrackModel).values(
            title=title, artist_id=artist_id, album_id=album_id,
            duration_ms=duration_ms, preview_url=preview_url, popularity=popularity,
        )
        stmt = stmt.on_conflict_do_update(
            index_elements=["title", "artist_id"],
            set_={
                "duration_ms": stmt.excluded.duration_ms,
                "popularity": stmt.excluded.popularity,
                "updated_at": datetime.now(timezone.utc),
            },
        )
        await session.execute(stmt)

    async def _link_genres(
        self, session: AsyncSession, artist: CatalogArtistModel, genre_names: list[str]
    ) -> None:
        for genre_name in genre_names:
            if not genre_name or not genre_name.strip():
                continue
            gname = genre_name.strip().lower()
            slug = _slugify(gname)

            stmt = pg_insert(CatalogGenreModel).values(
                name=gname,
                slug=slug,
                gradient_from=_GENRE_COLORS.get(gname, ("#1a1a2e", "#16213e"))[0],
                gradient_to=_GENRE_COLORS.get(gname, ("#1a1a2e", "#16213e"))[1],
            )
            stmt = stmt.on_conflict_do_update(
                index_elements=["name"],
                set_={"name": stmt.excluded.name},
            )
            await session.execute(stmt)
            self.stats["genres_created"] += 1

            result = await session.execute(
                select(CatalogGenreModel).where(CatalogGenreModel.name == gname)
            )
            genre = result.scalar_one()

            link_stmt = pg_insert(CatalogArtistGenreModel).values(
                artist_id=artist.id, genre_id=genre.id,
            )
            link_stmt = link_stmt.on_conflict_do_nothing()
            await session.execute(link_stmt)

    def _print_summary(self) -> None:
        print("\n" + "=" * 50)
        print("  SMALL CATALOG SEED SUMMARY")
        print("=" * 50)
        print(f"  Artists processed  : {self.stats['artists_processed']:>5}")
        print(f"  Albums created     : {self.stats['albums_created']:>5}")
        print(f"  Tracks created     : {self.stats['tracks_created']:>5}")
        print(f"  Tracks with preview: {self.stats['tracks_with_preview']:>5}")
        print(f"  Genres created     : {self.stats['genres_created']:>5}")
        print(f"  Errors             : {self.stats['errors']:>5}")
        print("=" * 50)


async def main() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
        datefmt="%H:%M:%S",
    )

    settings = get_settings()
    spotify_available = bool(settings.SPOTIFY_CLIENT_ID and settings.SPOTIFY_CLIENT_SECRET)
    if not spotify_available:
        logger.warning("Spotify credentials not configured — running iTunes-only mode.")

    engine = create_async_engine(
        settings.DATABASE_URL, echo=False, pool_size=10,
        max_overflow=20, pool_pre_ping=True,
    )
    session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    semaphore = asyncio.Semaphore(MAX_CONCURRENT)

    async with httpx.AsyncClient(
        timeout=httpx.Timeout(HTTP_TIMEOUT),
        limits=httpx.Limits(max_connections=HTTP_POOL_SIZE),
        follow_redirects=True,
    ) as http_client:
        seeder = SmallCatalogSeeder(
            session_factory=session_factory,
            http_client=http_client,
            semaphore=semaphore,
            spotify_available=spotify_available,
        )
        await seeder.seed_all(SMALL_SEED_ARTISTS)

    await engine.dispose()
    logger.info("Small catalog seed completed.")


if __name__ == "__main__":
    asyncio.run(main())
