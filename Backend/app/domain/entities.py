"""
Domain entities — pure Python objects that represent core business concepts.

These are **not** ORM models.  They deliberately have zero framework
dependencies, which makes them easy to test and reason about.

Every entity is immutable (or nearly so) — mutating methods return a
**new** instance rather than modifying internal state in place.
"""

from dataclasses import dataclass, field
from datetime import datetime, UTC
from uuid import UUID, uuid4

from app.domain.enums import AudioFormat, PlaylistVisibility

# ── User ──────────────────────────────────────────────────────────────────


@dataclass(kw_only=True, slots=True)
class User:
    id: UUID = field(default_factory=uuid4)
    username: str
    email: str
    hashed_password: str | None = None
    display_name: str | None = None
    avatar_url: str | None = None
    is_active: bool = True
    email_verified: bool = False
    # ── OAuth / social login ───────────────────────────────────────────
    provider: str | None = None
    provider_id: str | None = None
    created_at: datetime = field(default_factory=lambda: datetime.now(UTC))
    updated_at: datetime = field(default_factory=lambda: datetime.now(UTC))


# ── Track (audio file) ────────────────────────────────────────────────────


@dataclass(kw_only=True, slots=True)
class Track:
    id: UUID = field(default_factory=uuid4)
    user_id: UUID
    title: str
    artist: str | None = None
    album: str | None = None
    genre: str | None = None
    year: int | None = None
    duration: float | None = None  # seconds
    file_path: str = ""
    file_size: int = 0
    file_format: AudioFormat = AudioFormat.MP3
    cover_art_path: str | None = None
    play_count: int = 0
    last_played_at: datetime | None = None
    is_favorite: bool = False
    created_at: datetime = field(default_factory=lambda: datetime.now(UTC))
    updated_at: datetime = field(default_factory=lambda: datetime.now(UTC))


# ── Playlist ──────────────────────────────────────────────────────────────


@dataclass(kw_only=True, slots=True)
class Playlist:
    id: UUID = field(default_factory=uuid4)
    user_id: UUID
    name: str
    description: str | None = None
    cover_art_path: str | None = None
    visibility: PlaylistVisibility = PlaylistVisibility.PRIVATE
    created_at: datetime = field(default_factory=lambda: datetime.now(UTC))
    updated_at: datetime = field(default_factory=lambda: datetime.now(UTC))


# ── Playlist ↔ Track association ─────────────────────────────────────────


@dataclass(kw_only=True, slots=True)
class PlaylistTrack:
    playlist_id: UUID
    track_id: UUID
    position: int
    added_at: datetime = field(default_factory=lambda: datetime.now(UTC))


# ── Catalog Artist ─────────────────────────────────────────────────────────


@dataclass(kw_only=True, slots=True)
class CatalogArtist:
    id: UUID = field(default_factory=uuid4)
    name: str
    bio: str | None = None
    image_url: str | None = None
    external_mb_id: str | None = None
    external_spotify_id: str | None = None
    external_itunes_id: str | None = None
    external_lastfm_url: str | None = None
    popularity: int = 0
    country: str | None = None
    is_brazilian: bool = False


# ── Catalog Album ──────────────────────────────────────────────────────────


@dataclass(kw_only=True, slots=True)
class CatalogAlbum:
    id: UUID = field(default_factory=uuid4)
    title: str
    artist_id: UUID
    cover_url: str | None = None
    release_date: str | None = None
    country: str | None = None
    track_count: int = 0
    external_mb_id: str | None = None
    external_spotify_id: str | None = None
    external_itunes_id: str | None = None


# ── Catalog Track ──────────────────────────────────────────────────────────


@dataclass(kw_only=True, slots=True)
class CatalogTrack:
    id: UUID = field(default_factory=uuid4)
    title: str
    artist_id: UUID
    album_id: UUID | None = None
    duration_ms: int | None = None
    track_number: int | None = None
    disc_number: int | None = None
    preview_url: str | None = None
    isrc: str | None = None
    external_mb_id: str | None = None
    external_spotify_id: str | None = None
    external_itunes_id: str | None = None
    explicit: bool = False
    popularity: int = 0


# ── Catalog Genre ──────────────────────────────────────────────────────────


@dataclass(kw_only=True, slots=True)
class CatalogGenre:
    id: UUID = field(default_factory=uuid4)
    name: str
    slug: str
    gradient_from: str = '#1a1a2e'
    gradient_to: str = '#16213e'
    cover_image_url: str | None = None
    cover_artist_id: UUID | None = None


# ── Catalog Artist ↔ Genre association ────────────────────────────────────


@dataclass(kw_only=True, slots=True)
class CatalogArtistGenre:
    artist_id: UUID
    genre_id: UUID


# ── Track Preview ──────────────────────────────────────────────────────────


@dataclass(kw_only=True, slots=True)
class TrackPreview:
    id: UUID = field(default_factory=uuid4)
    track_id: UUID
    url: str
    expires_at: datetime | None = None
    fetched_at: datetime = field(default_factory=lambda: datetime.now(UTC))
