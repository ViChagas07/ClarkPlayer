"""
Abstract repository interfaces (ports).

These define **what** the application needs from persistence without
coupling to **how** that persistence is implemented (SQLAlchemy, in-memory,
etc.).  Every concrete repository lives in ``infrastructure.repositories``
and implements one of these protocols.

Following the **Interface Segregation Principle**, each interface is kept
narrow — covering only the queries / commands that the corresponding
service actually uses.
"""

from abc import ABC, abstractmethod
from collections.abc import Sequence
from uuid import UUID

from app.domain.entities import Playlist, PlaylistTrack, Track, User
from app.domain.enums import AudioFormat, PlaylistVisibility


# ── User repository ──────────────────────────────────────────────────────


class IUserRepository(ABC):
    @abstractmethod
    async def get_by_id(self, user_id: UUID) -> User | None: ...

    @abstractmethod
    async def get_by_email(self, email: str) -> User | None: ...

    @abstractmethod
    async def get_by_username(self, username: str) -> User | None: ...

    @abstractmethod
    async def create(self, user: User) -> User: ...

    @abstractmethod
    async def update(self, user: User) -> User: ...

    @abstractmethod
    async def delete(self, user_id: UUID) -> None: ...


# ── Track repository ─────────────────────────────────────────────────────


class ITrackRepository(ABC):
    @abstractmethod
    async def get_by_id(self, track_id: UUID) -> Track | None: ...

    @abstractmethod
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
    ) -> Sequence[Track]: ...

    @abstractmethod
    async def count_by_user(
        self,
        user_id: UUID,
        *,
        search: str | None = None,
        kind: AudioFormat | None = None,
    ) -> int: ...

    @abstractmethod
    async def create(self, track: Track) -> Track: ...

    @abstractmethod
    async def update(self, track: Track) -> Track: ...

    @abstractmethod
    async def delete(self, track_id: UUID) -> None: ...


# ── Playlist repository ──────────────────────────────────────────────────


class IPlaylistRepository(ABC):
    # Playlists
    @abstractmethod
    async def get_by_id(self, playlist_id: UUID) -> Playlist | None: ...

    @abstractmethod
    async def list_by_user(self, user_id: UUID) -> Sequence[Playlist]: ...

    @abstractmethod
    async def create(self, playlist: Playlist) -> Playlist: ...

    @abstractmethod
    async def update(self, playlist: Playlist) -> Playlist: ...

    @abstractmethod
    async def delete(self, playlist_id: UUID) -> None: ...

    # Tracks inside a playlist
    @abstractmethod
    async def add_track(
        self, playlist_id: UUID, track_id: UUID, position: int | None = None
    ) -> PlaylistTrack: ...

    @abstractmethod
    async def remove_track(self, playlist_id: UUID, track_id: UUID) -> None: ...

    @abstractmethod
    async def reorder_tracks(
        self, playlist_id: UUID, track_order: Sequence[UUID]
    ) -> None: ...

    @abstractmethod
    async def list_tracks(self, playlist_id: UUID) -> Sequence[Track]: ...
