"""
Track (audio file) service — upload, list, search, manage metadata.
"""

import os
from contextlib import suppress
from datetime import UTC
from pathlib import Path
from typing import BinaryIO
from uuid import UUID, uuid4

from app.application.interfaces.repositories import ITrackRepository
from app.core.config import get_settings
from app.core.exceptions import (
    FileTooLargeError,
    NotFoundError,
    StorageError,
    UnsupportedFileTypeError,
)
from app.domain.entities import Track
from app.domain.enums import AudioFormat

_settings = get_settings()


class TrackService:
    """Use-cases around audio files."""

    def __init__(self, track_repo: ITrackRepository) -> None:
        self._track_repo = track_repo

    async def upload(
        self,
        user_id: UUID,
        file: BinaryIO,
        filename: str,
        *,
        title: str | None = None,
        artist: str | None = None,
        album: str | None = None,
        genre: str | None = None,
        year: int | None = None,
    ) -> Track:
        """
        Persist an uploaded audio file to disk and create its database record.
        """
        ext = Path(filename).suffix.lower()
        if ext not in _settings.ALLOWED_AUDIO_EXTENSIONS:
            raise UnsupportedFileTypeError(
                f"'{ext}' is not a supported audio format."
            )

        # Determine the audio format enum value
        fmt_map: dict[str, AudioFormat] = {
            ".mp3": AudioFormat.MP3,
            ".flac": AudioFormat.FLAC,
            ".wav": AudioFormat.WAV,
            ".aac": AudioFormat.AAC,
            ".ogg": AudioFormat.OGG,
            ".wma": AudioFormat.WMA,
            ".m4a": AudioFormat.M4A,
            ".opus": AudioFormat.OPUS,
        }
        audio_format = fmt_map.get(ext, AudioFormat.MP3)

        # Compute file size and validate
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)
        max_bytes = _settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
        if file_size > max_bytes:
            raise FileTooLargeError(
                f"File exceeds the {_settings.MAX_UPLOAD_SIZE_MB} MB limit."
            )

        # Build storage path: media/<user_id>/<uuid><ext>
        user_dir = _settings.MEDIA_ROOT / str(user_id)
        user_dir.mkdir(parents=True, exist_ok=True)

        stored_name = f"{uuid4()}{ext}"
        file_path = user_dir / stored_name

        try:
            with open(file_path, "wb") as dst:
                while chunk := file.read(8192):
                    dst.write(chunk)
        except OSError as exc:
            raise StorageError(f"Could not write file to disk: {exc}") from exc

        track = Track(
            user_id=user_id,
            title=title or Path(filename).stem,
            artist=artist,
            album=album,
            genre=genre,
            year=year,
            file_path=str(file_path),
            file_size=file_size,
            file_format=audio_format,
        )
        return await self._track_repo.create(track)

    async def get_track(self, track_id: UUID) -> Track:
        track = await self._track_repo.get_by_id(track_id)
        if track is None:
            raise NotFoundError("Track not found.")
        return track

    async def list_tracks(
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
    ) -> list[Track]:
        return list(
            await self._track_repo.list_by_user(
                user_id,
                offset=offset,
                limit=limit,
                search=search,
                artist=artist,
                album=album,
                genre=genre,
                is_favorite=is_favorite,
            )
        )

    async def count_tracks(
        self, user_id: UUID, *, search: str | None = None
    ) -> int:
        return await self._track_repo.count_by_user(user_id, search=search)

    async def update_metadata(
        self,
        track_id: UUID,
        *,
        title: str | None = None,
        artist: str | None = None,
        album: str | None = None,
        genre: str | None = None,
        year: int | None = None,
    ) -> Track:
        track = await self.get_track(track_id)
        updated = Track(
            id=track.id,
            user_id=track.user_id,
            title=title if title is not None else track.title,
            artist=artist if artist is not None else track.artist,
            album=album if album is not None else track.album,
            genre=genre if genre is not None else track.genre,
            year=year if year is not None else track.year,
            duration=track.duration,
            file_path=track.file_path,
            file_size=track.file_size,
            file_format=track.file_format,
            cover_art_path=track.cover_art_path,
            play_count=track.play_count,
            last_played_at=track.last_played_at,
            is_favorite=track.is_favorite,
            created_at=track.created_at,
        )
        return await self._track_repo.update(updated)

    async def toggle_favorite(self, track_id: UUID) -> Track:
        track = await self.get_track(track_id)
        updated = Track(
            id=track.id,
            user_id=track.user_id,
            title=track.title,
            artist=track.artist,
            album=track.album,
            genre=track.genre,
            year=track.year,
            duration=track.duration,
            file_path=track.file_path,
            file_size=track.file_size,
            file_format=track.file_format,
            cover_art_path=track.cover_art_path,
            play_count=track.play_count,
            last_played_at=track.last_played_at,
            is_favorite=not track.is_favorite,
            created_at=track.created_at,
        )
        return await self._track_repo.update(updated)

    async def record_play(self, track_id: UUID) -> Track:
        """Increment play count and update last-played timestamp."""
        track = await self.get_track(track_id)
        from datetime import datetime

        updated = Track(
            id=track.id,
            user_id=track.user_id,
            title=track.title,
            artist=track.artist,
            album=track.album,
            genre=track.genre,
            year=track.year,
            duration=track.duration,
            file_path=track.file_path,
            file_size=track.file_size,
            file_format=track.file_format,
            cover_art_path=track.cover_art_path,
            play_count=track.play_count + 1,
            last_played_at=datetime.now(UTC),
            is_favorite=track.is_favorite,
            created_at=track.created_at,
        )
        return await self._track_repo.update(updated)

    async def delete_track(self, track_id: UUID) -> None:
        """Delete both the file and the database record."""
        track = await self.get_track(track_id)
        # Remove the physical file
        file_path = Path(track.file_path)
        if file_path.exists():
            with suppress(OSError):
                file_path.unlink()  # Best-effort; the DB record will still be removed.
        await self._track_repo.delete(track_id)

    async def get_file_path(self, track_id: UUID) -> Path:
        """Return the absolute filesystem path to the audio file."""
        track = await self.get_track(track_id)
        return Path(track.file_path)
