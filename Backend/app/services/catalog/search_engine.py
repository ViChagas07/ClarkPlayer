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

from dataclasses import dataclass, field

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.models.catalog import (
    CatalogAlbumModel,
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
        """
        artists = await self.search_artists(query, limit=limit, offset=offset)
        tracks = await self.search_tracks(query, limit=limit, offset=offset)
        albums = await self.search_albums(query, limit=limit, offset=offset)
        genres = await self.search_genres(query, limit=10)

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
