"""
Playlist service — create, update, delete playlists and manage their tracks.
"""

from uuid import UUID

from app.application.interfaces.repositories import IPlaylistRepository
from app.core.exceptions import NotFoundError
from app.domain.entities import Playlist, Track
from app.domain.enums import PlaylistVisibility


class PlaylistService:
    def __init__(self, playlist_repo: IPlaylistRepository) -> None:
        self._playlist_repo = playlist_repo

    async def create(
        self,
        user_id: UUID,
        *,
        name: str,
        description: str | None = None,
        visibility: PlaylistVisibility = PlaylistVisibility.PRIVATE,
    ) -> Playlist:
        playlist = Playlist(
            user_id=user_id,
            name=name,
            description=description,
            visibility=visibility,
        )
        return await self._playlist_repo.create(playlist)

    async def get_playlist(self, playlist_id: UUID) -> Playlist:
        playlist = await self._playlist_repo.get_by_id(playlist_id)
        if playlist is None:
            raise NotFoundError("Playlist not found.")
        return playlist

    async def list_user_playlists(self, user_id: UUID) -> list[Playlist]:
        return list(await self._playlist_repo.list_by_user(user_id))

    async def update(
        self,
        playlist_id: UUID,
        *,
        name: str | None = None,
        description: str | None = None,
        visibility: PlaylistVisibility | None = None,
        cover_art_path: str | None = None,
    ) -> Playlist:
        playlist = await self.get_playlist(playlist_id)
        updated = Playlist(
            id=playlist.id,
            user_id=playlist.user_id,
            name=name if name is not None else playlist.name,
            description=description if description is not None else playlist.description,
            visibility=visibility if visibility is not None else playlist.visibility,
            cover_art_path=cover_art_path if cover_art_path is not None else playlist.cover_art_path,
            created_at=playlist.created_at,
        )
        return await self._playlist_repo.update(updated)

    async def delete(self, playlist_id: UUID) -> None:
        await self._playlist_repo.delete(playlist_id)

    # ── Track management within a playlist ──────────────────────────────

    async def add_track(self, playlist_id: UUID, track_id: UUID) -> Playlist:
        playlist = await self.get_playlist(playlist_id)
        await self._playlist_repo.add_track(playlist_id, track_id)
        return playlist

    async def remove_track(self, playlist_id: UUID, track_id: UUID) -> None:
        await self._playlist_repo.remove_track(playlist_id, track_id)

    async def reorder_tracks(
        self, playlist_id: UUID, track_order: list[UUID]
    ) -> None:
        await self._playlist_repo.reorder_tracks(playlist_id, track_order)

    async def list_tracks(self, playlist_id: UUID) -> list[Track]:
        return list(await self._playlist_repo.list_tracks(playlist_id))

    async def count_tracks_batch(self, playlist_ids: list[UUID]) -> dict[UUID, int]:
        return await self._playlist_repo.count_tracks_batch(playlist_ids)
