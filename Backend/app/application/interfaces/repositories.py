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
from app.domain.enums import AudioFormat

# ── User repository ──────────────────────────────────────────────────────


class IUserRepository(ABC):
    @abstractmethod
    async def get_by_id(self, user_id: UUID) -> User | None: ...

    @abstractmethod
    async def get_by_email(self, email: str) -> User | None: ...

    @abstractmethod
    async def get_by_username(self, username: str) -> User | None: ...

    @abstractmethod
    async def get_by_provider(self, provider: str, provider_id: str) -> User | None: ...

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

    @abstractmethod
    async def count_tracks_batch(self, playlist_ids: list[UUID]) -> dict[UUID, int]: ...


# ── Catalog Artist repository ──────────────────────────────────────────────


class ICatalogArtistRepository(ABC):
    @abstractmethod
    async def get_by_id(self, artist_id: UUID) -> CatalogArtist | None: ...

    @abstractmethod
    async def get_by_name(self, name: str) -> CatalogArtist | None: ...

    @abstractmethod
    async def get_by_external_id(
        self, source: str, external_id: str
    ) -> CatalogArtist | None: ...

    @abstractmethod
    async def search(
        self, query: str, *, limit: int = 20, offset: int = 0
    ) -> list[CatalogArtist]: ...

    @abstractmethod
    async def list_by_popularity(self, limit: int = 50) -> list[CatalogArtist]: ...

    @abstractmethod
    async def list_brazilian(self, limit: int = 50) -> list[CatalogArtist]: ...

    @abstractmethod
    async def list_international(self, limit: int = 50) -> list[CatalogArtist]: ...

    @abstractmethod
    async def upsert(self, artist: CatalogArtist) -> CatalogArtist: ...

    @abstractmethod
    async def count(self) -> int: ...


# ── Catalog Album repository ───────────────────────────────────────────────


class ICatalogAlbumRepository(ABC):
    @abstractmethod
    async def get_by_id(self, album_id: UUID) -> CatalogAlbum | None: ...

    @abstractmethod
    async def get_by_title_and_artist(
        self, title: str, artist_id: UUID
    ) -> CatalogAlbum | None: ...

    @abstractmethod
    async def get_by_external_id(
        self, source: str, external_id: str
    ) -> CatalogAlbum | None: ...

    @abstractmethod
    async def search(
        self, query: str, *, limit: int = 20, offset: int = 0
    ) -> list[CatalogAlbum]: ...

    @abstractmethod
    async def list_by_artist(self, artist_id: UUID) -> list[CatalogAlbum]: ...

    @abstractmethod
    async def upsert(self, album: CatalogAlbum) -> CatalogAlbum: ...

    @abstractmethod
    async def count(self) -> int: ...


# ── Catalog Track repository ───────────────────────────────────────────────


class ICatalogTrackRepository(ABC):
    @abstractmethod
    async def get_by_id(self, track_id: UUID) -> CatalogTrack | None: ...

    @abstractmethod
    async def get_by_isrc(self, isrc: str) -> CatalogTrack | None: ...

    @abstractmethod
    async def get_by_external_id(
        self, source: str, external_id: str
    ) -> CatalogTrack | None: ...

    @abstractmethod
    async def search(
        self, query: str, *, limit: int = 20, offset: int = 0
    ) -> list[CatalogTrack]: ...

    @abstractmethod
    async def list_by_artist(
        self, artist_id: UUID, *, limit: int = 50, offset: int = 0
    ) -> list[CatalogTrack]: ...

    @abstractmethod
    async def list_by_album(self, album_id: UUID) -> list[CatalogTrack]: ...

    @abstractmethod
    async def list_popular(self, limit: int = 50) -> list[CatalogTrack]: ...

    @abstractmethod
    async def upsert(self, track: CatalogTrack) -> CatalogTrack: ...

    @abstractmethod
    async def count(self) -> int: ...


# ── Catalog Genre repository ───────────────────────────────────────────────


class ICatalogGenreRepository(ABC):
    @abstractmethod
    async def get_by_id(self, genre_id: UUID) -> CatalogGenre | None: ...

    @abstractmethod
    async def get_by_slug(self, slug: str) -> CatalogGenre | None: ...

    @abstractmethod
    async def get_by_name(self, name: str) -> CatalogGenre | None: ...

    @abstractmethod
    async def list_all(self) -> list[CatalogGenre]: ...

    @abstractmethod
    async def list_artists_by_genre(
        self, genre_id: UUID, *, limit: int = 50
    ) -> list[CatalogArtist]: ...

    @abstractmethod
    async def add_artist_to_genre(
        self, artist_id: UUID, genre_id: UUID
    ) -> CatalogArtistGenre: ...

    @abstractmethod
    async def remove_artist_from_genre(
        self, artist_id: UUID, genre_id: UUID
    ) -> None: ...

    @abstractmethod
    async def upsert(self, genre: CatalogGenre) -> CatalogGenre: ...

    @abstractmethod
    async def count(self) -> int: ...


# ── Track Preview repository ───────────────────────────────────────────────


class ITrackPreviewRepository(ABC):
    @abstractmethod
    async def get_by_id(self, preview_id: UUID) -> TrackPreview | None: ...

    @abstractmethod
    async def get_latest_for_track(self, track_id: UUID) -> TrackPreview | None: ...

    @abstractmethod
    async def list_by_track(self, track_id: UUID) -> list[TrackPreview]: ...

    @abstractmethod
    async def create(self, preview: TrackPreview) -> TrackPreview: ...

    @abstractmethod
    async def delete(self, preview_id: UUID) -> None: ...

    @abstractmethod
    async def delete_expired(self) -> int: ...
