"""
Precomputation service that generates discovery sections from the local catalog.

All data is sourced from PostgreSQL — **no external API calls are made**.
Computed sections are cached in Redis via :class:`CatalogCacheService` and
refreshed on-demand or by a background scheduler.

Sections:
  - top_artists:          Top 50 artists by popularity
  - trending_tracks:      Top 100 tracks by popularity (with preview URLs)
  - featured_albums:      Top 30 albums with covers
  - popular_genres:       Top 20 genres by artist count
  - new_releases:         30 most recently added tracks
  - brazilian_artists:    Top 30 Brazilian artists
  - international_artists: Top 30 non-Brazilian artists
  - genre_sections:       Top 12 tracks per major genre (pop, rock, rap, electronic, rnb)
"""

from uuid import UUID

from sqlalchemy import func, select, update as sa_update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.infrastructure.models.catalog import (
    CatalogAlbumModel,
    CatalogArtistGenreModel,
    CatalogArtistModel,
    CatalogGenreModel,
    CatalogTrackModel,
)
from app.services.catalog.cache_service import CatalogCacheService

_DISCOVERY_SECTIONS = [
    "top_artists",
    "trending_tracks",
    "featured_albums",
    "popular_genres",
    "new_releases",
    "brazilian_artists",
    "international_artists",
]

_MAJOR_GENRE_SLUGS = ["pop", "rock", "rap", "electronic", "rnb"]


def _artist_to_dict(artist: CatalogArtistModel) -> dict:
    return {
        "id": str(artist.id),
        "name": artist.name,
        "image_url": artist.image_url,
        "popularity": artist.popularity,
        "country": artist.country,
        "is_brazilian": artist.is_brazilian,
        "bio": artist.bio,
    }


def _track_to_dict(track: CatalogTrackModel) -> dict:
    # Artwork fallback chain: album cover → artist image → None
    album_cover = (
        track.album.cover_url
        if (track.album and track.album.cover_url)
        else (track.artist.image_url if track.artist else None)
    )
    return {
        "id": str(track.id),
        "title": track.title,
        "artist_id": str(track.artist_id),
        "artist_name": track.artist.name if track.artist else "Unknown",
        "album_id": str(track.album_id) if track.album_id else None,
        "album_title": track.album.title if track.album else None,
        "album_cover": album_cover,
        "preview_url": track.preview_url,
        "duration_ms": track.duration_ms,
        "popularity": track.popularity,
        "track_number": track.track_number,
        "explicit": track.explicit,
        "isrc": track.isrc,
    }


def _album_to_dict(album: CatalogAlbumModel) -> dict:
    return {
        "id": str(album.id),
        "title": album.title,
        "artist_id": str(album.artist_id),
        "artist_name": album.artist.name if album.artist else "Unknown",
        "cover_url": album.cover_url,
        "release_date": album.release_date,
        "track_count": album.track_count,
    }


def _genre_to_dict(genre: CatalogGenreModel, artist_count: int = 0) -> dict:
    return {
        "id": str(genre.id),
        "name": genre.name,
        "slug": genre.slug,
        "artist_count": artist_count,
        "cover_url": genre.cover_image_url,
        "cover_artist_name": genre.cover_artist.name if genre.cover_artist else None,
    }


class DiscoveryPrecomputation:
    """
    Precomputes discovery sections from local catalog data.

    Each section is computed from PostgreSQL and cached via
    :class:`CatalogCacheService` for fast retrieval.
    """

    def __init__(self, session: AsyncSession, cache: CatalogCacheService) -> None:
        self._session = session
        self._cache = cache

    async def precompute_all(self) -> dict[str, list[dict]]:
        """Compute all discovery sections, cache them, and return the full result."""
        sections: dict[str, list[dict]] = {}

        sections["top_artists"] = await self.get_top_artists()
        sections["trending_tracks"] = await self.get_trending_tracks()
        sections["featured_albums"] = await self.get_featured_albums()
        sections["popular_genres"] = await self.get_popular_genres()
        sections["new_releases"] = await self.get_new_releases()
        sections["brazilian_artists"] = await self.get_brazilian_artists()
        sections["international_artists"] = await self.get_international_artists()

        genre_sections: dict[str, list[dict]] = {}
        for slug in _MAJOR_GENRE_SLUGS:
            genre_sections[slug] = await self.get_genre_section(slug)
        sections["genre_sections"] = genre_sections  # type: ignore[assignment]

        for section in _DISCOVERY_SECTIONS:
            if section in sections:
                await self._cache.set_cached_discovery(section, sections[section])

        return sections

    # ── Top Artists ────────────────────────────────────────────────────────

    async def get_top_artists(self, limit: int = 50) -> list[dict]:
        """Return top *limit* artists ordered by popularity descending."""
        cached = await self._cache.get_cached_discovery("top_artists")
        if cached and len(cached) >= limit:
            return cached[:limit]

        stmt = (
            select(CatalogArtistModel)
            .order_by(CatalogArtistModel.popularity.desc())
            .limit(limit)
        )
        result = await self._session.execute(stmt)
        data = [_artist_to_dict(a) for a in result.scalars()]
        await self._cache.set_cached_discovery("top_artists", data)
        return data

    # ── Trending Tracks ────────────────────────────────────────────────────

    async def get_trending_tracks(self, limit: int = 100) -> list[dict]:
        """Return diverse trending tracks — max 3 per artist, ordered by popularity."""
        cached = await self._cache.get_cached_discovery("trending_tracks")
        if cached and len(cached) >= limit:
            return cached[:limit]

        # CTE: rank tracks within each artist by popularity descending
        ranked = (
            select(
                CatalogTrackModel.id.label("inner_id"),
                func.row_number()
                .over(
                    partition_by=CatalogTrackModel.artist_id,
                    order_by=CatalogTrackModel.popularity.desc(),
                )
                .label("rn"),
            )
            .where(CatalogTrackModel.preview_url.is_not(None))
            .cte("trending_ranked")
        )

        stmt = (
            select(CatalogTrackModel)
            .options(
                selectinload(CatalogTrackModel.artist),
                selectinload(CatalogTrackModel.album),
            )
            .join(ranked, CatalogTrackModel.id == ranked.c.inner_id)
            .where(ranked.c.rn <= 3)
            .order_by(CatalogTrackModel.popularity.desc())
            .limit(limit)
        )
        result = await self._session.execute(stmt)
        data = [_track_to_dict(t) for t in result.scalars().unique()]
        await self._cache.set_cached_discovery("trending_tracks", data)
        return data

    # ── Featured Albums ────────────────────────────────────────────────────

    async def get_featured_albums(self, limit: int = 30) -> list[dict]:
        """Return top *limit* albums with cover art, ordered by track count."""
        cached = await self._cache.get_cached_discovery("featured_albums")
        if cached and len(cached) >= limit:
            return cached[:limit]

        stmt = (
            select(CatalogAlbumModel)
            .options(selectinload(CatalogAlbumModel.artist))
            .where(CatalogAlbumModel.cover_url.is_not(None))
            .order_by(CatalogAlbumModel.track_count.desc())
            .limit(limit)
        )
        result = await self._session.execute(stmt)
        data = [_album_to_dict(a) for a in result.scalars()]
        await self._cache.set_cached_discovery("featured_albums", data)
        return data

    # ── Popular Genres ─────────────────────────────────────────────────────

    async def get_popular_genres(self, limit: int = 20) -> list[dict]:
        """Return top *limit* genres ranked by number of associated artists."""
        cached = await self._cache.get_cached_discovery("popular_genres")
        if cached and len(cached) >= limit:
            return cached[:limit]

        stmt = (
            select(
                CatalogGenreModel,
                func.count(CatalogArtistGenreModel.artist_id).label("artist_count"),
            )
            .options(selectinload(CatalogGenreModel.cover_artist))
            .join(
                CatalogArtistGenreModel,
                CatalogGenreModel.id == CatalogArtistGenreModel.genre_id,
            )
            .group_by(CatalogGenreModel.id)
            .order_by(func.count(CatalogArtistGenreModel.artist_id).desc())
            .limit(limit)
        )
        result = await self._session.execute(stmt)
        data = [
            _genre_to_dict(genre, artist_count=count) for genre, count in result.tuples()
        ]
        await self._cache.set_cached_discovery("popular_genres", data)
        return data

    # ── New Releases ───────────────────────────────────────────────────────

    async def get_new_releases(self, limit: int = 30) -> list[dict]:
        """Return the *limit* most recently created tracks."""
        cached = await self._cache.get_cached_discovery("new_releases")
        if cached and len(cached) >= limit:
            return cached[:limit]

        stmt = (
            select(CatalogTrackModel)
            .options(selectinload(CatalogTrackModel.artist), selectinload(CatalogTrackModel.album))
            .order_by(CatalogTrackModel.created_at.desc())
            .limit(limit)
        )
        result = await self._session.execute(stmt)
        data = [_track_to_dict(t) for t in result.scalars()]
        await self._cache.set_cached_discovery("new_releases", data)
        return data

    # ── Brazilian Artists ──────────────────────────────────────────────────

    async def get_brazilian_artists(self, limit: int = 30) -> list[dict]:
        """Return top *limit* Brazilian artists by popularity."""
        cached = await self._cache.get_cached_discovery("brazilian_artists")
        if cached and len(cached) >= limit:
            return cached[:limit]

        stmt = (
            select(CatalogArtistModel)
            .where(CatalogArtistModel.is_brazilian == True)  # noqa: E712
            .order_by(CatalogArtistModel.popularity.desc())
            .limit(limit)
        )
        result = await self._session.execute(stmt)
        data = [_artist_to_dict(a) for a in result.scalars()]
        await self._cache.set_cached_discovery("brazilian_artists", data)
        return data

    # ── International Artists ──────────────────────────────────────────────

    async def get_international_artists(self, limit: int = 30) -> list[dict]:
        """Return top *limit* non-Brazilian artists by popularity."""
        cached = await self._cache.get_cached_discovery("international_artists")
        if cached and len(cached) >= limit:
            return cached[:limit]

        stmt = (
            select(CatalogArtistModel)
            .where(CatalogArtistModel.is_brazilian == False)  # noqa: E712
            .order_by(CatalogArtistModel.popularity.desc())
            .limit(limit)
        )
        result = await self._session.execute(stmt)
        data = [_artist_to_dict(a) for a in result.scalars()]
        await self._cache.set_cached_discovery("international_artists", data)
        return data

    # ── Genre Cover Precomputation ──────────────────────────────────────────


class GenreCoverPrecomputation:
    """
    Computes and persists the most popular artist's image as each genre's cover.

    For every genre, finds the artist with the highest ``popularity`` score
    (via the ``catalog_artist_genres`` junction table) and updates the genre's
    ``cover_image_url`` and ``cover_artist_id`` columns in PostgreSQL.

    Results are also cached in Redis under ``genre:covers`` for fast API responses.
    """

    def __init__(self, session: AsyncSession, cache: CatalogCacheService) -> None:
        self._session = session
        self._cache = cache

    async def recompute_all(self) -> int:
        """
        Recompute covers for ALL genres.

        Returns the number of genres updated.
        """
        genres_result = await self._session.execute(
            select(CatalogGenreModel).order_by(CatalogGenreModel.name)
        )
        genres = list(genres_result.scalars())
        updated = 0

        for genre in genres:
            top_artist = await self._find_top_artist(genre.id)
            new_cover_url = top_artist.image_url if top_artist else None
            new_artist_id = top_artist.id if top_artist else None

            if genre.cover_image_url != new_cover_url or genre.cover_artist_id != new_artist_id:
                stmt = (
                    sa_update(CatalogGenreModel)
                    .where(CatalogGenreModel.id == genre.id)
                    .values(
                        cover_image_url=new_cover_url,
                        cover_artist_id=new_artist_id,
                    )
                )
                await self._session.execute(stmt)
                updated += 1

        if updated > 0:
            await self._session.commit()

        # Refresh the genre caches
        await self._cache.invalidate_genres()
        genre_covers = await self._build_covers_dict(genres)
        await self._cache.set_cached_genre_covers(genre_covers)

        return updated

    async def _find_top_artist(self, genre_id: UUID) -> CatalogArtistModel | None:
        """Return the artist with highest popularity for a genre."""
        stmt = (
            select(CatalogArtistModel)
            .join(
                CatalogArtistGenreModel,
                CatalogArtistModel.id == CatalogArtistGenreModel.artist_id,
            )
            .where(CatalogArtistGenreModel.genre_id == genre_id)
            .order_by(CatalogArtistModel.popularity.desc())
            .limit(1)
        )
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()

    async def _build_covers_dict(
        self, genres: list[CatalogGenreModel] | None = None,
    ) -> dict[str, dict]:
        """Build a dict mapping slug → {cover_url, cover_artist_name} for caching."""
        if genres is None:
            result = await self._session.execute(
                select(CatalogGenreModel).options(
                    selectinload(CatalogGenreModel.cover_artist)
                )
            )
            genres = list(result.scalars())

        covers: dict[str, dict] = {}
        for genre in genres:
            covers[genre.slug] = {
                "cover_url": genre.cover_image_url,
                "cover_artist_name": genre.cover_artist.name if genre.cover_artist else None,
            }
        return covers

    async def get_genre_section(self, genre_slug: str, limit: int = 12) -> list[dict]:
        """Return diverse top *limit* tracks for a given genre slug — max 2 per artist."""
        section_key = f"genre:{genre_slug}"
        cached = await self._cache.get_cached_discovery(section_key)
        if cached and len(cached) >= limit:
            return cached[:limit]

        ranked = (
            select(
                CatalogTrackModel.id.label("inner_id"),
                func.row_number()
                .over(
                    partition_by=CatalogTrackModel.artist_id,
                    order_by=CatalogTrackModel.popularity.desc(),
                )
                .label("rn"),
            )
            .join(
                CatalogArtistGenreModel,
                CatalogTrackModel.artist_id == CatalogArtistGenreModel.artist_id,
            )
            .join(
                CatalogGenreModel,
                CatalogArtistGenreModel.genre_id == CatalogGenreModel.id,
            )
            .where(CatalogGenreModel.slug == genre_slug)
            .where(CatalogTrackModel.preview_url.is_not(None))
            .cte("genre_ranked")
        )

        stmt = (
            select(CatalogTrackModel)
            .options(
                selectinload(CatalogTrackModel.artist),
                selectinload(CatalogTrackModel.album),
            )
            .join(ranked, CatalogTrackModel.id == ranked.c.inner_id)
            .where(ranked.c.rn <= 2)
            .order_by(CatalogTrackModel.popularity.desc())
            .limit(limit)
        )
        result = await self._session.execute(stmt)
        data = [_track_to_dict(t) for t in result.scalars().unique()]
        await self._cache.set_cached_discovery(section_key, data)
        return data
