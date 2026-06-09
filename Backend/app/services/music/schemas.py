"""
Pydantic schemas for the unified music metadata response format.

Mirrors the unified JSON structure:
{
  "track": { "title", "duration", "mbid" },
  "artist": { "name", "bio", "similar", "tags", "mbid" },
  "album": { "title", "cover_url", "release_date", "country" },
  "audio_features": { "bpm", "energy", "danceability", "key", "valence" },
  "popularity": 0-100,
  "playcount": 0,
  "lyrics": "...",
  "genres": []
}
"""

from typing import Any

from pydantic import BaseModel, Field


class TrackInfo(BaseModel):
    """Basic track information."""
    title: str = ""
    duration: int | None = None
    mbid: str | None = None
    spotify_id: str | None = None
    preview_url: str | None = None


class ArtistInfo(BaseModel):
    """Artist information aggregated from multiple sources."""
    name: str = ""
    bio: str | None = None
    mbid: str | None = None
    spotify_id: str | None = None
    image_url: str | None = None
    similar: list[dict[str, Any]] = Field(default_factory=list)
    tags: list[str] = Field(default_factory=list)


class AlbumInfo(BaseModel):
    """Album/release information."""
    title: str = ""
    cover_url: str | None = None
    release_date: str | None = None
    country: str | None = None
    mbid: str | None = None


class AudioFeatures(BaseModel):
    """Spotify audio features for a track."""
    bpm: float | None = None
    energy: float | None = None
    danceability: float | None = None
    key: int | None = None
    valence: float | None = None
    acousticness: float | None = None
    instrumentalness: float | None = None
    liveness: float | None = None
    speechiness: float | None = None
    loudness: float | None = None


class UnifiedTrackResponse(BaseModel):
    """Complete aggregated track metadata from all sources."""
    track: TrackInfo = Field(default_factory=TrackInfo)
    artist: ArtistInfo = Field(default_factory=ArtistInfo)
    album: AlbumInfo = Field(default_factory=AlbumInfo)
    audio_features: AudioFeatures = Field(default_factory=AudioFeatures)
    popularity: int = 0
    playcount: int = 0
    lyrics: str | None = None
    genres: list[str] = Field(default_factory=list)
    related_tracks: list[dict[str, Any]] = Field(default_factory=list)


class UnifiedArtistResponse(BaseModel):
    """Complete aggregated artist metadata from all sources."""
    name: str = ""
    bio: str | None = None
    mbid: str | None = None
    spotify_id: str | None = None
    image_url: str | None = None
    genres: list[str] = Field(default_factory=list)
    popularity: int = 0
    playcount: int = 0
    similar_artists: list[dict[str, Any]] = Field(default_factory=list)
    top_tracks: list[dict[str, Any]] = Field(default_factory=list)
    albums: list[dict[str, Any]] = Field(default_factory=list)
    tags: list[str] = Field(default_factory=list)


class UnifiedSearchResult(BaseModel):
    """A single search result item."""
    type: str = "track"  # "track" or "artist"
    track: TrackInfo | None = None
    artist: ArtistInfo | None = None
    album: AlbumInfo | None = None
    audio_features: AudioFeatures | None = None
    popularity: int = 0
    playcount: int = 0
    genres: list[str] = Field(default_factory=list)
    cover_url: str | None = None


class UnifiedSearchResponse(BaseModel):
    """Search results across all APIs."""
    query: str
    tracks: list[UnifiedSearchResult] = Field(default_factory=list)
    artists: list[UnifiedSearchResult] = Field(default_factory=list)
    total_tracks: int = 0
    total_artists: int = 0
