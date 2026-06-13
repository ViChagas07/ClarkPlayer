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

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

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
    return {
        "id": str(track.id),
        "title": track.title,
        "artist_id": str(track.artist_id),
        "artist_name": track.artist.name if track.artist else "Unknown",
        "album_id": str(track.album_id) if track.album_id else None,
        "album_title": track.album.title if track.album else None,
        "album_cover": track.album.cover_url if track.album else None,
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
        """Return top *limit* tracks by popularity with preview URLs."""
        cached = await self._cache.get_cached_discovery("trending_tracks")
        if cached and len(cached) >= limit:
            return cached[:limit]

        stmt = (
            select(CatalogTrackModel)
            .where(CatalogTrackModel.preview_url.is_not(None))
            .order_by(CatalogTrackModel.popularity.desc())
            .limit(limit)
        )
        result = await self._session.execute(stmt)
        data = [_track_to_dict(t) for t in result.scalars()]
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

    # ── Genre Section ──────────────────────────────────────────────────────

    async def get_genre_section(self, genre_slug: str, limit: int = 12) -> list[dict]:
        """Return top *limit* tracks for a given genre slug."""
        section_key = f"genre:{genre_slug}"
        cached = await self._cache.get_cached_discovery(section_key)
        if cached and len(cached) >= limit:
            return cached[:limit]

        stmt = (
            select(CatalogTrackModel)
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
            .order_by(CatalogTrackModel.popularity.desc())
            .limit(limit)
        )
        result = await self._session.execute(stmt)
        data = [_track_to_dict(t) for t in result.scalars().unique()]
        await self._cache.set_cached_discovery(section_key, data)
        return data
