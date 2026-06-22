"""
Pydantic v2 schemas for the local music catalog API.

All data originates from PostgreSQL.  These schemas define the shape of
request/response data for catalog endpoints — artists, albums, tracks,
genres, discovery sections, and search results.
"""

from datetime import datetime
from typing import Generic, TypeVar

from pydantic import BaseModel, Field

T = TypeVar("T")


# ── Pagination ─────────────────────────────────────────────────────────────

class PaginatedResponse(BaseModel, Generic[T]):
    """Generic paginated response wrapper."""

    items: list[T] = Field(default_factory=list)
    total: int = 0
    offset: int = 0
    limit: int = 50


# ── Artist Schemas ─────────────────────────────────────────────────────────

class CatalogArtistSummary(BaseModel):
    """Lightweight artist representation for lists and discovery sections."""

    id: str
    name: str
    image_url: str | None = None
    genres: list[str] = Field(default_factory=list)
    popularity: int = 0
    country: str | None = None
    is_brazilian: bool = False


class CatalogArtistResponse(BaseModel):
    """Full artist representation returned by detail endpoints."""

    id: str
    name: str
    image_url: str | None = None
    genres: list[str] = Field(default_factory=list)
    popularity: int = 0
    playcount: int = 0
    country: str | None = None
    bio: str | None = None
    verified: bool = False
    track_count: int = 0


class CatalogArtistDetailResponse(CatalogArtistResponse):
    """Extended artist detail including associated albums."""

    albums: list["CatalogAlbumSummary"] = Field(default_factory=list)


class CatalogArtistListResponse(BaseModel):
    """Artist list with pagination."""

    artists: list[CatalogArtistResponse]
    total: int
    offset: int
    limit: int
    genres: list[str] = Field(default_factory=list)


# ── Album Schemas ──────────────────────────────────────────────────────────

class CatalogAlbumSummary(BaseModel):
    """Lightweight album representation for lists and search results."""

    id: str
    title: str
    artist_id: str
    artist_name: str = "Unknown"
    cover_url: str | None = None
    release_date: str | None = None
    track_count: int = 0


class CatalogAlbumResponse(BaseModel):
    """Full album representation returned by list endpoints."""

    id: str
    title: str
    artist_id: str
    artist_name: str = "Unknown"
    cover_url: str | None = None
    release_date: str | None = None
    country: str | None = None
    track_count: int = 0
    external_mb_id: str | None = None
    external_spotify_id: str | None = None


class CatalogAlbumDetailResponse(CatalogAlbumResponse):
    """Extended album detail including track listing."""

    tracks: list["CatalogTrackItem"] = Field(default_factory=list)


class CatalogAlbumListResponse(BaseModel):
    """Album list with pagination."""

    albums: list[CatalogAlbumResponse]
    total: int
    offset: int
    limit: int


# ── Track Schemas ──────────────────────────────────────────────────────────

class CatalogTrackItem(BaseModel):
    """Compact track representation for discovery sections and search."""

    id: str
    title: str
    artist_id: str
    artist_name: str
    album_id: str | None = None
    album_title: str | None = None
    album_cover: str | None = None
    preview_url: str | None = None
    duration_ms: int | None = None
    popularity: int = 0
    explicit: bool = False
    isrc: str | None = None


class CatalogTrackResponse(BaseModel):
    """Full track representation returned by detail and list endpoints."""

    id: str
    title: str
    artist_id: str
    artist_name: str
    album_id: str | None = None
    album_title: str | None = None
    album_cover: str | None = None
    source: str | None = None
    preview_url: str | None = None
    duration_ms: int | None = None
    popularity: int = 0
    genres: list[str] = Field(default_factory=list)
    bpm: float | None = None
    energy: float | None = None
    danceability: float | None = None
    track_number: int | None = None
    disc_number: int | None = None
    explicit: bool = False
    isrc: str | None = None


class CatalogTrackDetailResponse(CatalogTrackResponse):
    """Extended track detail including full album and artist context."""

    external_mb_id: str | None = None
    external_spotify_id: str | None = None
    external_itunes_id: str | None = None


class CatalogTrackListResponse(BaseModel):
    """Track list with pagination."""

    tracks: list[CatalogTrackResponse]
    total: int
    offset: int
    limit: int


# ── Genre Schemas ──────────────────────────────────────────────────────────

class CatalogGenreResponse(BaseModel):
    """Genre representation with artist count and mosaic cover images."""

    id: str
    name: str
    slug: str
    artist_count: int = 0
    track_count: int = 0
    mosaic_images: list[str] = Field(default_factory=list)


class GenreResponse(BaseModel):
    """Legacy genre response — kept for backward compatibility."""

    name: str
    slug: str
    track_count: int = 0
    artist_count: int = 0


# ── Search Schemas ─────────────────────────────────────────────────────────

class CatalogSearchResponse(BaseModel):
    """Aggregated search results across all entity types."""

    query: str
    artists: list[CatalogArtistSummary] = Field(default_factory=list)
    tracks: list[CatalogTrackItem] = Field(default_factory=list)
    albums: list[CatalogAlbumSummary] = Field(default_factory=list)
    genres: list[CatalogGenreResponse] = Field(default_factory=list)
    total: int = 0


class CatalogSearchSuggestions(BaseModel):
    """Categorized autocomplete suggestions for the search-as-you-type dropdown."""

    class _ArtistSuggestion(BaseModel):
        id: str
        name: str
        image_url: str | None = None

    class _AlbumSuggestion(BaseModel):
        id: str
        title: str
        artist_name: str
        cover_url: str | None = None

    class _TrackSuggestion(BaseModel):
        id: str
        title: str
        artist_name: str
        cover_url: str | None = None

    artists: list[_ArtistSuggestion] = Field(default_factory=list)
    albums: list[_AlbumSuggestion] = Field(default_factory=list)
    tracks: list[_TrackSuggestion] = Field(default_factory=list)


# ── Discovery Schemas ──────────────────────────────────────────────────────

class DiscoveryResponse(BaseModel):
    """Precomputed discovery sections for the home screen."""

    top_artists: list[CatalogArtistSummary] = Field(default_factory=list)
    trending_tracks: list[CatalogTrackItem] = Field(default_factory=list)
    featured_albums: list[CatalogAlbumSummary] = Field(default_factory=list)
    popular_genres: list[CatalogGenreResponse] = Field(default_factory=list)
    brazilian_artists: list[CatalogArtistSummary] = Field(default_factory=list)
    international_artists: list[CatalogArtistSummary] = Field(default_factory=list)
    sections: dict[str, list[CatalogTrackItem]] = Field(default_factory=dict)


# ── Ingestion Schemas (kept for backward compatibility) ────────────────────

class IngestionStatusResponse(BaseModel):
    """Status of the catalog ingestion background pipeline."""

    status: str = "idle"
    progress: dict | None = None
    last_run: datetime | None = None
    stats: dict | None = None
