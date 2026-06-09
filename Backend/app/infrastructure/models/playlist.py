"""
SQLAlchemy ORM models for ``playlists`` and the ``playlist_tracks`` association.
"""

from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID  # noqa: TC002
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.infrastructure.models.base import Base, TimestampMixin, pk_column

if TYPE_CHECKING:
    from app.infrastructure.models.track import TrackModel
    from app.infrastructure.models.user import UserModel


class PlaylistModel(Base, TimestampMixin):
    __tablename__ = "playlists"

    id = pk_column()
    user_id: Mapped[UUID] = mapped_column(  # type: ignore[type-arg]
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    cover_art_path: Mapped[str | None] = mapped_column(Text)
    visibility: Mapped[str] = mapped_column(String(20), default="private", nullable=False)

    # ── Relationships ─────────────────────────────────────────────────
    owner: Mapped[UserModel] = relationship(back_populates="playlists")
    track_associations: Mapped[list[PlaylistTrackModel]] = relationship(
        back_populates="playlist", cascade="all, delete-orphan", order_by="PlaylistTrackModel.position"
    )

    def __repr__(self) -> str:
        return f"<Playlist {self.name!r} ({self.id})>"


class PlaylistTrackModel(Base):
    __tablename__ = "playlist_tracks"

    playlist_id: Mapped[UUID] = mapped_column(  # type: ignore[type-arg]
        ForeignKey("playlists.id", ondelete="CASCADE"), primary_key=True
    )
    track_id: Mapped[UUID] = mapped_column(  # type: ignore[type-arg]
        ForeignKey("tracks.id", ondelete="CASCADE"), primary_key=True
    )
    position: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    # ── Relationships ─────────────────────────────────────────────────
    playlist: Mapped[PlaylistModel] = relationship(back_populates="track_associations")
    track: Mapped[TrackModel] = relationship(back_populates="playlist_associations")

    def __repr__(self) -> str:
        return f"<PlaylistTrack pl={self.playlist_id} tr={self.track_id} pos={self.position}>"
