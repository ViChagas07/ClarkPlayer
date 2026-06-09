"""
Music metadata aggregation routes.

Endpoints:
- GET  /search?q={query}      → search tracks and artists
- GET  /track/{mbid}          → full track data
- GET  /artist/{mbid}         → full artist profile
- GET  /artist/{mbid}/similar → similar artists
"""

import logging
from typing import Any

from fastapi import APIRouter, Path, Query
from fastapi.responses import JSONResponse

from app.services.music.aggregator import MusicAggregator
from app.services.music.schemas import (
    UnifiedArtistResponse,
    UnifiedSearchResponse,
    UnifiedTrackResponse,
)

logger = logging.getLogger("music.routes")

router = APIRouter(prefix="/music", tags=["Music Metadata"])


async def _get_aggregator() -> MusicAggregator:
    """Return a fresh aggregator instance per request."""
    return MusicAggregator()


@router.get("/search", response_model=UnifiedSearchResponse)
async def search_music(
    q: str = Query(..., min_length=1, max_length=200, description="Search query for tracks and artists"),
    limit: int = Query(5, ge=1, le=20, description="Maximum results per category"),
) -> UnifiedSearchResponse:
    """
    Search for tracks and artists across all integrated music APIs.

    Aggregates data from MusicBrainz, iTunes, Spotify, and Last.fm.
    Results are merged and de-duplicated into a unified schema.
    """
    aggregator = await _get_aggregator()
    try:
        return await aggregator.search(query=q, limit=limit)
    finally:
        await aggregator.close()


@router.get("/track/{mbid}", response_model=UnifiedTrackResponse)
async def get_track_metadata(
    mbid: str = Path(..., min_length=1, description="MusicBrainz recording ID"),
) -> UnifiedTrackResponse | JSONResponse:
    """
    Get full aggregated track metadata from all sources.

    Combines MusicBrainz recording data, iTunes artwork, Spotify audio features
    and popularity, Genius lyrics, and Last.fm playcounts and similar tracks.
    """
    aggregator = await _get_aggregator()
    try:
        result = await aggregator.get_track(mbid)
        if result is None:
            return JSONResponse(
                status_code=404,
                content={"error": "not_found", "message": f"Track with MBID '{mbid}' not found."},
            )
        return result.model_dump()  # type: ignore[return-value]
    finally:
        await aggregator.close()


@router.get("/artist/{mbid}", response_model=UnifiedArtistResponse)
async def get_artist_profile(
    mbid: str = Path(..., min_length=1, description="MusicBrainz artist ID"),
) -> UnifiedArtistResponse | JSONResponse:
    """
    Get full artist profile aggregated from all sources.

    Combines MusicBrainz artist data, Spotify popularity/genres/top-tracks,
    Last.fm biography/playcount/tags, and iTunes imagery.
    """
    aggregator = await _get_aggregator()
    try:
        result = await aggregator.get_artist(mbid)
        if result is None:
            return JSONResponse(
                status_code=404,
                content={"error": "not_found", "message": f"Artist with MBID '{mbid}' not found."},
            )
        return result.model_dump()  # type: ignore[return-value]
    finally:
        await aggregator.close()


@router.get("/artist/{mbid}/similar")
async def get_similar_artists(
    mbid: str = Path(..., min_length=1, description="MusicBrainz artist ID"),
    limit: int = Query(10, ge=1, le=20, description="Maximum number of similar artists"),
) -> dict[str, Any]:
    """
    Get similar artists for a given artist.

    Primarily sourced from Last.fm, with Spotify as secondary source.
    """
    aggregator = await _get_aggregator()
    try:
        artists = await aggregator.get_similar_artists(mbid, limit=limit)
        return {"mbid": mbid, "similar": artists, "total": len(artists)}
    finally:
        await aggregator.close()
