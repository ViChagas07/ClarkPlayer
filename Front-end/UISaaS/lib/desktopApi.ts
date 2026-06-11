/**
 * ClarkPlayer Desktop — Tauri IPC Bindings
 *
 * Type-safe wrappers around all Rust backend commands.
 * Provides the same interface whether running in Tauri or browser (graceful degradation).
 */

// ── Types ────────────────────────────────────────────────────────────────────

export interface MusicFolder {
  id: string
  path: string
  label: string
  added_at: string
}

export interface LibraryTrack {
  id: string
  path: string
  title: string
  artist: string
  album: string
  album_artist: string
  genre: string
  year: number
  track_number: number
  disc_number: number
  duration_seconds: number
  file_size: number
  file_format: string
  has_embedded_art: boolean
  sample_rate: number | null
  bitrate: number | null
  channels: number | null
  play_count: number
  is_favorite: boolean
  added_at: string
  last_played_at: string | null
}

export interface ScanProgress {
  current: number
  total: number
  current_file: string
}

export interface AlbumArtData {
  mime_type: string
  data_base64: string
}

export interface TrackQuery {
  search?: string
  artist?: string
  album?: string
  genre?: string
  sort_by?: string
  sort_dir?: string
  limit?: number
  offset?: number
}

// ── Tauri Detection ──────────────────────────────────────────────────────────

export function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window
}

// ── IPC Helpers ──────────────────────────────────────────────────────────────

async function invoke<T>(command: string, args?: Record<string, unknown>): Promise<T> {
  if (!isTauri()) {
    throw new Error(`Tauri command '${command}' not available in browser mode`)
  }
  const { invoke: tauriInvoke } = await import('@tauri-apps/api/core')
  return tauriInvoke<T>(command, args)
}

async function listen<T>(event: string, callback: (payload: T) => void): Promise<() => void> {
  if (!isTauri()) {
    return () => {}
  }
  const { listen: tauriListen } = await import('@tauri-apps/api/event')
  const unlisten = await tauriListen<T>(event, (e) => callback(e.payload))
  return unlisten
}

// ── Database ─────────────────────────────────────────────────────────────────

export async function initDatabase(): Promise<string> {
  return invoke<string>('init_app_db')
}

// ── Music Folders ────────────────────────────────────────────────────────────

export async function addMusicFolder(path: string, label: string): Promise<MusicFolder> {
  return invoke<MusicFolder>('add_music_folder', { path, label })
}

export async function removeMusicFolder(folderId: string): Promise<void> {
  return invoke<void>('remove_music_folder', { folderId })
}

export async function getMusicFolders(): Promise<MusicFolder[]> {
  return invoke<MusicFolder[]>('get_music_folders')
}

// ── Library ──────────────────────────────────────────────────────────────────

export async function scanFolders(): Promise<LibraryTrack[]> {
  return invoke<LibraryTrack[]>('scan_folders')
}

export async function getLibraryTracks(query: TrackQuery = {}): Promise<LibraryTrack[]> {
  return invoke<LibraryTrack[]>('get_library_tracks', {
    search: query.search ?? null,
    artist: query.artist ?? null,
    album: query.album ?? null,
    genre: query.genre ?? null,
    sortBy: query.sort_by ?? null,
    sortDir: query.sort_dir ?? null,
    limit: query.limit ?? 500,
    offset: query.offset ?? 0,
  })
}

// ── Album Art ────────────────────────────────────────────────────────────────

export async function getAlbumArt(trackId: string): Promise<AlbumArtData | null> {
  return invoke<AlbumArtData | null>('get_album_art', { trackId })
}

// ── Playback History ─────────────────────────────────────────────────────────

export async function recordPlay(trackId: string): Promise<void> {
  return invoke<void>('record_play', { trackId })
}

export async function toggleFavorite(trackId: string): Promise<boolean> {
  return invoke<boolean>('toggle_favorite', { trackId })
}

export async function getRecentlyPlayed(limit?: number): Promise<LibraryTrack[]> {
  return invoke<LibraryTrack[]>('get_recently_played', { limit: limit ?? 20 })
}

// ── Audio File Access ────────────────────────────────────────────────────────

export async function readAudioFile(trackId: string): Promise<Uint8Array> {
  if (!isTauri()) {
    throw new Error('Direct file access requires Tauri desktop')
  }
  const { invoke: tauriInvoke } = await import('@tauri-apps/api/core')
  const bytes: number[] = await tauriInvoke<number[]>('read_audio_file', { trackId })
  return new Uint8Array(bytes)
}

// ── Folder Monitoring ────────────────────────────────────────────────────────

export async function startFolderWatching(): Promise<void> {
  return invoke<void>('start_folder_watching')
}

export async function stopFolderWatching(): Promise<void> {
  return invoke<void>('stop_folder_watching')
}

export function onScanProgress(callback: (progress: ScanProgress) => void): () => void {
  let unlisten: (() => void) | null = null
  listen<ScanProgress>('scan-progress', callback).then((fn) => { unlisten = fn })
  return () => { unlisten?.() }
}

export function onScanComplete(callback: (data: { new_tracks: number }) => void): () => void {
  let unlisten: (() => void) | null = null
  listen<{ new_tracks: number }>('scan-complete', callback).then((fn) => { unlisten = fn })
  return () => { unlisten?.() }
}

export function onFilesystemChange(
  callback: (data: { kind: string; paths: string[] }) => void,
): () => void {
  let unlisten: (() => void) | null = null
  listen<{ kind: string; paths: string[] }>('filesystem-change', callback).then(
    (fn) => { unlisten = fn },
  )
  return () => { unlisten?.() }
}

// ── Dialog (native folder picker) ────────────────────────────────────────────

export async function pickMusicFolder(): Promise<string | null> {
  if (!isTauri()) return null
  const { open } = await import('@tauri-apps/plugin-dialog')
  const selected = await open({ directory: true, multiple: false, title: 'Select Music Folder' })
  return selected as string | null
}
