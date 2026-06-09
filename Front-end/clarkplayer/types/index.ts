// ── Core domain types ──────────────────────────────────────────────────────────

export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  isActive: boolean;
}

export type AudioFormat =
  | "mp3"
  | "flac"
  | "wav"
  | "aac"
  | "ogg"
  | "wma"
  | "m4a"
  | "opus";

export interface Track {
  id: string;
  title: string;
  artist: string | null;
  album: string | null;
  genre: string | null;
  year: number | null;
  duration: number | null; // seconds
  fileSize: number; // bytes
  fileFormat: AudioFormat;
  coverArtPath: string | null;
  playCount: number;
  lastPlayedAt: string | null; // ISO datetime
  isFavorite: boolean;
  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
}

export type PlaylistVisibility = "private" | "public" | "unlisted";

export interface Playlist {
  id: string;
  name: string;
  description: string | null;
  coverArtPath: string | null;
  visibility: PlaylistVisibility;
  trackCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Album {
  id: string;
  name: string;
  artist: string;
  year: number | null;
  coverArtPath: string | null;
  trackCount: number;
  duration: number | null; // total seconds
}

export interface Artist {
  id: string;
  name: string;
  avatarUrl: string | null;
  trackCount: number;
  albumCount: number;
}

// ── API response types ────────────────────────────────────────────────────────

export interface TokenResponse {
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
}

export interface PaginatedTracks {
  items: Track[];
  total: number;
  offset: number;
  limit: number;
}

// ── Player state types ───────────────────────────────────────────────────────

export type RepeatMode = "none" | "one" | "all";

export interface PlayerState {
  currentTrack: Track | null;
  queue: Track[];
  isPlaying: boolean;
  isShuffle: boolean;
  repeatMode: RepeatMode;
  volume: number; // 0–1
  currentTime: number; // seconds
  duration: number; // seconds
}

export interface PlayerActions {
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  next: () => void;
  previous: () => void;
  seek: (time: number) => void;
  setVolume: (vol: number) => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  setQueue: (tracks: Track[], startIndex?: number) => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (trackId: string) => void;
  clearQueue: () => void;
  playTrack: (track: Track) => void;
}

export type PlayerStore = PlayerState & PlayerActions;

// ── UI state types ─────────────────────────────────────────────────────────────

export interface ContextMenuState {
  isOpen: boolean;
  x: number;
  y: number;
  trackId: string | null;
}

export interface DrawerState {
  isOpen: boolean;
  side: "left" | "right";
}

// ── Settings types ────────────────────────────────────────────────────────────

export interface PlaybackSettings {
  equalizerPreset: string;
  crossfade: boolean;
  crossfadeDuration: number; // seconds
  gaplessPlayback: boolean;
}

export interface LibrarySettings {
  scanFolders: string[];
  fileTypes: AudioFormat[];
}

export type AccentColor = "indigo" | "violet" | "blue" | "emerald" | "rose";

export interface AppearanceSettings {
  theme: "dark" | "light" | "system";
  accentColor: AccentColor;
}

export interface AppSettings {
  playback: PlaybackSettings;
  library: LibrarySettings;
  appearance: AppearanceSettings;
}
