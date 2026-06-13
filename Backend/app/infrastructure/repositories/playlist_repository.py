"""
Concrete SQLAlchemy implementation of :class:`IPlaylistRepository`.
"""

from collections.abc import Sequence
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.application.interfaces.repositories import IPlaylistRepository
from app.domain.entities import Playlist, PlaylistTrack, Track
from app.infrastructure.models.playlist import PlaylistModel, PlaylistTrackModel
from app.infrastructure.repositories.base import (
    playlist_to_entity,
    playlist_to_model,
    playlist_track_to_entity,
    track_to_entity,
)


class PlaylistRepository(IPlaylistRepository):
    """SQLAlchemy-backed playlist persistence."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    # ── Playlist CRUD ─────────────────────────────────────────────────

    async def get_by_id(self, playlist_id: UUID) -> Playlist | None:
        model = await self._session.get(PlaylistModel, playlist_id)
        return playlist_to_entity(model) if model else None

    async def list_by_user(self, user_id: UUID) -> Sequence[Playlist]:
        stmt = (
            select(PlaylistModel)
            .where(PlaylistModel.user_id == user_id)
            .order_by(PlaylistModel.updated_at.desc())
        )
        result = await self._session.execute(stmt)
        return [playlist_to_entity(m) for m in result.scalars()]

    async def create(self, playlist: Playlist) -> Playlist:
        model = playlist_to_model(playlist)
        self._session.add(model)
        await self._session.flush()
        return playlist_to_entity(model)

    async def update(self, playlist: Playlist) -> Playlist:
        model = await self._session.get(PlaylistModel, playlist.id)
        if model is None:
            return await self.create(playlist)

        mapped = playlist_to_model(playlist)
        for field, value in mapped.__dict__.items():
            if not field.startswith("_") and field not in ("id", "created_at"):
                setattr(model, field, value)

        await self._session.flush()
        return playlist_to_entity(model)

    async def delete(self, playlist_id: UUID) -> None:
        model = await self._session.get(PlaylistModel, playlist_id)
        if model is not None:
            await self._session.delete(model)
            await self._session.flush()

    # ── Tracks inside a playlist ──────────────────────────────────────

    async def add_track(
        self, playlist_id: UUID, track_id: UUID, position: int | None = None
    ) -> PlaylistTrack:
        if position is None:
            # Compute next position
            count_stmt = (
                select(PlaylistTrackModel)
                .where(PlaylistTrackModel.playlist_id == playlist_id)
            )
            result = await self._session.execute(count_stmt)
            position = len(result.scalars().all())

        association = PlaylistTrackModel(
            playlist_id=playlist_id,
            track_id=track_id,
            position=position,
        )
        self._session.add(association)
        await self._session.flush()
        return playlist_track_to_entity(association)

    async def remove_track(self, playlist_id: UUID, track_id: UUID) -> None:
        assoc = await self._session.get(
            PlaylistTrackModel, (playlist_id, track_id)
        )
        if assoc is not None:
            await self._session.delete(assoc)
            await self._session.flush()

    async def reorder_tracks(
        self, playlist_id: UUID, track_order: Sequence[UUID]
    ) -> None:
        # Batch load all associations in one query
        result = await self._session.execute(
            select(PlaylistTrackModel).where(
                PlaylistTrackModel.playlist_id == playlist_id,
                PlaylistTrackModel.track_id.in_(track_order),
            )
        )
        assocs = {a.track_id: a for a in result.scalars().all()}

        # Update positions in-memory, flush once
        for idx, track_id in enumerate(track_order):
            assoc = assocs.get(track_id)
            if assoc is not None:
                assoc.position = idx

        await self._session.flush()

    async def list_tracks(self, playlist_id: UUID) -> Sequence[Track]:
        stmt = (
            select(PlaylistTrackModel)
            .options(selectinload(PlaylistTrackModel.track))
            .where(PlaylistTrackModel.playlist_id == playlist_id)
            .order_by(PlaylistTrackModel.position)
        )
        result = await self._session.execute(stmt)
        associations = result.scalars().all()
        return [track_to_entity(a.track) for a in associations]
