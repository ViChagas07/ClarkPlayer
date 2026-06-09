"""
Pydantic schemas for track (audio file) endpoints.
"""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class TrackMetadataUpdate(BaseModel):
    title: str | None = Field(None, max_length=300)
    artist: str | None = Field(None, max_length=200)
    album: str | None = Field(None, max_length=200)
    genre: str | None = Field(None, max_length=100)
    year: int | None = Field(None, ge=1900, le=2100)


class TrackResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    artist: str | None = None
    album: str | None = None
    genre: str | None = None
    year: int | None = None
    duration: float | None = None
    file_size: int
    file_format: str
    cover_art_path: str | None = None
    play_count: int = 0
    last_played_at: datetime | None = None
    is_favorite: bool = False
    created_at: datetime
    updated_at: datetime


class TrackListResponse(BaseModel):
    items: list[TrackResponse]
    total: int
    offset: int
    limit: int


class TrackUploadResponse(BaseModel):
    track: TrackResponse
    message: str = "File uploaded successfully."
