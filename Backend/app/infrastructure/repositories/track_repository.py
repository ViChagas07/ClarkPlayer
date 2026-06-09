"""
Concrete SQLAlchemy implementation of :class:`ITrackRepository`.
"""

from collections.abc import Sequence
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.interfaces.repositories import ITrackRepository
from app.domain.entities import Track
from app.domain.enums import AudioFormat
from app.infrastructure.models.track import TrackModel
from app.infrastructure.repositories.base import track_to_entity, track_to_model


class TrackRepository(ITrackRepository):
    """SQLAlchemy-backed track persistence."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_id(self, track_id: UUID) -> Track | None:
        model = await self._session.get(TrackModel, track_id)
        return track_to_entity(model) if model else None

    async def list_by_user(
        self,
        user_id: UUID,
        *,
        offset: int = 0,
        limit: int = 50,
        search: str | None = None,
        artist: str | None = None,
        album: str | None = None,
        genre: str | None = None,
        is_favorite: bool | None = None,
    ) -> Sequence[Track]:
        stmt = select(TrackModel).where(TrackModel.user_id == user_id)

        if search:
            pattern = f"%{search}%"
            stmt = stmt.where(
                TrackModel.title.ilike(pattern) | TrackModel.artist.ilike(pattern)
            )
        if artist:
            stmt = stmt.where(TrackModel.artist.ilike(f"%{artist}%"))
        if album:
            stmt = stmt.where(TrackModel.album.ilike(f"%{album}%"))
        if genre:
            stmt = stmt.where(TrackModel.genre.ilike(f"%{genre}%"))
        if is_favorite is not None:
            stmt = stmt.where(TrackModel.is_favorite == is_favorite)

        stmt = stmt.order_by(TrackModel.created_at.desc()).offset(offset).limit(limit)
        result = await self._session.execute(stmt)
        return [track_to_entity(m) for m in result.scalars()]

    async def count_by_user(
        self,
        user_id: UUID,
        *,
        search: str | None = None,
        kind: AudioFormat | None = None,
    ) -> int:
        stmt = select(func.count()).select_from(TrackModel).where(TrackModel.user_id == user_id)
        if search:
            pattern = f"%{search}%"
            stmt = stmt.where(
                TrackModel.title.ilike(pattern) | TrackModel.artist.ilike(pattern)
            )
        if kind:
            stmt = stmt.where(TrackModel.file_format == kind.value)
        result = await self._session.execute(stmt)
        return result.scalar_one()

    async def create(self, track: Track) -> Track:
        model = track_to_model(track)
        self._session.add(model)
        await self._session.flush()
        return track_to_entity(model)

    async def update(self, track: Track) -> Track:
        model = await self._session.get(TrackModel, track.id)
        if model is None:
            return await self.create(track)

        mapped = track_to_model(track)
        for field, value in mapped.__dict__.items():
            if not field.startswith("_") and field not in ("id", "created_at"):
                setattr(model, field, value)

        await self._session.flush()
        return track_to_entity(model)

    async def delete(self, track_id: UUID) -> None:
        model = await self._session.get(TrackModel, track_id)
        if model is not None:
            await self._session.delete(model)
            await self._session.flush()
