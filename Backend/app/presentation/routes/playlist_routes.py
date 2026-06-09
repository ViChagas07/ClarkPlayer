"""
Playlist management routes.
"""

from uuid import UUID

from fastapi import APIRouter, Depends, status

from app.application.services.playlist_service import PlaylistService
from app.core.dependencies import CurrentUserId, SessionDep
from app.core.exceptions import NotFoundError
from app.infrastructure.repositories.playlist_repository import PlaylistRepository
from app.presentation.schemas.playlist import (
    AddTrackRequest,
    CreatePlaylistRequest,
    PlaylistResponse,
    ReorderRequest,
    UpdatePlaylistRequest,
)
from app.presentation.schemas.track import TrackResponse

router = APIRouter(prefix="/playlists", tags=["Playlists"])


def _playlist_service(session: SessionDep) -> PlaylistService:
    return PlaylistService(PlaylistRepository(session))


def _playlist_to_response(playlist, track_count: int = 0) -> PlaylistResponse:
    return PlaylistResponse(
        id=str(playlist.id),
        name=playlist.name,
        description=playlist.description,
        visibility=playlist.visibility.value,
        cover_art_path=playlist.cover_art_path,
        track_count=track_count,
        created_at=playlist.created_at,
        updated_at=playlist.updated_at,
    )


@router.post("", response_model=PlaylistResponse, status_code=status.HTTP_201_CREATED)
async def create_playlist(
    body: CreatePlaylistRequest,
    user_id: CurrentUserId,
    session: SessionDep,
) -> PlaylistResponse:
    """Create a new playlist."""
    service = PlaylistService(PlaylistRepository(session))
    playlist = await service.create(
        user_id,
        name=body.name,
        description=body.description,
        visibility=body.visibility,
    )
    return _playlist_to_response(playlist)


@router.get("", response_model=list[PlaylistResponse])
async def list_my_playlists(
    user_id: CurrentUserId,
    session: SessionDep,
) -> list[PlaylistResponse]:
    """List all playlists owned by the authenticated user."""
    service = PlaylistService(PlaylistRepository(session))
    playlists = await service.list_user_playlists(user_id)
    result: list[PlaylistResponse] = []
    for p in playlists:
        tracks = await service.list_tracks(p.id)
        result.append(_playlist_to_response(p, track_count=len(tracks)))
    return result


@router.get("/{playlist_id}", response_model=PlaylistResponse)
async def get_playlist(
    playlist_id: UUID,
    user_id: CurrentUserId,
    session: SessionDep,
) -> PlaylistResponse:
    """Get a single playlist by ID."""
    service = PlaylistService(PlaylistRepository(session))
    playlist = await service.get_playlist(playlist_id)
    if playlist.user_id != user_id:
        raise NotFoundError("Playlist not found.")
    tracks = await service.list_tracks(playlist_id)
    return _playlist_to_response(playlist, track_count=len(tracks))


@router.patch("/{playlist_id}", response_model=PlaylistResponse)
async def update_playlist(
    playlist_id: UUID,
    body: UpdatePlaylistRequest,
    user_id: CurrentUserId,
    session: SessionDep,
) -> PlaylistResponse:
    """Update playlist name, description, or visibility."""
    service = PlaylistService(PlaylistRepository(session))
    playlist = await service.get_playlist(playlist_id)
    if playlist.user_id != user_id:
        raise NotFoundError("Playlist not found.")
    updated = await service.update(
        playlist_id,
        name=body.name,
        description=body.description,
        visibility=body.visibility,
        cover_art_path=body.cover_art_path,
    )
    tracks = await service.list_tracks(playlist_id)
    return _playlist_to_response(updated, track_count=len(tracks))


@router.delete("/{playlist_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_playlist(
    playlist_id: UUID,
    user_id: CurrentUserId,
    session: SessionDep,
) -> None:
    """Delete a playlist (tracks are not deleted, only the list)."""
    service = PlaylistService(PlaylistRepository(session))
    playlist = await service.get_playlist(playlist_id)
    if playlist.user_id != user_id:
        raise NotFoundError("Playlist not found.")
    await service.delete(playlist_id)


# ── Tracks within a playlist ────────────────────────────────────────────


@router.get("/{playlist_id}/tracks", response_model=list[TrackResponse])
async def list_playlist_tracks(
    playlist_id: UUID,
    user_id: CurrentUserId,
    session: SessionDep,
) -> list[TrackResponse]:
    """List all tracks in a playlist."""
    service = PlaylistService(PlaylistRepository(session))
    playlist = await service.get_playlist(playlist_id)
    if playlist.user_id != user_id:
        raise NotFoundError("Playlist not found.")
    tracks = await service.list_tracks(playlist_id)
    return [
        TrackResponse(
            id=str(t.id),
            title=t.title,
            artist=t.artist,
            album=t.album,
            genre=t.genre,
            year=t.year,
            duration=t.duration,
            file_size=t.file_size,
            file_format=t.file_format.value,
            cover_art_path=t.cover_art_path,
            play_count=t.play_count,
            last_played_at=t.last_played_at,
            is_favorite=t.is_favorite,
            created_at=t.created_at,
            updated_at=t.updated_at,
        )
        for t in tracks
    ]


@router.post("/{playlist_id}/tracks", status_code=status.HTTP_200_OK)
async def add_track_to_playlist(
    playlist_id: UUID,
    body: AddTrackRequest,
    user_id: CurrentUserId,
    session: SessionDep,
) -> PlaylistResponse:
    """Add a track to a playlist."""
    service = PlaylistService(PlaylistRepository(session))
    playlist = await service.get_playlist(playlist_id)
    if playlist.user_id != user_id:
        raise NotFoundError("Playlist not found.")
    track_id = UUID(body.track_id)
    await service.add_track(playlist_id, track_id)
    tracks = await service.list_tracks(playlist_id)
    return _playlist_to_response(playlist, track_count=len(tracks))


@router.delete(
    "/{playlist_id}/tracks/{track_id}", status_code=status.HTTP_204_NO_CONTENT
)
async def remove_track_from_playlist(
    playlist_id: UUID,
    track_id: UUID,
    user_id: CurrentUserId,
    session: SessionDep,
) -> None:
    """Remove a track from a playlist."""
    service = PlaylistService(PlaylistRepository(session))
    playlist = await service.get_playlist(playlist_id)
    if playlist.user_id != user_id:
        raise NotFoundError("Playlist not found.")
    await service.remove_track(playlist_id, track_id)


@router.put("/{playlist_id}/tracks/reorder", status_code=status.HTTP_204_NO_CONTENT)
async def reorder_playlist_tracks(
    playlist_id: UUID,
    body: ReorderRequest,
    user_id: CurrentUserId,
    session: SessionDep,
) -> None:
    """Reorder tracks within a playlist."""
    service = PlaylistService(PlaylistRepository(session))
    playlist = await service.get_playlist(playlist_id)
    if playlist.user_id != user_id:
        raise NotFoundError("Playlist not found.")
    await service.reorder_tracks(playlist_id, [UUID(tid) for tid in body.track_ids])
