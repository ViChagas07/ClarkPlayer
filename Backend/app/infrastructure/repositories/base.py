"""
Shared utilities for repository implementations — domain ↔ ORM mappers.

These mappers convert between SQLAlchemy model instances and domain entities,
keeping the two layers decoupled.
"""

from __future__ import annotations

from app.domain.entities import (
    CatalogAlbum,
    CatalogArtist,
    CatalogArtistGenre,
    CatalogGenre,
    CatalogTrack,
    Playlist,
    PlaylistTrack,
    Track,
    TrackPreview,
    User,
)
from app.domain.enums import AudioFormat, PlaylistVisibility
from app.infrastructure.models.catalog import (
    CatalogAlbumModel,
    CatalogArtistGenreModel,
    CatalogArtistModel,
    CatalogGenreModel,
    CatalogTrackModel,
    TrackPreviewModel,
)
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


# ── CatalogArtist ──────────────────────────────────────────────────────────


def catalog_artist_to_entity(model: CatalogArtistModel) -> CatalogArtist:
    return CatalogArtist(
        id=model.id,
        name=model.name,
        bio=model.bio,
        image_url=model.image_url,
        external_mb_id=model.external_mb_id,
        external_spotify_id=model.external_spotify_id,
        external_itunes_id=model.external_itunes_id,
        external_lastfm_url=model.external_lastfm_url,
        popularity=model.popularity,
        country=model.country,
        is_brazilian=model.is_brazilian,
    )


def catalog_artist_to_model(entity: CatalogArtist) -> CatalogArtistModel:
    return CatalogArtistModel(
        id=entity.id,
        name=entity.name,
        bio=entity.bio,
        image_url=entity.image_url,
        external_mb_id=entity.external_mb_id,
        external_spotify_id=entity.external_spotify_id,
        external_itunes_id=entity.external_itunes_id,
        external_lastfm_url=entity.external_lastfm_url,
        popularity=entity.popularity,
        country=entity.country,
        is_brazilian=entity.is_brazilian,
    )


# ── CatalogAlbum ───────────────────────────────────────────────────────────


def catalog_album_to_entity(model: CatalogAlbumModel) -> CatalogAlbum:
    return CatalogAlbum(
        id=model.id,
        title=model.title,
        artist_id=model.artist_id,  # type: ignore[arg-type]
        cover_url=model.cover_url,
        release_date=model.release_date,
        country=model.country,
        track_count=model.track_count,
        external_mb_id=model.external_mb_id,
        external_spotify_id=model.external_spotify_id,
        external_itunes_id=model.external_itunes_id,
    )


def catalog_album_to_model(entity: CatalogAlbum) -> CatalogAlbumModel:
    return CatalogAlbumModel(
        id=entity.id,
        title=entity.title,
        artist_id=entity.artist_id,
        cover_url=entity.cover_url,
        release_date=entity.release_date,
        country=entity.country,
        track_count=entity.track_count,
        external_mb_id=entity.external_mb_id,
        external_spotify_id=entity.external_spotify_id,
        external_itunes_id=entity.external_itunes_id,
    )


# ── CatalogTrack ───────────────────────────────────────────────────────────


def catalog_track_to_entity(model: CatalogTrackModel) -> CatalogTrack:
    return CatalogTrack(
        id=model.id,
        title=model.title,
        artist_id=model.artist_id,  # type: ignore[arg-type]
        album_id=model.album_id,  # type: ignore[arg-type]
        duration_ms=model.duration_ms,
        track_number=model.track_number,
        disc_number=model.disc_number,
        preview_url=model.preview_url,
        isrc=model.isrc,
        external_mb_id=model.external_mb_id,
        external_spotify_id=model.external_spotify_id,
        external_itunes_id=model.external_itunes_id,
        explicit=model.explicit,
        popularity=model.popularity,
    )


def catalog_track_to_model(entity: CatalogTrack) -> CatalogTrackModel:
    return CatalogTrackModel(
        id=entity.id,
        title=entity.title,
        artist_id=entity.artist_id,
        album_id=entity.album_id,
        duration_ms=entity.duration_ms,
        track_number=entity.track_number,
        disc_number=entity.disc_number,
        preview_url=entity.preview_url,
        isrc=entity.isrc,
        external_mb_id=entity.external_mb_id,
        external_spotify_id=entity.external_spotify_id,
        external_itunes_id=entity.external_itunes_id,
        explicit=entity.explicit,
        popularity=entity.popularity,
    )


# ── CatalogGenre ───────────────────────────────────────────────────────────


def catalog_genre_to_entity(model: CatalogGenreModel) -> CatalogGenre:
    return CatalogGenre(
        id=model.id,
        name=model.name,
        slug=model.slug,
        gradient_from=model.gradient_from,
        gradient_to=model.gradient_to,
    )


def catalog_genre_to_model(entity: CatalogGenre) -> CatalogGenreModel:
    return CatalogGenreModel(
        id=entity.id,
        name=entity.name,
        slug=entity.slug,
        gradient_from=entity.gradient_from,
        gradient_to=entity.gradient_to,
    )


# ── CatalogArtistGenre ─────────────────────────────────────────────────────


def catalog_artist_genre_to_entity(model: CatalogArtistGenreModel) -> CatalogArtistGenre:
    return CatalogArtistGenre(
        artist_id=model.artist_id,  # type: ignore[arg-type]
        genre_id=model.genre_id,  # type: ignore[arg-type]
    )


# ── TrackPreview ───────────────────────────────────────────────────────────


def track_preview_to_entity(model: TrackPreviewModel) -> TrackPreview:
    return TrackPreview(
        id=model.id,
        track_id=model.track_id,  # type: ignore[arg-type]
        url=model.url,
        expires_at=model.expires_at,
        fetched_at=model.fetched_at,
    )


def track_preview_to_model(entity: TrackPreview) -> TrackPreviewModel:
    return TrackPreviewModel(
        id=entity.id,
        track_id=entity.track_id,
        url=entity.url,
        expires_at=entity.expires_at,
        fetched_at=entity.fetched_at,
    )
