"""
SQLAlchemy ORM model for the ``users`` table.
"""

from __future__ import annotations

from sqlalchemy import Boolean, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.infrastructure.models.base import Base, TimestampMixin, pk_column


class UserModel(Base, TimestampMixin):
    __tablename__ = "users"

    id = pk_column()
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    display_name: Mapped[str | None] = mapped_column(String(100))
    avatar_url: Mapped[str | None] = mapped_column(String(500))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    email_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # ── Relationships ─────────────────────────────────────────────────
    tracks = relationship("TrackModel", back_populates="owner", cascade="all, delete-orphan")
    playlists = relationship("PlaylistModel", back_populates="owner", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<User {self.username!r} ({self.id})>"
