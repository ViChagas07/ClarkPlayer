/**
 * Core type definitions for ClarkPlayer.
 * Mirrors backend Pydantic schemas + frontend-only UI types.
 */

export interface HealthResponse {
  status: string
  app: string
  version: string
}

export interface UserResponse {
  id: string
  username: string
  email: string
  display_name: string | null
  avatar_url: string | null
  is_active: boolean
  email_verified?: boolean
  provider?: string | null
  provider_id?: string | null
}

export interface TokenResponse {
  access_token: string
  refresh_token?: string
  token_type: string
  expires_in?: number
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  display_name?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LogoutRequest {
  refresh_token?: string
}

export interface LogoutResponse {
  message: string
}

export interface UpdateProfileRequest {
  display_name?: string | null
  avatar_url?: string | null
}

export interface AvatarUploadResponse {
  avatar_url: string
}

export interface GoogleCallbackRequest {
  code: string
  redirect_uri?: string
}

export interface GoogleCallbackResponse {
  access_token: string
  refresh_token?: string
  token_type: string
  user: UserResponse
}

// Email verification types
export interface VerifyEmailRequest {
  token: string
}

export interface VerifyEmailResponse {
  message: string
}

export interface ResendVerificationRequest {
  email: string
}

export interface ResendVerificationResponse {
  message: string
}

// Password reset types
export interface ForgotPasswordRequest {
  email: string
}

export interface ForgotPasswordResponse {
  message: string
}

export interface ResetPasswordRequest {
  token: string
  new_password: string
}

export interface ResetPasswordResponse {
  message: string
}

export interface TrackResponse {
  id: string
  title: string
  artist: string | null
  album: string | null
  genre: string | null
  year: number | null
  duration: number | null
  file_size: number
  file_format: string
  cover_art_path: string | null
  play_count: number
  last_played_at: string | null
  is_favorite: boolean
  created_at: string
  updated_at: string
}

export interface TrackListResponse {
  items: TrackResponse[]
  total: number
  offset: number
  limit: number
}

export interface PlaylistResponse {
  id: string
  name: string
  description: string | null
  visibility: string
  cover_art_path: string | null
  track_count: number
  created_at: string
  updated_at: string
}

// ── Frontend-only UI types ────────────────────────────────────────

export interface Track {
  id: string
  title: string
  artist: string
  album: string
  duration: number
  format: 'FLAC' | 'MP3' | 'WAV' | 'AAC' | 'OGG' | 'M4A' | 'OPUS' | 'WMA' | 'MIDI' | 'AIFF'
  coverUrl?: string
  previewUrl?: string | null
  isPreview?: boolean
  year?: number
  genre?: string
  playCount?: number
  isFavorite?: boolean
  addedAt?: string
}

export interface Playlist {
  id: string
  name: string
  description?: string
  coverUrl?: string
  isPrivate: boolean
  isCollaborative: boolean
  collaborators: UserProfile[]
  tracks: Track[]
  createdAt: string
  updatedAt: string
  playCount: number
  totalDuration: number
}

export interface Artist {
  id: string
  name: string
  avatarUrl?: string
  bio?: string
  isVerified: boolean
  albumCount: number
  genres: string[]
}

export interface Genre {
  slug: string
  name: string
  trackCount: number
  gradientFrom: string
  gradientTo: string
  coverUrl?: string
}

export interface UserProfile {
  id: string
  displayName: string
  email: string
  avatarUrl?: string
  tier: 'free' | 'pro'
  createdAt: string
}

export interface LyricLine {
  timestamp: number
  text: string
}

export interface Toast {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
  action?: { label: string; onClick: () => void }
}

export interface PlayerState {
  currentTrack: Track | null
  isPlaying: boolean
  isPreview: boolean
  queue: Track[]
  queueIndex: number
  progress: number
  volume: number
  isShuffled: boolean
  repeatMode: 'off' | 'all' | 'one'
  isPlayerVisible: boolean
  setCurrentTrack: (track: Track) => void
  togglePlay: () => void
  setQueue: (tracks: Track[], startIndex?: number) => void
  nextTrack: () => void
  prevTrack: () => void
  setProgress: (progress: number) => void
  setVolume: (volume: number) => void
  toggleShuffle: () => void
  toggleRepeat: () => void
  setPlayerVisible: (visible: boolean) => void
  playPreview: (url: string, track: Track) => void
  stopPreview: () => void
}

// ── Music Metadata API Types ────────────────────────────────────────

export interface MusicTrackInfo {
  title: string
  duration: number | null
  mbid: string | null
  spotify_id: string | null
  preview_url: string | null
}

export interface MusicArtistInfo {
  name: string
  bio: string | null
  mbid: string | null
  spotify_id: string | null
  image_url: string | null
  similar: Array<{ name: string; mbid?: string; image?: Array<{ '#text': string }> }>
  tags: string[]
}

export interface MusicAlbumInfo {
  title: string
  cover_url: string | null
  release_date: string | null
  country: string | null
  mbid: string | null
}

export interface MusicAudioFeatures {
  bpm: number | null
  energy: number | null
  danceability: number | null
  key: number | null
  valence: number | null
  acousticness: number | null
  instrumentalness: number | null
  liveness: number | null
  speechiness: number | null
  loudness: number | null
}

export interface UnifiedSearchResult {
  type: 'track' | 'artist'
  track: MusicTrackInfo | null
  artist: MusicArtistInfo | null
  album: MusicAlbumInfo | null
  audio_features: MusicAudioFeatures | null
  popularity: number
  playcount: number
  genres: string[]
  cover_url: string | null
}

export interface UnifiedSearchResponse {
  query: string
  tracks: UnifiedSearchResult[]
  artists: UnifiedSearchResult[]
  total_tracks: number
  total_artists: number
}

export interface UnifiedTrackResponse {
  track: MusicTrackInfo
  artist: MusicArtistInfo
  album: MusicAlbumInfo
  audio_features: MusicAudioFeatures
  popularity: number
  playcount: number
  lyrics: string | null
  genres: string[]
  related_tracks: Array<{
    name: string
    artist: { name: string }
    mbid?: string
    playcount?: string
  }>
}

export interface UnifiedArtistResponse {
  name: string
  bio: string | null
  mbid: string | null
  spotify_id: string | null
  image_url: string | null
  genres: string[]
  popularity: number
  playcount: number
  similar_artists: Array<{
    name: string
    id?: string
    mbid?: string
    images?: Array<{ url: string }>
  }>
  top_tracks: Array<{
    name: string
    id?: string
    album?: { name: string; images?: Array<{ url: string }> }
    artists?: Array<{ name: string }>
    duration_ms?: number
    popularity?: number
    preview_url?: string | null
  }>
  albums: Array<Record<string, unknown>>
  tags: string[]
}

export interface SimilarArtistsResponse {
  mbid: string
  similar: Array<{
    name: string
    mbid?: string
    image?: Array<{ '#text': string }>
    url?: string
  }>
  total: number
}

// ── Catalog Types ─────────────────────────────────────────────────────

export interface CatalogTrackItem {
  id: string
  title: string
  artist_name: string
  album_name: string | null
  cover_url: string | null
  preview_url: string | null
  duration: number | null
  genres: string[]
  popularity: number
  playcount: number
}

export interface CatalogArtistItem {
  id: string
  name: string
  image_url: string | null
  genres: string[]
  bio: string | null
  popularity: number
  track_count: number
  album_count: number
}

export interface CatalogAlbumItem {
  id: string
  title: string
  artist_name: string
  cover_url: string | null
  release_date: string | null
  track_count: number
  genres: string[]
}

export interface CatalogGenreItem {
  id: string
  name: string
  slug: string
  cover_url: string | null
  track_count: number
}

export interface CatalogDiscoverySection {
  genre: string
  label: string
  items: CatalogTrackItem[]
}

export interface CatalogDiscoveryResponse {
  top_artists: CatalogArtistItem[]
  trending_tracks: CatalogTrackItem[]
  featured_albums: CatalogAlbumItem[]
  popular_genres: CatalogGenreItem[]
  brazilian_artists: CatalogArtistItem[]
  international_artists: CatalogArtistItem[]
  sections: CatalogDiscoverySection[]
}

export interface CatalogSearchResult {
  id: string
  type: 'track' | 'artist' | 'album'
  title: string
  artist_name: string | null
  cover_url: string | null
}

export interface CatalogSearchResponse {
  query: string
  results: CatalogSearchResult[]
  total: number
  offset: number
  limit: number
}

export interface CatalogArtistResponse {
  artist: CatalogArtistItem
  top_tracks: CatalogTrackItem[]
  albums: CatalogAlbumItem[]
  similar: CatalogArtistItem[]
}

export interface CatalogAlbumResponse {
  album: CatalogAlbumItem
  tracks: CatalogTrackItem[]
  artist: CatalogArtistItem | null
}

export interface CatalogTrackResponse {
  track: CatalogTrackItem
  artist: CatalogArtistItem | null
  album: CatalogAlbumItem | null
}

export interface CatalogListResponse<T> {
  items: T[]
  total: number
  offset: number
  limit: number
}

export interface CatalogAutocompleteItem {
  id: string
  type: 'track' | 'artist' | 'album'
  name: string
  artist_name?: string
}

export interface CatalogAutocompleteResponse {
  query: string
  results: CatalogAutocompleteItem[]
}
