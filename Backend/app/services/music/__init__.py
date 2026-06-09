"""
Music metadata aggregation services.

Integrates with:
- MusicBrainz (artist/album metadata, canonical IDs)
- iTunes Search (high-resolution album artwork, previews)
- Spotify (audio features, popularity, genres, related artists)
- Genius (lyrics, song descriptions)
- Last.fm (similar artists, detailed tags, playcounts, biographies)
"""

from app.services.music.clients import (
    MusicBrainzClient,
    ITunesClient,
    SpotifyClient,
    GeniusClient,
    LastFmClient,
)
from app.services.music.aggregator import MusicAggregator
from app.services.music.schemas import (
    TrackInfo,
    ArtistInfo,
    AlbumInfo,
    AudioFeatures,
    UnifiedTrackResponse,
    UnifiedArtistResponse,
    UnifiedSearchResponse,
)

__all__ = [
    "MusicBrainzClient",
    "ITunesClient",
    "SpotifyClient",
    "GeniusClient",
    "LastFmClient",
    "MusicAggregator",
    "TrackInfo",
    "ArtistInfo",
    "AlbumInfo",
    "AudioFeatures",
    "UnifiedTrackResponse",
    "UnifiedArtistResponse",
    "UnifiedSearchResponse",
]
