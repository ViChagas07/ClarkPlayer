"""
Local search engine for the music catalog.

Uses PostgreSQL ILIKE for substring matching (indexed via pg_trgm) combined
with full-text search concepts expressed through LIKE patterns.  All queries
target the local catalog tables — **no external APIs are called**.

Performance target: <100 ms per query.

Search targets:
  - Artists by name
  - Tracks by title
  - Albums by title
  - Genres by name

Strategy:
  1. ILIKE for exact substring matches (fast, indexed with pg_trgm)
  2. Trigram similarity for fuzzy matching via ``similarity()``
  3. Results ordered by relevance score, then popularity descending
"""

import asyncio
from dataclasses import dataclass, field

from sqlalchemy import desc, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.infrastructure.database import _async_session_factory
from app.infrastructure.models.catalog import (
    CatalogAlbumModel,
    CatalogArtistGenreModel,
    CatalogArtistModel,
    CatalogGenreModel,
    CatalogTrackModel,
)


@dataclass(kw_only=True, slots=True)
class CatalogSearchResults:
    """Aggregated search results across all entity types."""

    query: str
    artists: list[dict] = field(default_factory=list)
    tracks: list[dict] = field(default_factory=list)
    albums: list[dict] = field(default_factory=list)
    genres: list[dict] = field(default_factory=list)
    total: int = 0


class CatalogSearchEngine:
    """
    Local search engine for the music catalog.

    Uses PostgreSQL ILIKE and ``similarity()`` (pg_trgm extension) to
    deliver sub-100 ms search across all catalog entity types.
    """

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    # ── Search Everything ──────────────────────────────────────────────────

    async def search_everything(
        self, query: str, limit: int = 20, offset: int = 0
    ) -> CatalogSearchResults:
        """
        Search across all entity types.

        Returns aggregated results with artists, tracks, albums, and genres
        matching the query string.

        Each search runs in its OWN isolated session to avoid
        ``IllegalStateChangeError`` — ``AsyncSession`` is not safe for
        concurrent I/O across multiple coroutines sharing the same instance.
        The ``asyncio.gather`` parallelism is preserved, but every coroutine
        gets a private session created via ``_async_session_factory``.
        """

        async def _search_artists_isolated():
            async with _async_session_factory() as session:
                engine = CatalogSearchEngine(session)
                return await engine.search_artists(query, limit=limit, offset=offset)

        async def _search_tracks_isolated():
            async with _async_session_factory() as session:
                engine = CatalogSearchEngine(session)
                return await engine.search_tracks(query, limit=limit, offset=offset)

        async def _search_albums_isolated():
            async with _async_session_factory() as session:
                engine = CatalogSearchEngine(session)
                return await engine.search_albums(query, limit=limit, offset=offset)

        async def _search_genres_isolated():
            async with _async_session_factory() as session:
                engine = CatalogSearchEngine(session)
                return await engine.search_genres(query, limit=10)

        artists, tracks, albums, genres = await asyncio.gather(
            _search_artists_isolated(),
            _search_tracks_isolated(),
            _search_albums_isolated(),
            _search_genres_isolated(),
        )

        total = len(artists) + len(tracks) + len(albums) + len(genres)
        return CatalogSearchResults(
            query=query,
            artists=artists,
            tracks=tracks,
            albums=albums,
            genres=genres,
            total=total,
        )

    # ── Artists ────────────────────────────────────────────────────────────

    async def search_artists(
        self, query: str, limit: int = 20, offset: int = 0
    ) -> list[dict]:
        """
        Search artists by name using ILIKE and trigram similarity.

        Returns results ordered by similarity score then popularity.
        """
        pattern = f"%{query}%"
        stmt = (
            select(
                CatalogArtistModel,
                func.similarity(CatalogArtistModel.name, query).label("similarity"),
            )
            .where(CatalogArtistModel.name.ilike(pattern))
            .order_by(func.similarity(CatalogArtistModel.name, query).desc())
            .order_by(CatalogArtistModel.popularity.desc())
            .offset(offset)
            .limit(limit)
        )
        result = await self._session.execute(stmt)
        return [
            {
                "id": str(artist.id),
                "name": artist.name,
                "image_url": artist.image_url,
                "genres": [
                    assoc.genre.name
                    for assoc in artist.genre_associations
                    if assoc.genre is not None
                ],
                "popularity": artist.popularity,
                "country": artist.country,
                "is_brazilian": artist.is_brazilian,
                "bio": artist.bio,
                "similarity": round(float(sim), 4),
            }
            for artist, sim in result.tuples()
        ]

    # ── Tracks ─────────────────────────────────────────────────────────────

    async def search_tracks(
        self, query: str, limit: int = 20, offset: int = 0
    ) -> list[dict]:
        """
        Search tracks by title or artist name using ILIKE.

        Returns results ordered by popularity descending.
        """
        pattern = f"%{query}%"
        stmt = (
            select(CatalogTrackModel)
            .options(
                joinedload(CatalogTrackModel.artist),
                joinedload(CatalogTrackModel.album),
            )
            .join(CatalogArtistModel, CatalogTrackModel.artist_id == CatalogArtistModel.id)
            .where(
                or_(
                    CatalogTrackModel.title.ilike(pattern),
                    CatalogArtistModel.name.ilike(pattern),
                )
            )
            .order_by(CatalogTrackModel.popularity.desc())
            .offset(offset)
            .limit(limit)
        )
        result = await self._session.execute(stmt)
        return [
            {
                "id": str(t.id),
                "title": t.title,
                "artist_id": str(t.artist_id),
                "artist_name": t.artist.name if t.artist else "Unknown",
                "album_id": str(t.album_id) if t.album_id else None,
                "album_title": t.album.title if t.album else None,
                "album_cover": t.album.cover_url if t.album else None,
                "preview_url": t.preview_url,
                "duration_ms": t.duration_ms,
                "popularity": t.popularity,
                "explicit": t.explicit,
                "isrc": t.isrc,
            }
            for t in result.scalars().unique()
        ]

    # ── Albums ─────────────────────────────────────────────────────────────

    async def search_albums(
        self, query: str, limit: int = 20, offset: int = 0
    ) -> list[dict]:
        """
        Search albums by title using ILIKE.

        Returns results ordered by track count descending.
        """
        pattern = f"%{query}%"
        stmt = (
            select(CatalogAlbumModel)
            .options(
                joinedload(CatalogAlbumModel.artist),
            )
            .where(CatalogAlbumModel.title.ilike(pattern))
            .order_by(CatalogAlbumModel.track_count.desc())
            .offset(offset)
            .limit(limit)
        )
        result = await self._session.execute(stmt)
        return [
            {
                "id": str(a.id),
                "title": a.title,
                "artist_id": str(a.artist_id),
                "artist_name": a.artist.name if a.artist else "Unknown",
                "cover_url": a.cover_url,
                "release_date": a.release_date,
                "track_count": a.track_count,
            }
            for a in result.scalars()
        ]

    # ── Genres ─────────────────────────────────────────────────────────────

    async def search_genres(self, query: str, limit: int = 10) -> list[dict]:
        """
        Search genres by name using ILIKE.

        Returns results ordered alphabetically.
        """
        pattern = f"%{query}%"
        stmt = (
            select(CatalogGenreModel)
            .where(CatalogGenreModel.name.ilike(pattern))
            .order_by(CatalogGenreModel.name)
            .limit(limit)
        )
        result = await self._session.execute(stmt)
        return [
            {
                "id": str(g.id),
                "name": g.name,
                "slug": g.slug,
                "artist_count": 0,
            }
            for g in result.scalars()
        ]

    # ── Genre Mosaic ──────────────────────────────────────────────────────────

    async def get_genre_mosaic_images(
        self, genre_id: str, limit: int = 4
    ) -> list[str]:
        """
        Return up to ``limit`` artist image URLs for the genre mosaic cover.

        Selects the most popular artists linked to the genre via
        catalog_artist_genres, filtering out artists without an image_url.
        Used to render the 2×2 mosaic on the genre card.
        """
        stmt = (
            select(CatalogArtistModel.image_url)
            .join(
                CatalogArtistGenreModel,
                CatalogArtistModel.id == CatalogArtistGenreModel.artist_id,
            )
            .where(
                CatalogArtistGenreModel.genre_id == genre_id,
                CatalogArtistModel.image_url.isnot(None),
                CatalogArtistModel.image_url != "",
            )
            .order_by(desc(CatalogArtistModel.popularity))
            .limit(limit)
        )
        result = await self._session.execute(stmt)
        return [row for row in result.scalars().all()]

    # ── Autocomplete ───────────────────────────────────────────────────────

    async def autocomplete(self, prefix: str, limit: int = 8) -> list[str]:
        """
        Fast prefix search for autocomplete suggestions.

        Searches artist names, track titles, and album titles with a prefix
        ``ILIKE`` query.  Results are de-duplicated and limited to *limit*.
        """
        pattern = f"{prefix}%"
        suggestions: list[str] = []

        artist_stmt = (
            select(CatalogArtistModel.name)
            .where(CatalogArtistModel.name.ilike(pattern))
            .order_by(CatalogArtistModel.popularity.desc())
            .limit(limit)
        )
        artist_result = await self._session.execute(artist_stmt)
        for name in artist_result.scalars():
            if name not in suggestions:
                suggestions.append(name)

        if len(suggestions) < limit:
            track_stmt = (
                select(CatalogTrackModel.title)
                .where(CatalogTrackModel.title.ilike(pattern))
                .order_by(CatalogTrackModel.popularity.desc())
                .limit(limit * 2)
            )
            track_result = await self._session.execute(track_stmt)
            for title in track_result.scalars():
                if title not in suggestions:
                    suggestions.append(title)
                if len(suggestions) >= limit:
                    break

        if len(suggestions) < limit:
            album_stmt = (
                select(CatalogAlbumModel.title)
                .where(CatalogAlbumModel.title.ilike(pattern))
                .order_by(CatalogAlbumModel.track_count.desc())
                .limit(limit * 2)
            )
            album_result = await self._session.execute(album_stmt)
            for title in album_result.scalars():
                if title not in suggestions:
                    suggestions.append(title)
                if len(suggestions) >= limit:
                    break

        return suggestions[:limit]

    async def search_suggestions(self, prefix: str, per_category: int = 5) -> dict:
        """
        Return categorized suggestions for search-as-you-type.

        Returns up to *per_category* results for each of artists, albums, and
        tracks — with enough metadata to render a rich dropdown.
        """
        pattern = f"{prefix}%"

        # ── Artists ─────────────────────────────────────────────────
        artist_stmt = (
            select(
                CatalogArtistModel.id,
                CatalogArtistModel.name,
                CatalogArtistModel.image_url,
            )
            .where(CatalogArtistModel.name.ilike(pattern))
            .order_by(CatalogArtistModel.popularity.desc())
            .limit(per_category)
        )
        artist_result = await self._session.execute(artist_stmt)
        artists = [
            {
                "id": str(row.id),
                "name": row.name,
                "image_url": row.image_url,
            }
            for row in artist_result
        ]

        # ── Albums ──────────────────────────────────────────────────
        album_stmt = (
            select(
                CatalogAlbumModel.id,
                CatalogAlbumModel.title,
                CatalogAlbumModel.cover_url,
                CatalogArtistModel.name.label("artist_name"),
            )
            .join(
                CatalogArtistModel,
                CatalogAlbumModel.artist_id == CatalogArtistModel.id,
            )
            .where(CatalogAlbumModel.title.ilike(pattern))
            .order_by(CatalogAlbumModel.track_count.desc())
            .limit(per_category)
        )
        album_result = await self._session.execute(album_stmt)
        albums = [
            {
                "id": str(row.id),
                "title": row.title,
                "artist_name": row.artist_name,
                "cover_url": row.cover_url,
            }
            for row in album_result
        ]

        # ── Tracks ──────────────────────────────────────────────────
        track_stmt = (
            select(
                CatalogTrackModel.id,
                CatalogTrackModel.title,
                CatalogAlbumModel.cover_url,
                CatalogArtistModel.name.label("artist_name"),
            )
            .join(
                CatalogArtistModel,
                CatalogTrackModel.artist_id == CatalogArtistModel.id,
            )
            .outerjoin(
                CatalogAlbumModel,
                CatalogTrackModel.album_id == CatalogAlbumModel.id,
            )
            .where(CatalogTrackModel.title.ilike(pattern))
            .order_by(CatalogTrackModel.popularity.desc())
            .limit(per_category)
        )
        track_result = await self._session.execute(track_stmt)
        tracks = [
            {
                "id": str(row.id),
                "title": row.title,
                "artist_name": row.artist_name,
                "cover_url": row.cover_url,
            }
            for row in track_result
        ]

        return {
            "artists": artists,
            "albums": albums,
            "tracks": tracks,
        }
