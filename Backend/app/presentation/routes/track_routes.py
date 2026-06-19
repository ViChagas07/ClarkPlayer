"""
Track (audio file) management routes — upload, list, search, stream, delete.
"""

import json
from pathlib import Path
from uuid import UUID

from fastapi import APIRouter, Query, UploadFile, status
from fastapi.responses import FileResponse

from app.application.services.track_service import TrackService
from app.core.dependencies import CurrentUserId, SessionDep
from app.core.exceptions import NotFoundError
from app.core.redis import get_cache_redis
from app.domain.entities import Track
from app.infrastructure.repositories.track_repository import TrackRepository
from app.presentation.schemas.track import (
    TrackListResponse,
    TrackMetadataUpdate,
    TrackResponse,
    TrackUploadResponse,
)

router = APIRouter(prefix="/tracks", tags=["Tracks"])


def _track_service(session: SessionDep) -> TrackService:
    return TrackService(TrackRepository(session))


def _track_to_response(track: Track) -> TrackResponse:
    """Map a domain Track entity to a response schema."""
    return TrackResponse(
        id=str(track.id),
        title=track.title,
        artist=track.artist,
        album=track.album,
        genre=track.genre,
        year=track.year,
        duration=track.duration,
        file_size=track.file_size,
        file_format=track.file_format.value,
        cover_art_path=track.cover_art_path,
        play_count=track.play_count,
        last_played_at=track.last_played_at,
        is_favorite=track.is_favorite,
        created_at=track.created_at,
        updated_at=track.updated_at,
    )


@router.post("/upload", response_model=TrackUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_track(
    file: UploadFile,
    user_id: CurrentUserId,
    session: SessionDep,
    title: str | None = None,
    artist: str | None = None,
    album: str | None = None,
    genre: str | None = None,
    year: int | None = None,
) -> TrackUploadResponse:
    """Upload an audio file.  Accepts optional metadata as form fields."""
    if file.filename is None:
        from app.core.exceptions import ValidationError
        raise ValidationError("No filename provided.")

    service = TrackService(TrackRepository(session))
    track = await service.upload(
        user_id,
        file.file,
        file.filename,
        title=title,
        artist=artist,
        album=album,
        genre=genre,
        year=year,
    )
    return TrackUploadResponse(track=_track_to_response(track))


@router.get("", response_model=TrackListResponse)
async def list_tracks(
    user_id: CurrentUserId,
    session: SessionDep,
    offset: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    search: str | None = None,
    artist: str | None = None,
    album: str | None = None,
    genre: str | None = None,
) -> TrackListResponse:
    """List the authenticated user's tracks with optional filters.  Results cached for 30s."""
    # Only cache simple queries (no search/filters)
    if not any([search, artist, album, genre]):
        cache_key = f"clark:cache:tracks:{user_id}:{offset}:{limit}"
        cache_redis = await get_cache_redis()
        if cache_redis is not None:
            cached = await cache_redis.get(cache_key)
            if cached:
                return TrackListResponse(**json.loads(cached))

    service = TrackService(TrackRepository(session))
    tracks = await service.list_tracks(
        user_id,
        offset=offset,
        limit=limit,
        search=search,
        artist=artist,
        album=album,
        genre=genre,
        is_favorite=None,
    )
    total = await service.count_tracks(user_id, search=search)
    response = TrackListResponse(
        items=[_track_to_response(t) for t in tracks],
        total=total,
        offset=offset,
        limit=limit,
    )

    if not any([search, artist, album, genre]):
        cache_redis = await get_cache_redis()
        if cache_redis is not None:
            await cache_redis.setex(
                f"clark:cache:tracks:{user_id}:{offset}:{limit}",
                30,
                response.model_dump_json(),
            )

    return response


@router.get("/favorites", response_model=TrackListResponse)
async def list_favorites(
    user_id: CurrentUserId,
    session: SessionDep,
    offset: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
) -> TrackListResponse:
    """List only the user's favorited tracks."""
    service = TrackService(TrackRepository(session))
    tracks = await service.list_tracks(
        user_id, offset=offset, limit=limit, is_favorite=True
    )
    total = await service.count_tracks(user_id)
    return TrackListResponse(
        items=[_track_to_response(t) for t in tracks],
        total=total,
        offset=offset,
        limit=limit,
    )


@router.get("/{track_id}", response_model=TrackResponse)
async def get_track(
    track_id: UUID,
    user_id: CurrentUserId,
    session: SessionDep,
) -> TrackResponse:
    """Get metadata for a single track."""
    service = TrackService(TrackRepository(session))
    track = await service.get_track(track_id)
    if track.user_id != user_id:
        raise NotFoundError("Track not found.")
    return _track_to_response(track)


@router.patch("/{track_id}", response_model=TrackResponse)
async def update_track_metadata(
    track_id: UUID,
    body: TrackMetadataUpdate,
    user_id: CurrentUserId,
    session: SessionDep,
) -> TrackResponse:
    """Update a track's metadata (title, artist, album, genre, year)."""
    service = TrackService(TrackRepository(session))
    track = await service.get_track(track_id)
    if track.user_id != user_id:
        raise NotFoundError("Track not found.")
    updated = await service.update_metadata(
        track_id,
        title=body.title,
        artist=body.artist,
        album=body.album,
        genre=body.genre,
        year=body.year,
    )
    return _track_to_response(updated)


@router.post("/{track_id}/favorite", response_model=TrackResponse)
async def toggle_favorite(
    track_id: UUID,
    user_id: CurrentUserId,
    session: SessionDep,
) -> TrackResponse:
    """Toggle the favorite status of a track."""
    service = TrackService(TrackRepository(session))
    track = await service.get_track(track_id)
    if track.user_id != user_id:
        raise NotFoundError("Track not found.")
    updated = await service.toggle_favorite(track_id)
    return _track_to_response(updated)


@router.post("/{track_id}/play", response_model=TrackResponse)
async def record_play(
    track_id: UUID,
    user_id: CurrentUserId,
    session: SessionDep,
) -> TrackResponse:
    """Record a play event (increments play count)."""
    service = TrackService(TrackRepository(session))
    track = await service.get_track(track_id)
    if track.user_id != user_id:
        raise NotFoundError("Track not found.")
    updated = await service.record_play(track_id)
    return _track_to_response(updated)


@router.get("/{track_id}/stream")
async def stream_track(
    track_id: UUID,
    user_id: CurrentUserId,
    session: SessionDep,
) -> FileResponse:
    """Stream the raw audio file to the client."""
    service = TrackService(TrackRepository(session))
    track = await service.get_track(track_id)
    if track.user_id != user_id:
        raise NotFoundError("Track not found.")

    file_path = Path(track.file_path)
    if not file_path.exists():
        raise NotFoundError("Audio file not found on disk.")

    # Determine media type from extension
    media_type_map = {
        "mp3": "audio/mpeg",
        "flac": "audio/flac",
        "wav": "audio/wav",
        "aac": "audio/aac",
        "ogg": "audio/ogg",
        "wma": "audio/x-ms-wma",
        "m4a": "audio/mp4",
        "opus": "audio/opus",
    }
    media_type = media_type_map.get(track.file_format.value, "application/octet-stream")

    return FileResponse(
        path=str(file_path),
        media_type=media_type,
        filename=f"{track.title}.{track.file_format.value}",
        headers={"Accept-Ranges": "bytes"},
    )


@router.delete("/{track_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_track(
    track_id: UUID,
    user_id: CurrentUserId,
    session: SessionDep,
) -> None:
    """Delete a track (database record and file on disk)."""
    service = TrackService(TrackRepository(session))
    track = await service.get_track(track_id)
    if track.user_id != user_id:
        raise NotFoundError("Track not found.")
    await service.delete_track(track_id)
