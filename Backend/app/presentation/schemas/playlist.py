"""
Pydantic schemas for playlist endpoints.
"""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.domain.enums import PlaylistVisibility


class CreatePlaylistRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: str | None = Field(None, max_length=2000)
    visibility: PlaylistVisibility = PlaylistVisibility.PRIVATE


class UpdatePlaylistRequest(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=200)
    description: str | None = Field(None, max_length=2000)
    visibility: PlaylistVisibility | None = None
    cover_art_path: str | None = None


class AddTrackRequest(BaseModel):
    track_id: str  # UUID


class ReorderRequest(BaseModel):
    track_ids: list[str]  # Ordered list of track UUIDs


class PlaylistResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    description: str | None = None
    visibility: str
    cover_art_path: str | None = None
    track_count: int = 0
    created_at: datetime
    updated_at: datetime
