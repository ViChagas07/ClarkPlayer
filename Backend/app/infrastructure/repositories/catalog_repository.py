"""
Concrete SQLAlchemy implementations for the local catalog system.

Implements:
- :class:`CatalogArtistRepository`
- :class:`CatalogAlbumRepository`
- :class:`CatalogTrackRepository`
- :class:`CatalogGenreRepository`
- :class:`TrackPreviewRepository`
"""

from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.application.interfaces.repositories import (
    ICatalogAlbumRepository,
    ICatalogArtistRepository,
    ICatalogGenreRepository,
    ICatalogTrackRepository,
    ITrackPreviewRepository,
)
from app.domain.entities import (
    CatalogAlbum,
    CatalogArtist,
    CatalogArtistGenre,
    CatalogGenre,
    CatalogTrack,
    TrackPreview,
)
from app.infrastructure.models.catalog import (
    CatalogAlbumModel,
    CatalogArtistGenreModel,
    CatalogArtistModel,
    CatalogGenreModel,
    CatalogTrackModel,
    TrackPreviewModel,
)
from app.infrastructure.repositories.base import (
    catalog_album_to_entity,
    catalog_album_to_model,
    catalog_artist_genre_to_entity,
    catalog_artist_to_entity,
    catalog_artist_to_model,
    catalog_genre_to_entity,
    catalog_genre_to_model,
    catalog_track_to_entity,
    catalog_track_to_model,
    track_preview_to_entity,
    track_preview_to_model,
)

# ── External ID source → column mapping ────────────────────────────────────

_EXTERNAL_SOURCE_MAP: dict[str, str] = {
    "mb": "external_mb_id",
    "musicbrainz": "external_mb_id",
    "spotify": "external_spotify_id",
    "itunes": "external_itunes_id",
    "apple": "external_itunes_id",
}


def _resolve_external_column(source: str) -> str:
    """Resolve a human-friendly source name to the SQLAlchemy column name."""
    col = _EXTERNAL_SOURCE_MAP.get(source.lower())
    if col is None:
        raise ValueError(
            f"Unknown external source {source!r}. "
            f"Expected one of: {', '.join(_EXTERNAL_SOURCE_MAP.keys())}"
        )
    return col


# ── Shared update helper ───────────────────────────────────────────────────


def _apply_updates(model: object, mapped: object) -> None:
    """Copy non-private, non-id, non-created_at fields from *mapped* onto *model*."""
    for field, value in mapped.__dict__.items():
        if not field.startswith("_") and field not in ("id", "created_at"):
            setattr(model, field, value)


# ── CatalogArtistRepository ────────────────────────────────────────────────


class CatalogArtistRepository(ICatalogArtistRepository):
    """SQLAlchemy-backed persistence for :class:`CatalogArtist`."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_id(self, artist_id: UUID) -> CatalogArtist | None:
        model = await self._session.get(CatalogArtistModel, artist_id)
        return catalog_artist_to_entity(model) if model else None

    async def get_by_name(self, name: str) -> CatalogArtist | None:
        result = await self._session.execute(
            select(CatalogArtistModel).where(CatalogArtistModel.name == name)
        )
        model = result.scalar_one_or_none()
        return catalog_artist_to_entity(model) if model else None

    async def get_by_external_id(
        self, source: str, external_id: str
    ) -> CatalogArtist | None:
        col = getattr(CatalogArtistModel, _resolve_external_column(source))
        result = await self._session.execute(
            select(CatalogArtistModel).where(col == external_id)
        )
        model = result.scalar_one_or_none()
        return catalog_artist_to_entity(model) if model else None

    async def search(
        self, query: str, *, limit: int = 20, offset: int = 0
    ) -> list[CatalogArtist]:
        pattern = f"%{query}%"
        stmt = (
            select(CatalogArtistModel)
            .where(CatalogArtistModel.name.ilike(pattern))
            .order_by(CatalogArtistModel.popularity.desc())
            .offset(offset)
            .limit(limit)
        )
        result = await self._session.execute(stmt)
        return [catalog_artist_to_entity(m) for m in result.scalars()]

    async def list_by_popularity(self, limit: int = 50) -> list[CatalogArtist]:
        stmt = (
            select(CatalogArtistModel)
            .order_by(CatalogArtistModel.popularity.desc())
            .limit(limit)
        )
        result = await self._session.execute(stmt)
        return [catalog_artist_to_entity(m) for m in result.scalars()]

    async def list_brazilian(self, limit: int = 50) -> list[CatalogArtist]:
        stmt = (
            select(CatalogArtistModel)
            .where(CatalogArtistModel.is_brazilian == True)  # noqa: E712
            .order_by(CatalogArtistModel.popularity.desc())
            .limit(limit)
        )
        result = await self._session.execute(stmt)
        return [catalog_artist_to_entity(m) for m in result.scalars()]

    async def list_international(self, limit: int = 50) -> list[CatalogArtist]:
        stmt = (
            select(CatalogArtistModel)
            .where(CatalogArtistModel.is_brazilian == False)  # noqa: E712
            .order_by(CatalogArtistModel.popularity.desc())
            .limit(limit)
        )
        result = await self._session.execute(stmt)
        return [catalog_artist_to_entity(m) for m in result.scalars()]

    async def upsert(self, artist: CatalogArtist) -> CatalogArtist:
        result = await self._session.execute(
            select(CatalogArtistModel).where(CatalogArtistModel.name == artist.name)
        )
        model = result.scalar_one_or_none()

        if model is not None:
            mapped = catalog_artist_to_model(artist)
            _apply_updates(model, mapped)
            await self._session.flush()
            return catalog_artist_to_entity(model)

        model = catalog_artist_to_model(artist)
        self._session.add(model)
        await self._session.flush()
        return catalog_artist_to_entity(model)

    async def count(self) -> int:
        result = await self._session.execute(
            select(func.count()).select_from(CatalogArtistModel)
        )
        return result.scalar_one()


# ── CatalogAlbumRepository ─────────────────────────────────────────────────


class CatalogAlbumRepository(ICatalogAlbumRepository):
    """SQLAlchemy-backed persistence for :class:`CatalogAlbum`."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_id(self, album_id: UUID) -> CatalogAlbum | None:
        model = await self._session.get(CatalogAlbumModel, album_id)
        return catalog_album_to_entity(model) if model else None

    async def get_by_title_and_artist(
        self, title: str, artist_id: UUID
    ) -> CatalogAlbum | None:
        result = await self._session.execute(
            select(CatalogAlbumModel).where(
                CatalogAlbumModel.title == title,
                CatalogAlbumModel.artist_id == artist_id,
            )
        )
        model = result.scalar_one_or_none()
        return catalog_album_to_entity(model) if model else None

    async def get_by_external_id(
        self, source: str, external_id: str
    ) -> CatalogAlbum | None:
        col = getattr(CatalogAlbumModel, _resolve_external_column(source))
        result = await self._session.execute(
            select(CatalogAlbumModel).where(col == external_id)
        )
        model = result.scalar_one_or_none()
        return catalog_album_to_entity(model) if model else None

    async def search(
        self, query: str, *, limit: int = 20, offset: int = 0
    ) -> list[CatalogAlbum]:
        pattern = f"%{query}%"
        stmt = (
            select(CatalogAlbumModel)
            .where(CatalogAlbumModel.title.ilike(pattern))
            .order_by(CatalogAlbumModel.title)
            .offset(offset)
            .limit(limit)
        )
        result = await self._session.execute(stmt)
        return [catalog_album_to_entity(m) for m in result.scalars()]

    async def list_by_artist(self, artist_id: UUID) -> list[CatalogAlbum]:
        stmt = (
            select(CatalogAlbumModel)
            .where(CatalogAlbumModel.artist_id == artist_id)
            .order_by(CatalogAlbumModel.title)
        )
        result = await self._session.execute(stmt)
        return [catalog_album_to_entity(m) for m in result.scalars()]

    async def upsert(self, album: CatalogAlbum) -> CatalogAlbum:
        result = await self._session.execute(
            select(CatalogAlbumModel).where(
                CatalogAlbumModel.title == album.title,
                CatalogAlbumModel.artist_id == album.artist_id,
            )
        )
        model = result.scalar_one_or_none()

        if model is not None:
            mapped = catalog_album_to_model(album)
            _apply_updates(model, mapped)
            await self._session.flush()
            return catalog_album_to_entity(model)

        model = catalog_album_to_model(album)
        self._session.add(model)
        await self._session.flush()
        return catalog_album_to_entity(model)

    async def count(self) -> int:
        result = await self._session.execute(
            select(func.count()).select_from(CatalogAlbumModel)
        )
        return result.scalar_one()


# ── CatalogTrackRepository ─────────────────────────────────────────────────


class CatalogTrackRepository(ICatalogTrackRepository):
    """SQLAlchemy-backed persistence for :class:`CatalogTrack`."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_id(self, track_id: UUID) -> CatalogTrack | None:
        model = await self._session.get(CatalogTrackModel, track_id)
        return catalog_track_to_entity(model) if model else None

    async def get_by_isrc(self, isrc: str) -> CatalogTrack | None:
        result = await self._session.execute(
            select(CatalogTrackModel).where(CatalogTrackModel.isrc == isrc)
        )
        model = result.scalar_one_or_none()
        return catalog_track_to_entity(model) if model else None

    async def get_by_external_id(
        self, source: str, external_id: str
    ) -> CatalogTrack | None:
        col = getattr(CatalogTrackModel, _resolve_external_column(source))
        result = await self._session.execute(
            select(CatalogTrackModel).where(col == external_id)
        )
        model = result.scalar_one_or_none()
        return catalog_track_to_entity(model) if model else None

    async def search(
        self, query: str, *, limit: int = 20, offset: int = 0
    ) -> list[CatalogTrack]:
        pattern = f"%{query}%"
        stmt = (
            select(CatalogTrackModel)
            .where(CatalogTrackModel.title.ilike(pattern))
            .order_by(CatalogTrackModel.popularity.desc())
            .offset(offset)
            .limit(limit)
        )
        result = await self._session.execute(stmt)
        return [catalog_track_to_entity(m) for m in result.scalars()]

    async def list_by_artist(
        self, artist_id: UUID, *, limit: int = 50, offset: int = 0
    ) -> list[CatalogTrack]:
        stmt = (
            select(CatalogTrackModel)
            .where(CatalogTrackModel.artist_id == artist_id)
            .order_by(CatalogTrackModel.popularity.desc())
            .offset(offset)
            .limit(limit)
        )
        result = await self._session.execute(stmt)
        return [catalog_track_to_entity(m) for m in result.scalars()]

    async def list_by_album(self, album_id: UUID) -> list[CatalogTrack]:
        stmt = (
            select(CatalogTrackModel)
            .where(CatalogTrackModel.album_id == album_id)
            .order_by(CatalogTrackModel.track_number)
        )
        result = await self._session.execute(stmt)
        return [catalog_track_to_entity(m) for m in result.scalars()]

    async def list_popular(self, limit: int = 50) -> list[CatalogTrack]:
        stmt = (
            select(CatalogTrackModel)
            .order_by(CatalogTrackModel.popularity.desc())
            .limit(limit)
        )
        result = await self._session.execute(stmt)
        return [catalog_track_to_entity(m) for m in result.scalars()]

    async def upsert(self, track: CatalogTrack) -> CatalogTrack:
        # Deduplicate by ISRC first (most reliable), then by artist+title
        if track.isrc:
            result = await self._session.execute(
                select(CatalogTrackModel).where(CatalogTrackModel.isrc == track.isrc)
            )
            model = result.scalar_one_or_none()
        else:
            result = await self._session.execute(
                select(CatalogTrackModel).where(
                    CatalogTrackModel.title == track.title,
                    CatalogTrackModel.artist_id == track.artist_id,
                )
            )
            model = result.scalar_one_or_none()

        if model is not None:
            mapped = catalog_track_to_model(track)
            _apply_updates(model, mapped)
            await self._session.flush()
            return catalog_track_to_entity(model)

        model = catalog_track_to_model(track)
        self._session.add(model)
        await self._session.flush()
        return catalog_track_to_entity(model)

    async def count(self) -> int:
        result = await self._session.execute(
            select(func.count()).select_from(CatalogTrackModel)
        )
        return result.scalar_one()


# ── CatalogGenreRepository ─────────────────────────────────────────────────


class CatalogGenreRepository(ICatalogGenreRepository):
    """SQLAlchemy-backed persistence for :class:`CatalogGenre`."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_id(self, genre_id: UUID) -> CatalogGenre | None:
        model = await self._session.get(CatalogGenreModel, genre_id)
        return catalog_genre_to_entity(model) if model else None

    async def get_by_slug(self, slug: str) -> CatalogGenre | None:
        result = await self._session.execute(
            select(CatalogGenreModel).where(CatalogGenreModel.slug == slug)
        )
        model = result.scalar_one_or_none()
        return catalog_genre_to_entity(model) if model else None

    async def get_by_name(self, name: str) -> CatalogGenre | None:
        result = await self._session.execute(
            select(CatalogGenreModel).where(CatalogGenreModel.name == name)
        )
        model = result.scalar_one_or_none()
        return catalog_genre_to_entity(model) if model else None

    async def list_all(self) -> list[CatalogGenre]:
        stmt = select(CatalogGenreModel).order_by(CatalogGenreModel.name)
        result = await self._session.execute(stmt)
        return [catalog_genre_to_entity(m) for m in result.scalars()]

    async def list_artists_by_genre(
        self, genre_id: UUID, *, limit: int = 50
    ) -> list[CatalogArtist]:
        stmt = (
            select(CatalogArtistModel)
            .join(
                CatalogArtistGenreModel,
                CatalogArtistModel.id == CatalogArtistGenreModel.artist_id,
            )
            .where(CatalogArtistGenreModel.genre_id == genre_id)
            .order_by(CatalogArtistModel.popularity.desc())
            .limit(limit)
        )
        result = await self._session.execute(stmt)
        return [catalog_artist_to_entity(m) for m in result.scalars()]

    async def add_artist_to_genre(
        self, artist_id: UUID, genre_id: UUID
    ) -> CatalogArtistGenre:
        association = CatalogArtistGenreModel(
            artist_id=artist_id,
            genre_id=genre_id,
        )
        self._session.add(association)
        await self._session.flush()
        return catalog_artist_genre_to_entity(association)

    async def remove_artist_from_genre(
        self, artist_id: UUID, genre_id: UUID
    ) -> None:
        assoc = await self._session.get(
            CatalogArtistGenreModel, (artist_id, genre_id)
        )
        if assoc is not None:
            await self._session.delete(assoc)
            await self._session.flush()

    async def upsert(self, genre: CatalogGenre) -> CatalogGenre:
        result = await self._session.execute(
            select(CatalogGenreModel).where(CatalogGenreModel.slug == genre.slug)
        )
        model = result.scalar_one_or_none()

        if model is not None:
            mapped = catalog_genre_to_model(genre)
            _apply_updates(model, mapped)
            await self._session.flush()
            return catalog_genre_to_entity(model)

        model = catalog_genre_to_model(genre)
        self._session.add(model)
        await self._session.flush()
        return catalog_genre_to_entity(model)

    async def count(self) -> int:
        result = await self._session.execute(
            select(func.count()).select_from(CatalogGenreModel)
        )
        return result.scalar_one()


# ── TrackPreviewRepository ─────────────────────────────────────────────────


class TrackPreviewRepository(ITrackPreviewRepository):
    """SQLAlchemy-backed persistence for :class:`TrackPreview`."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_id(self, preview_id: UUID) -> TrackPreview | None:
        model = await self._session.get(TrackPreviewModel, preview_id)
        return track_preview_to_entity(model) if model else None

    async def get_latest_for_track(self, track_id: UUID) -> TrackPreview | None:
        stmt = (
            select(TrackPreviewModel)
            .where(TrackPreviewModel.track_id == track_id)
            .order_by(TrackPreviewModel.fetched_at.desc())
            .limit(1)
        )
        result = await self._session.execute(stmt)
        model = result.scalar_one_or_none()
        return track_preview_to_entity(model) if model else None

    async def list_by_track(self, track_id: UUID) -> list[TrackPreview]:
        stmt = (
            select(TrackPreviewModel)
            .where(TrackPreviewModel.track_id == track_id)
            .order_by(TrackPreviewModel.fetched_at.desc())
        )
        result = await self._session.execute(stmt)
        return [track_preview_to_entity(m) for m in result.scalars()]

    async def create(self, preview: TrackPreview) -> TrackPreview:
        model = track_preview_to_model(preview)
        self._session.add(model)
        await self._session.flush()
        return track_preview_to_entity(model)

    async def delete(self, preview_id: UUID) -> None:
        model = await self._session.get(TrackPreviewModel, preview_id)
        if model is not None:
            await self._session.delete(model)
            await self._session.flush()

    async def delete_expired(self) -> int:
        now = datetime.now(UTC)
        stmt = select(TrackPreviewModel).where(
            TrackPreviewModel.expires_at.is_not(None),
            TrackPreviewModel.expires_at < now,
        )
        result = await self._session.execute(stmt)
        expired = list(result.scalars())
        for model in expired:
            await self._session.delete(model)
        await self._session.flush()
        return len(expired)


# ── CatalogRepository Facade ────────────────────────────────────────────────
# Simple facade used by catalog REST routes — works directly with ORM models.


class CatalogRepository:
    """Simple facade over catalog repositories for REST route consumption."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    # ── Artists ──────────────────────────────────────────────────────────

    async def get_artists(
        self,
        *,
        genre: str | None = None,
        country: str | None = None,
        brazilian_only: bool | None = None,
        offset: int = 0,
        limit: int = 50,
    ) -> list[CatalogArtistModel]:
        stmt = (
            select(CatalogArtistModel)
            .options(selectinload(CatalogArtistModel.genre_associations).selectinload(CatalogArtistGenreModel.genre))
        )
        if genre:
            stmt = (
                stmt.join(CatalogArtistGenreModel)
                .join(CatalogGenreModel)
                .where(CatalogGenreModel.name.ilike(f"%{genre}%"))
            )
        if country:
            stmt = stmt.where(CatalogArtistModel.country == country.upper())
        if brazilian_only is True:
            stmt = stmt.where(CatalogArtistModel.is_brazilian == True)  # noqa: E712
        stmt = stmt.order_by(CatalogArtistModel.popularity.desc()).offset(offset).limit(limit)
        result = await self._session.execute(stmt)
        return list(result.scalars().unique())

    async def count_artists(self, *, genre: str | None = None) -> int:
        stmt = select(func.count()).select_from(CatalogArtistModel)
        if genre:
            stmt = (
                stmt.join(CatalogArtistGenreModel)
                .join(CatalogGenreModel)
                .where(CatalogGenreModel.name.ilike(f"%{genre}%"))
            )
        result = await self._session.execute(stmt)
        return result.scalar_one()

    async def get_artist_by_id(self, artist_id: str | UUID) -> CatalogArtistModel | None:
        stmt = (
            select(CatalogArtistModel)
            .options(selectinload(CatalogArtistModel.genre_associations).selectinload(CatalogArtistGenreModel.genre))
            .where(CatalogArtistModel.id == artist_id)
        )
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()

    # ── Tracks ───────────────────────────────────────────────────────────

    async def get_tracks(
        self,
        *,
        artist_id: str | UUID | None = None,
        genre: str | None = None,
        has_preview: bool = True,
        offset: int = 0,
        limit: int = 50,
    ) -> list[CatalogTrackModel]:
        stmt = (
            select(CatalogTrackModel)
            .options(selectinload(CatalogTrackModel.artist), selectinload(CatalogTrackModel.album))
        )
        if artist_id:
            stmt = stmt.where(CatalogTrackModel.artist_id == artist_id)
        if genre:
            stmt = (
                stmt.join(CatalogArtistGenreModel, CatalogTrackModel.artist_id == CatalogArtistGenreModel.artist_id)
                .join(CatalogGenreModel)
                .where(CatalogGenreModel.name.ilike(f"%{genre}%"))
            )
        if has_preview:
            stmt = stmt.where(CatalogTrackModel.preview_url.is_not(None))
        stmt = stmt.order_by(CatalogTrackModel.popularity.desc()).offset(offset).limit(limit)
        result = await self._session.execute(stmt)
        return list(result.scalars().unique())

    async def count_tracks(
        self, *, genre: str | None = None, has_preview: bool = True
    ) -> int:
        stmt = select(func.count()).select_from(CatalogTrackModel)
        if genre:
            stmt = (
                stmt.join(CatalogArtistGenreModel, CatalogTrackModel.artist_id == CatalogArtistGenreModel.artist_id)
                .join(CatalogGenreModel)
                .where(CatalogGenreModel.name.ilike(f"%{genre}%"))
            )
        if has_preview:
            stmt = stmt.where(CatalogTrackModel.preview_url.is_not(None))
        result = await self._session.execute(stmt)
        return result.scalar_one()

    async def search(self, query: str, limit: int = 20) -> list[CatalogTrackModel]:
        pattern = f"%{query}%"
        stmt = (
            select(CatalogTrackModel)
            .options(selectinload(CatalogTrackModel.artist), selectinload(CatalogTrackModel.album))
            .join(CatalogArtistModel, CatalogTrackModel.artist_id == CatalogArtistModel.id)
            .where(
                or_(
                    CatalogTrackModel.title.ilike(pattern),
                    CatalogArtistModel.name.ilike(pattern),
                )
            )
            .order_by(CatalogTrackModel.popularity.desc())
            .limit(limit)
        )
        result = await self._session.execute(stmt)
        return list(result.scalars().unique())

    # ── Genres ───────────────────────────────────────────────────────────

    async def get_genres(self) -> list[CatalogGenreModel]:
        stmt = select(CatalogGenreModel).order_by(CatalogGenreModel.name)
        result = await self._session.execute(stmt)
        return list(result.scalars())
