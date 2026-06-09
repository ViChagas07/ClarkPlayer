"""
Music data aggregation service.

Orchestrates the pipeline across all 5 APIs:
1. MusicBrainz → canonical artist/release MBIDs
2. iTunes → album cover (highest resolution)
3. Spotify → audio features + popularity + genres + related artists
4. Genius → lyrics + song descriptions
5. Last.fm → similar artists + detailed tags + playcounts

Fault-tolerant: if any API fails, continues with remaining sources.
"""

import asyncio
import logging
from typing import Any

import httpx

from app.services.music.clients.musicbrainz import MusicBrainzClient
from app.services.music.clients.itunes import ITunesClient
from app.services.music.clients.spotify import SpotifyClient
from app.services.music.clients.genius import GeniusClient
from app.services.music.clients.lastfm import LastFmClient
from app.services.music.schemas import (
    TrackInfo,
    ArtistInfo,
    AlbumInfo,
    AudioFeatures,
    UnifiedTrackResponse,
    UnifiedArtistResponse,
    UnifiedSearchResponse,
    UnifiedSearchResult,
)

logger = logging.getLogger("music.aggregator")


class MusicAggregator:
    """Aggregates music metadata from MusicBrainz, iTunes, Spotify, Genius, and Last.fm."""

    def __init__(self, client: httpx.AsyncClient | None = None):
        self._client = client
        self._mb: MusicBrainzClient | None = None
        self._itunes: ITunesClient | None = None
        self._spotify: SpotifyClient | None = None
        self._genius: GeniusClient | None = None
        self._lastfm: LastFmClient | None = None

    @property
    def client(self) -> httpx.AsyncClient:
        if self._client is None:
            self._client = httpx.AsyncClient(timeout=15.0)
        return self._client

    @property
    def mb(self) -> MusicBrainzClient:
        if self._mb is None:
            self._mb = MusicBrainzClient(self.client)
        return self._mb

    @property
    def itunes(self) -> ITunesClient:
        if self._itunes is None:
            self._itunes = ITunesClient(self.client)
        return self._itunes

    @property
    def spotify(self) -> SpotifyClient:
        if self._spotify is None:
            self._spotify = SpotifyClient(self.client)
        return self._spotify

    @property
    def genius(self) -> GeniusClient:
        if self._genius is None:
            self._genius = GeniusClient(self.client)
        return self._genius

    @property
    def lastfm(self) -> LastFmClient:
        if self._lastfm is None:
            self._lastfm = LastFmClient(self.client)
        return self._lastfm

    async def search(self, query: str, limit: int = 5) -> UnifiedSearchResponse:
        """
        Search tracks and artists across all APIs.
        Pipeline:
        1. Search MusicBrainz for artists + recordings
        2. Parallel: iTunes + Spotify + Last.fm search
        3. Merge results
        """
        tracks: list[UnifiedSearchResult] = []
        artists_list: list[UnifiedSearchResult] = []

        # Step 1: MusicBrainz search (canonical IDs)
        mb_artists_task = self.mb.search_artist(query, limit)
        mb_recordings_task = self.mb.search_recording(query, limit)

        mb_artists, mb_recordings = await asyncio.gather(
            mb_artists_task, mb_recordings_task, return_exceptions=True,
        )
        if isinstance(mb_artists, Exception):
            logger.warning("MusicBrainz artist search failed: %s", mb_artists)
            mb_artists = []
        if isinstance(mb_recordings, Exception):
            logger.warning("MusicBrainz recording search failed: %s", mb_recordings)
            mb_recordings = []

        # Step 2: Parallel searches from other APIs
        itunes_search = self.itunes.search(query, limit=limit)
        spotify_track_search = self.spotify.search_track(query, limit=limit)
        spotify_artist_search = self.spotify.search_artist(query, limit=limit)
        lastfm_track_search = self.lastfm.search_track(query, limit=limit)
        lastfm_artist_search = self.lastfm.search_artist(query, limit=limit)

        itunes_results, sp_tracks, sp_artists, lfm_tracks, lfm_artists = await asyncio.gather(
            itunes_search, spotify_track_search, spotify_artist_search,
            lastfm_track_search, lastfm_artist_search,
            return_exceptions=True,
        )

        # Unwrap exceptions
        if isinstance(itunes_results, Exception):
            logger.warning("iTunes search failed: %s", itunes_results)
            itunes_results = []
        if isinstance(sp_tracks, Exception):
            logger.warning("Spotify track search failed: %s", sp_tracks)
            sp_tracks = {}
        if isinstance(sp_artists, Exception):
            logger.warning("Spotify artist search failed: %s", sp_artists)
            sp_artists = {}
        if isinstance(lfm_tracks, Exception):
            logger.warning("Last.fm track search failed: %s", lfm_tracks)
            lfm_tracks = []
        if isinstance(lfm_artists, Exception):
            logger.warning("Last.fm artist search failed: %s", lfm_artists)
            lfm_artists = []

        # Step 3: Merge track results
        sp_track_items: list[dict[str, Any]] = (
            sp_tracks.get("tracks", {}).get("items", []) if isinstance(sp_tracks, dict) else []
        )
        lfm_track_items: list[dict[str, Any]] = (
            lfm_tracks if isinstance(lfm_tracks, list) else []
        )

        for recording in mb_recordings[:limit]:
            track = UnifiedSearchResult(
                type="track",
                track=TrackInfo(
                    title=recording.get("title", ""),
                    duration=recording.get("length"),
                    mbid=recording.get("id"),
                ),
            )
            # Attach artist from recording
            artist_credits = recording.get("artist-credit", [])
            if artist_credits:
                artist_name = "".join(
                    ac.get("artist", {}).get("name", "")
                    + (ac.get("joinphrase", ""))
                    for ac in artist_credits
                )
                track.artist = ArtistInfo(name=artist_name.strip() or query)
            else:
                track.artist = ArtistInfo(name=query)

            # Find matching iTunes artwork
            for it_result in itunes_results:
                it_name = (it_result.get("artistName", "") + " " + it_result.get("collectionName", "")).lower()
                if recording.get("title", "").lower() in it_name or query.lower() in it_name:
                    track.cover_url = it_result.get("artworkUrl100", "").replace("100x100bb", "600x600bb")
                    if it_result.get("previewUrl"):
                        if track.track:
                            track.track.preview_url = it_result.get("previewUrl")
                    break

            tracks.append(track)

        # Add Spotify track results
        for sp_track in sp_track_items[:limit]:
            sp_artist_name = (
                sp_track.get("artists", [{}])[0].get("name", "") if sp_track.get("artists") else ""
            )
            sp_album = sp_track.get("album", {})
            cover = None
            if sp_album.get("images"):
                cover = sp_album["images"][0].get("url")

            track = UnifiedSearchResult(
                type="track",
                track=TrackInfo(
                    title=sp_track.get("name", ""),
                    duration=sp_track.get("duration_ms"),
                    spotify_id=sp_track.get("id"),
                    preview_url=sp_track.get("preview_url"),
                ),
                artist=ArtistInfo(
                    name=sp_artist_name,
                    spotify_id=sp_track.get("artists", [{}])[0].get("id") if sp_track.get("artists") else None,
                ),
                album=AlbumInfo(
                    title=sp_album.get("name", ""),
                    cover_url=cover,
                    release_date=sp_album.get("release_date"),
                ),
                popularity=sp_track.get("popularity", 0),
                cover_url=cover,
            )
            tracks.append(track)

        # Step 4: Merge artist results
        sp_artist_items: list[dict[str, Any]] = (
            sp_artists.get("artists", {}).get("items", []) if isinstance(sp_artists, dict) else []
        )
        lfm_artist_items: list[dict[str, Any]] = (
            lfm_artists if isinstance(lfm_artists, list) else []
        )

        for mb_artist in mb_artists[:limit]:
            artist = UnifiedSearchResult(
                type="artist",
                artist=ArtistInfo(
                    name=mb_artist.get("name", ""),
                    mbid=mb_artist.get("id"),
                ),
            )

            # Find matching Spotify artist
            for sp in sp_artist_items:
                if sp.get("name", "").lower() == mb_artist.get("name", "").lower():
                    artist.artist.spotify_id = sp.get("id")  # type: ignore[union-attr]
                    artist.popularity = sp.get("popularity", 0)
                    artist.genres = sp.get("genres", [])
                    if sp.get("images"):
                        artist.cover_url = sp["images"][0].get("url")
                    break

            # Last.fm playcount
            for lfm in lfm_artist_items:
                if isinstance(lfm, dict) and lfm.get("name", "").lower() == mb_artist.get("name", "").lower():
                    try:
                        artist.playcount = int(lfm.get("listeners", 0))
                    except (ValueError, TypeError):
                        pass
                    break

            artists_list.append(artist)

        # Add remaining Spotify artists
        for sp in sp_artist_items[:limit]:
            if not any(
                a.artist and a.artist.name.lower() == sp.get("name", "").lower()
                for a in artists_list if a.artist
            ):
                img_url = None
                if sp.get("images"):
                    img_url = sp["images"][0].get("url")
                artist = UnifiedSearchResult(
                    type="artist",
                    artist=ArtistInfo(
                        name=sp.get("name", ""),
                        spotify_id=sp.get("id"),
                    ),
                    popularity=sp.get("popularity", 0),
                    genres=sp.get("genres", []),
                    cover_url=img_url,
                )
                artists_list.append(artist)

        return UnifiedSearchResponse(
            query=query,
            tracks=tracks[:limit],
            artists=artists_list[:limit],
            total_tracks=len(tracks),
            total_artists=len(artists_list),
        )

    async def get_track(self, mbid: str) -> UnifiedTrackResponse | None:
        """Get full aggregated track metadata by MusicBrainz recording ID."""
        # Step 1: Get recording from MusicBrainz
        recording = await self.mb.get_recording(mbid)
        if not recording:
            return None

        track_title = recording.get("title", "")
        artist_name = ""
        artist_mbid = None

        # Extract artist from recording
        artist_credits = recording.get("artist-credit", [])
        if artist_credits:
            names: list[str] = []
            for ac in artist_credits:
                a = ac.get("artist", {})
                names.append(a.get("name", ""))
                if not artist_mbid and a.get("id"):
                    artist_mbid = a.get("id")
            artist_name = "".join(names)

        # Get release info
        releases = recording.get("releases", [])
        album_title = releases[0].get("title", "") if releases else ""

        duration = recording.get("length")

        response = UnifiedTrackResponse(
            track=TrackInfo(
                title=track_title,
                duration=duration,
                mbid=mbid,
            ),
            artist=ArtistInfo(
                name=artist_name or "Unknown Artist",
                mbid=artist_mbid,
            ),
            album=AlbumInfo(title=album_title),
        )

        # Step 2: Parallel fetch from other APIs
        search_query = f"{artist_name} {track_title}".strip()

        itunes_artwork = self.itunes.get_cover_art(artist_name, album_title or track_title)
        spotify_search = self.spotify.search_track(search_query, limit=1)
        genius_lyrics = self.genius.get_lyrics(search_query)
        lastfm_track = self.lastfm.get_track_info(artist_name, track_title)

        results = await asyncio.gather(
            itunes_artwork, spotify_search, genius_lyrics, lastfm_track,
            return_exceptions=True,
        )

        # iTunes artwork
        if not isinstance(results[0], Exception) and results[0]:
            response.album.cover_url = results[0]

        # Spotify
        if not isinstance(results[1], Exception) and results[1]:
            sp_data = results[1]
            sp_items = sp_data.get("tracks", {}).get("items", [])
            if sp_items:
                sp_track = sp_items[0]
                response.track.spotify_id = sp_track.get("id")
                response.popularity = sp_track.get("popularity", 0)

                # Get audio features
                if sp_track.get("id"):
                    features = await self.spotify.get_audio_features(sp_track["id"])
                    if features:
                        response.audio_features = AudioFeatures(
                            bpm=features.get("tempo"),
                            energy=features.get("energy"),
                            danceability=features.get("danceability"),
                            key=features.get("key"),
                            valence=features.get("valence"),
                            acousticness=features.get("acousticness"),
                            instrumentalness=features.get("instrumentalness"),
                            liveness=features.get("liveness"),
                            speechiness=features.get("speechiness"),
                            loudness=features.get("loudness"),
                        )

                # Album from Spotify
                sp_album = sp_track.get("album", {})
                if sp_album.get("name"):
                    response.album.title = response.album.title or sp_album["name"]
                if sp_album.get("images"):
                    response.album.cover_url = response.album.cover_url or sp_album["images"][0].get("url")
                if sp_album.get("release_date"):
                    response.album.release_date = sp_album["release_date"]

                # Genres from artist
                sp_artists = sp_track.get("artists", [])
                if sp_artists:
                    sp_artist_id = sp_artists[0].get("id")
                    response.artist.spotify_id = sp_artist_id
                    if sp_artist_id:
                        sp_artist = await self.spotify.get_artist(sp_artist_id)
                        if sp_artist:
                            response.genres = sp_artist.get("genres", [])

        # Genius lyrics
        if not isinstance(results[2], Exception) and results[2]:
            response.lyrics = results[2]

        # Last.fm
        if not isinstance(results[3], Exception) and results[3]:
            lfm_data = results[3]
            lfm_track = lfm_data.get("track", {}) if lfm_data else {}
            try:
                response.playcount = int(lfm_track.get("playcount", 0))
            except (ValueError, TypeError):
                pass

            # Get similar tracks from Last.fm
            similar = await self.lastfm.get_similar_tracks(artist_name, track_title)
            response.related_tracks = similar[:10] if similar else []

            # Last.fm tags as genres
            lfm_tags = lfm_track.get("toptags", {}).get("tag", [])
            if lfm_tags and not response.genres:
                response.genres = [t.get("name", "") for t in lfm_tags[:5] if t.get("name")]

        # Step 3: Also fetch similar artists for the artist
        if artist_mbid or artist_name:
            try:
                similar_artists = await self.lastfm.get_similar_artists(
                    artist_name, mbid=artist_mbid, limit=5
                )
                response.artist.similar = similar_artists[:5] if similar_artists else []
            except Exception:
                pass

        return response

    async def get_artist(self, mbid: str) -> UnifiedArtistResponse | None:
        """Get full aggregated artist profile by MusicBrainz artist ID."""
        # Step 1: MusicBrainz artist data
        mb_artist = await self.mb.get_artist(mbid)
        if not mb_artist:
            return None

        artist_name = mb_artist.get("name", "")
        country = mb_artist.get("country", "")

        response = UnifiedArtistResponse(
            name=artist_name,
            mbid=mbid,
        )

        # Step 2: Parallel fetches
        spotify_search = self.spotify.search_artist(artist_name, limit=1)
        lastfm_info = self.lastfm.get_artist_info(artist_name, mbid=mbid)
        lastfm_tags = self.lastfm.get_top_tags(artist_name, mbid=mbid)
        itunes_image = self.itunes.get_artist_image(artist_name)

        results = await asyncio.gather(
            spotify_search, lastfm_info, lastfm_tags, itunes_image,
            return_exceptions=True,
        )

        # Spotify
        spotify_id: str | None = None
        if not isinstance(results[0], Exception) and results[0]:
            sp_data = results[0]
            sp_items = sp_data.get("artists", {}).get("items", [])
            if sp_items:
                sp_artist = sp_items[0]
                spotify_id = sp_artist.get("id")
                response.spotify_id = spotify_id
                response.popularity = sp_artist.get("popularity", 0)
                response.genres = sp_artist.get("genres", [])
                if sp_artist.get("images"):
                    response.image_url = sp_artist["images"][0].get("url")

                # Get top tracks and related artists
                if spotify_id:
                    top_tracks, related = await asyncio.gather(
                        self.spotify.get_artist_top_tracks(spotify_id),
                        self.spotify.get_related_artists(spotify_id),
                        return_exceptions=True,
                    )
                    if not isinstance(top_tracks, Exception):
                        response.top_tracks = top_tracks[:10]
                    if not isinstance(related, Exception):
                        response.similar_artists = related[:10]

        # Last.fm
        if not isinstance(results[1], Exception) and results[1]:
            lfm_data = results[1]
            lfm_artist = lfm_data.get("artist", {}) if lfm_data else {}
            if lfm_artist:
                bio_data = lfm_artist.get("bio", {})
                response.bio = bio_data.get("summary") or bio_data.get("content")
                try:
                    response.playcount = int(lfm_artist.get("stats", {}).get("listeners", 0))
                except (ValueError, TypeError):
                    pass

        if not isinstance(results[2], Exception) and results[2]:
            lfm_tags = results[2]
            response.tags = [
                t.get("name", "") for t in lfm_tags[:10] if t.get("name")
            ]

        # iTunes image fallback
        if not isinstance(results[3], Exception) and results[3] and not response.image_url:
            response.image_url = results[3]

        # If no similar_artists from Spotify, get from Last.fm
        if not response.similar_artists:
            try:
                lfm_similar = await self.lastfm.get_similar_artists(
                    artist_name, mbid=mbid, limit=10
                )
                response.similar_artists = lfm_similar[:10] if lfm_similar else []
            except Exception:
                pass

        return response

    async def get_similar_artists(self, mbid: str, limit: int = 10) -> list[dict[str, Any]]:
        """Get similar artists for a given artist MBID (primarily from Last.fm)."""
        mb_artist = await self.mb.get_artist(mbid)
        if not mb_artist:
            return []

        artist_name = mb_artist.get("name", "")

        # Try Spotify first for related artists
        spotify_data = await self.spotify.search_artist(artist_name, limit=1)
        spotify_id: str | None = None
        if spotify_data:
            sp_items = spotify_data.get("artists", {}).get("items", [])
            if sp_items:
                spotify_id = sp_items[0].get("id")

        if spotify_id:
            related = await self.spotify.get_related_artists(spotify_id)
            if related:
                return related[:limit]

        # Fallback to Last.fm
        lfm_similar = await self.lastfm.get_similar_artists(artist_name, mbid=mbid, limit=limit)
        if lfm_similar:
            return lfm_similar[:limit]

        return []

    async def close(self) -> None:
        """Close the HTTP client."""
        if self._client is not None:
            await self._client.aclose()
            self._client = None
