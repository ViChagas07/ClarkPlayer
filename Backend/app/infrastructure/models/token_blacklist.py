"""
SQLAlchemy ORM model for the ``token_blacklist`` table.

Stores invalidated refresh tokens to prevent their reuse after logout.
"""

from __future__ import annotations

from datetime import datetime  # noqa: TC003

from sqlalchemy import DateTime, Index, String
from sqlalchemy.orm import Mapped, mapped_column

from app.infrastructure.models.base import Base, pk_column


class TokenBlacklistModel(Base):
    __tablename__ = "token_blacklist"

    id = pk_column()
    token_jti: Mapped[str] = mapped_column(
        String(255), 
        unique=True, 
        nullable=False, 
        index=True,
        comment="JWT ID (jti claim) of the blacklisted token"
    )
    user_id: Mapped[str] = mapped_column(
        String(36), 
        nullable=False, 
        index=True,
        comment="User ID associated with the token"
    )
    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        nullable=False,
        comment="When the token naturally expires (for cleanup)"
    )
    revoked_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        nullable=False,
        comment="When the token was revoked (blacklisted)"
    )
    reason: Mapped[str | None] = mapped_column(
        String(50),
        comment="Reason for revocation (e.g., 'logout', 'security')"
    )

    __table_args__ = (
        Index('ix_token_blacklist_expires_at', 'expires_at'),
    )

    def __repr__(self) -> str:
        return f"<TokenBlacklist token_jti={self.token_jti!r} user_id={self.user_id}>"
