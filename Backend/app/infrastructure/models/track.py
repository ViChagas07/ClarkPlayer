"""
SQLAlchemy ORM model for the ``tracks`` table (audio files).
"""

from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import BigInteger, Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.infrastructure.models.base import Base, TimestampMixin, pk_column

if TYPE_CHECKING:
    from app.infrastructure.models.user import UserModel


class TrackModel(Base, TimestampMixin):
    __tablename__ = "tracks"

    id = pk_column()
    user_id: Mapped[UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    artist: Mapped[str | None] = mapped_column(String(200), index=True)
    album: Mapped[str | None] = mapped_column(String(200), index=True)
    genre: Mapped[str | None] = mapped_column(String(100))
    year: Mapped[int | None] = mapped_column(Integer)
    duration: Mapped[float | None] = mapped_column(Float)  # seconds
    file_path: Mapped[str] = mapped_column(Text, nullable=False)
    file_size: Mapped[int] = mapped_column(BigInteger, default=0)
    file_format: Mapped[str] = mapped_column(String(10), nullable=False)
    cover_art_path: Mapped[str | None] = mapped_column(Text)
    play_count: Mapped[int] = mapped_column(Integer, default=0)
    last_played_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    is_favorite: Mapped[bool] = mapped_column(Boolean, default=False)

    # ── Relationships ─────────────────────────────────────────────────
    owner: Mapped[UserModel] = relationship(back_populates="tracks")
    playlist_associations: Mapped[list[PlaylistTrackModel]] = relationship(  # type: ignore[name-defined]  # noqa: F821
        back_populates="track", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Track {self.title!r} ({self.id})>"


from app.infrastructure.models.playlist import PlaylistTrackModel  # noqa: E402, F811
