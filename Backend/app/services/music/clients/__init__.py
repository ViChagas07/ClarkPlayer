"""External music API clients."""

from app.services.music.clients.genius import GeniusClient
from app.services.music.clients.itunes import ITunesClient
from app.services.music.clients.lastfm import LastFmClient
from app.services.music.clients.musicbrainz import MusicBrainzClient
from app.services.music.clients.spotify import SpotifyClient

__all__ = [
    "MusicBrainzClient",
    "ITunesClient",
    "SpotifyClient",
    "GeniusClient",
    "LastFmClient",
]
