"""
Shared utilities for repository implementations — domain ↔ ORM mappers.

These mappers convert between SQLAlchemy model instances and domain entities,
keeping the two layers decoupled.
"""

from __future__ import annotations

from app.domain.entities import Playlist, PlaylistTrack, Track, User
from app.domain.enums import AudioFormat, PlaylistVisibility
from app.infrastructure.models.playlist import PlaylistModel, PlaylistTrackModel
from app.infrastructure.models.track import TrackModel
from app.infrastructure.models.user import UserModel

# ── User ──────────────────────────────────────────────────────────────────

def user_to_entity(model: UserModel) -> User:
    return User(
        id=model.id,
        username=model.username,
        email=model.email,
        hashed_password=model.hashed_password,
        display_name=model.display_name,
        avatar_url=model.avatar_url,
        is_active=model.is_active,
        email_verified=model.email_verified,
        provider=model.provider,
        provider_id=model.provider_id,
        created_at=model.created_at,
        updated_at=model.updated_at,
    )


def user_to_model(entity: User) -> UserModel:
    return UserModel(
        id=entity.id,
        username=entity.username,
        email=entity.email,
        hashed_password=entity.hashed_password,
        display_name=entity.display_name,
        avatar_url=entity.avatar_url,
        is_active=entity.is_active,
        email_verified=entity.email_verified,
        provider=entity.provider,
        provider_id=entity.provider_id,
        created_at=entity.created_at,
        updated_at=entity.updated_at,
    )


# ── Track ─────────────────────────────────────────────────────────────────

def track_to_entity(model: TrackModel) -> Track:
    return Track(
        id=model.id,
        user_id=model.user_id,  # type: ignore[arg-type]
        title=model.title,
        artist=model.artist,
        album=model.album,
        genre=model.genre,
        year=model.year,
        duration=model.duration,
        file_path=model.file_path,
        file_size=model.file_size,
        file_format=AudioFormat(model.file_format),
        cover_art_path=model.cover_art_path,
        play_count=model.play_count,
        last_played_at=model.last_played_at,
        is_favorite=model.is_favorite,
        created_at=model.created_at,
        updated_at=model.updated_at,
    )


def track_to_model(entity: Track) -> TrackModel:
    return TrackModel(
        id=entity.id,
        user_id=entity.user_id,
        title=entity.title,
        artist=entity.artist,
        album=entity.album,
        genre=entity.genre,
        year=entity.year,
        duration=entity.duration,
        file_path=entity.file_path,
        file_size=entity.file_size,
        file_format=entity.file_format.value,
        cover_art_path=entity.cover_art_path,
        play_count=entity.play_count,
        last_played_at=entity.last_played_at,
        is_favorite=entity.is_favorite,
        created_at=entity.created_at,
        updated_at=entity.updated_at,
    )


# ── Playlist ──────────────────────────────────────────────────────────────

def playlist_to_entity(model: PlaylistModel) -> Playlist:
    return Playlist(
        id=model.id,
        user_id=model.user_id,  # type: ignore[arg-type]
        name=model.name,
        description=model.description,
        cover_art_path=model.cover_art_path,
        visibility=PlaylistVisibility(model.visibility),
        created_at=model.created_at,
        updated_at=model.updated_at,
    )


def playlist_to_model(entity: Playlist) -> PlaylistModel:
    return PlaylistModel(
        id=entity.id,
        user_id=entity.user_id,
        name=entity.name,
        description=entity.description,
        cover_art_path=entity.cover_art_path,
        visibility=entity.visibility.value,
        created_at=entity.created_at,
        updated_at=entity.updated_at,
    )


def playlist_track_to_entity(model: PlaylistTrackModel) -> PlaylistTrack:
    return PlaylistTrack(
        playlist_id=model.playlist_id,  # type: ignore[arg-type]
        track_id=model.track_id,  # type: ignore[arg-type]
        position=model.position,
        added_at=model.track.created_at,  # closest proxy — no dedicated column
    )
