"""
Domain entities — pure Python objects that represent core business concepts.

These are **not** ORM models.  They deliberately have zero framework
dependencies, which makes them easy to test and reason about.

Every entity is immutable (or nearly so) — mutating methods return a
**new** instance rather than modifying internal state in place.
"""

from dataclasses import dataclass, field
from datetime import datetime
from uuid import UUID, uuid4

from app.domain.enums import AudioFormat, PlaylistVisibility

# ── User ──────────────────────────────────────────────────────────────────


@dataclass(kw_only=True, slots=True)
class User:
    id: UUID = field(default_factory=uuid4)
    username: str
    email: str
    hashed_password: str
    display_name: str | None = None
    avatar_url: str | None = None
    is_active: bool = True
    email_verified: bool = False
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)


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
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)


# ── Playlist ──────────────────────────────────────────────────────────────


@dataclass(kw_only=True, slots=True)
class Playlist:
    id: UUID = field(default_factory=uuid4)
    user_id: UUID
    name: str
    description: str | None = None
    cover_art_path: str | None = None
    visibility: PlaylistVisibility = PlaylistVisibility.PRIVATE
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)


# ── Playlist ↔ Track association ─────────────────────────────────────────


@dataclass(kw_only=True, slots=True)
class PlaylistTrack:
    playlist_id: UUID
    track_id: UUID
    position: int
    added_at: datetime = field(default_factory=datetime.utcnow)
