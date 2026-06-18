"""
SQLAlchemy ORM model for the ``users`` table.
"""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import Boolean, DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.infrastructure.models.base import Base, TimestampMixin, pk_column


class UserModel(Base, TimestampMixin):
    __tablename__ = "users"

    id = pk_column()
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    hashed_password: Mapped[str | None] = mapped_column(String(255), nullable=True)
    display_name: Mapped[str | None] = mapped_column(String(100))
    avatar_url: Mapped[str | None] = mapped_column(String(500))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    email_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # ── OAuth / social login ───────────────────────────────────────────
    provider: Mapped[str | None] = mapped_column(String(20), nullable=True, index=True)
    provider_id: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)

    # ── Consent tracking (LGPD) ────────────────────────────────────────
    terms_version: Mapped[str | None] = mapped_column(String(20), nullable=True)
    privacy_version: Mapped[str | None] = mapped_column(String(20), nullable=True)
    consent_accepted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    consent_ip: Mapped[str | None] = mapped_column(String(45), nullable=True)
    consent_user_agent: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # ── Relationships ─────────────────────────────────────────────────
    tracks = relationship("TrackModel", back_populates="owner", cascade="all, delete-orphan")
    playlists = relationship("PlaylistModel", back_populates="owner", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<User {self.username!r} ({self.id})>"
