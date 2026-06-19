"""
SQLAlchemy ORM models for the local music catalog.

These models form the local catalog system, storing metadata about artists,
albums, tracks, and genres sourced from external providers (MusicBrainz,
Spotify, iTunes, Last.fm).
"""

from __future__ import annotations

from datetime import datetime  # noqa: TC003

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import UUID  # noqa: TC002
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.infrastructure.models.base import Base, TimestampMixin, _utcnow, pk_column


class CatalogArtistModel(Base, TimestampMixin):
    """Represents a music artist in the local catalog."""

    __tablename__ = "catalog_artists"

    id = pk_column()
    name: Mapped[str] = mapped_column(String(500), unique=True, nullable=False, index=True)
    bio: Mapped[str | None] = mapped_column(Text)
    image_url: Mapped[str | None] = mapped_column(String(1000))
    external_mb_id: Mapped[str | None] = mapped_column(String(100), index=True)
    external_spotify_id: Mapped[str | None] = mapped_column(String(100), index=True)
    external_itunes_id: Mapped[str | None] = mapped_column(String(100))
    external_lastfm_url: Mapped[str | None] = mapped_column(String(1000))
    popularity: Mapped[int] = mapped_column(Integer, default=0, nullable=False, index=True)
    country: Mapped[str | None] = mapped_column(String(10))
    is_brazilian: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # ── Relationships ─────────────────────────────────────────────────
    albums: Mapped[list[CatalogAlbumModel]] = relationship(
        back_populates="artist", cascade="all, delete-orphan"
    )
    tracks: Mapped[list[CatalogTrackModel]] = relationship(
        back_populates="artist",
        foreign_keys="CatalogTrackModel.artist_id",
        cascade="all, delete-orphan",
    )
    genre_associations: Mapped[list[CatalogArtistGenreModel]] = relationship(
        back_populates="artist", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<CatalogArtist {self.name!r} ({self.id})>"


class CatalogAlbumModel(Base, TimestampMixin):
    """Represents a music album in the local catalog."""

    __tablename__ = "catalog_albums"

    id = pk_column()
    title: Mapped[str] = mapped_column(String(500), nullable=False, index=True)
    artist_id: Mapped[UUID] = mapped_column(  # type: ignore[type-arg]
        ForeignKey("catalog_artists.id", ondelete="CASCADE"), nullable=False, index=True
    )
    cover_url: Mapped[str | None] = mapped_column(String(1000))
    release_date: Mapped[str | None] = mapped_column(String(50))
    country: Mapped[str | None] = mapped_column(String(10))
    track_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    external_mb_id: Mapped[str | None] = mapped_column(String(100), index=True)
    external_spotify_id: Mapped[str | None] = mapped_column(String(100), index=True)
    external_itunes_id: Mapped[str | None] = mapped_column(String(100))

    # ── Relationships ─────────────────────────────────────────────────
    artist: Mapped[CatalogArtistModel] = relationship(back_populates="albums")
    tracks: Mapped[list[CatalogTrackModel]] = relationship(
        back_populates="album", cascade="all, delete-orphan"
    )

    __table_args__ = (
        UniqueConstraint(
            "title", "artist_id", name="uq_catalog_albums_title_artist_id"
        ),
    )

    def __repr__(self) -> str:
        return f"<CatalogAlbum {self.title!r} ({self.id})>"


class CatalogTrackModel(Base, TimestampMixin):
    """Represents a track in the local catalog."""

    __tablename__ = "catalog_tracks"

    id = pk_column()
    title: Mapped[str] = mapped_column(String(500), nullable=False, index=True)
    artist_id: Mapped[UUID] = mapped_column(  # type: ignore[type-arg]
        ForeignKey("catalog_artists.id", ondelete="CASCADE"), nullable=False, index=True
    )
    album_id: Mapped[UUID | None] = mapped_column(  # type: ignore[type-arg]
        ForeignKey("catalog_albums.id", ondelete="SET NULL"), nullable=True, index=True
    )
    duration_ms: Mapped[int | None] = mapped_column(Integer)
    track_number: Mapped[int | None] = mapped_column(Integer)
    disc_number: Mapped[int | None] = mapped_column(Integer)
    preview_url: Mapped[str | None] = mapped_column(String(1000))
    isrc: Mapped[str | None] = mapped_column(String(20), unique=True, index=True)
    external_mb_id: Mapped[str | None] = mapped_column(String(100), index=True)
    external_spotify_id: Mapped[str | None] = mapped_column(String(100), index=True)
    external_itunes_id: Mapped[str | None] = mapped_column(String(100))
    explicit: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    popularity: Mapped[int] = mapped_column(Integer, default=0, nullable=False, index=True)

    # ── Relationships ─────────────────────────────────────────────────
    artist: Mapped[CatalogArtistModel] = relationship(
        back_populates="tracks", foreign_keys=[artist_id]
    )
    album: Mapped[CatalogAlbumModel | None] = relationship(back_populates="tracks")
    preview: Mapped[TrackPreviewModel | None] = relationship(
        back_populates="track", uselist=False, cascade="all, delete-orphan"
    )

    __table_args__ = (
        UniqueConstraint(
            "title", "artist_id", name="uq_catalog_tracks_title_artist_id"
        ),
    )

    def __repr__(self) -> str:
        return f"<CatalogTrack {self.title!r} ({self.id})>"


class CatalogGenreModel(Base):
    """Represents a music genre in the local catalog."""

    __tablename__ = "catalog_genres"

    id = pk_column()
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    gradient_from: Mapped[str] = mapped_column(
        String(7), default="#1a1a2e", nullable=False
    )
    gradient_to: Mapped[str] = mapped_column(
        String(7), default="#16213e", nullable=False
    )
    cover_image_url: Mapped[str | None] = mapped_column(String(1000))
    cover_artist_id: Mapped[UUID | None] = mapped_column(  # type: ignore[type-arg]
        ForeignKey("catalog_artists.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=_utcnow,
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        default=_utcnow,
        onupdate=_utcnow,
    )

    # ── Relationships ─────────────────────────────────────────────────
    artist_associations: Mapped[list[CatalogArtistGenreModel]] = relationship(
        back_populates="genre", cascade="all, delete-orphan"
    )
    cover_artist: Mapped[CatalogArtistModel | None] = relationship(
        foreign_keys=[cover_artist_id],
        uselist=False,
    )

    def __repr__(self) -> str:
        return f"<CatalogGenre {self.name!r} ({self.id})>"


class CatalogArtistGenreModel(Base):
    """Junction table linking artists to genres (many-to-many)."""

    __tablename__ = "catalog_artist_genres"

    artist_id: Mapped[UUID] = mapped_column(  # type: ignore[type-arg]
        ForeignKey("catalog_artists.id", ondelete="CASCADE"), primary_key=True
    )
    genre_id: Mapped[UUID] = mapped_column(  # type: ignore[type-arg]
        ForeignKey("catalog_genres.id", ondelete="CASCADE"), primary_key=True
    )

    # ── Relationships ─────────────────────────────────────────────────
    artist: Mapped[CatalogArtistModel] = relationship(back_populates="genre_associations")
    genre: Mapped[CatalogGenreModel] = relationship(back_populates="artist_associations")

    def __repr__(self) -> str:
        return f"<CatalogArtistGenre artist={self.artist_id} genre={self.genre_id}>"


class TrackPreviewModel(Base):
    """Stores preview audio URLs for catalog tracks."""

    __tablename__ = "catalog_track_previews"

    id = pk_column()
    track_id: Mapped[UUID] = mapped_column(  # type: ignore[type-arg]
        ForeignKey("catalog_tracks.id", ondelete="CASCADE"), nullable=False, unique=True
    )
    url: Mapped[str] = mapped_column(String(1000), nullable=False)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    fetched_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=_utcnow,
        server_default=func.now(),
        nullable=False,
    )

    # ── Relationships ─────────────────────────────────────────────────
    track: Mapped[CatalogTrackModel] = relationship(back_populates="preview")

    def __repr__(self) -> str:
        return f"<TrackPreview track_id={self.track_id}>"
