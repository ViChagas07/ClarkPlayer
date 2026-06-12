import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Playlist, Track } from '@/types'

/// Zustand store for managing user playlists, including creating, deleting, renaming playlists, and adding/removing/reordering tracks within 
// playlists.
interface PlaylistState {
  playlists: Playlist[]
  createPlaylist: (data: { name: string; description?: string; isPrivate: boolean; coverUrl?: string }) => void
  deletePlaylist: (id: string) => void
  renamePlaylist: (id: string, name: string) => void
  addTrackToPlaylist: (playlistId: string, track: Track) => void
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void
  reorderTracks: (playlistId: string, fromIndex: number, toIndex: number) => void
}

/// Create the playlist store using Zustand with persistence so that playlists are saved even if the page reloads
export const usePlaylistStore = create<PlaylistState>()(
  persist(
    (set) => ({
      playlists: [],

      createPlaylist: (data) =>
        set((state) => {
          const newPlaylist: Playlist = {
            id: crypto.randomUUID(),
            name: data.name,
            description: data.description,
            isPrivate: data.isPrivate,
            isCollaborative: false,
            coverUrl: data.coverUrl,
            collaborators: [],
            tracks: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            playCount: 0,
            totalDuration: 0,
          }
          return { playlists: [...state.playlists, newPlaylist] }
        }),

      deletePlaylist: (id) =>
        set((state) => ({
          playlists: state.playlists.filter((p) => p.id !== id),
        })),

      renamePlaylist: (id, name) =>
        set((state) => ({
          playlists: state.playlists.map((p) =>
            p.id === id ? { ...p, name, updatedAt: new Date().toISOString() } : p,
          ),
        })),

      addTrackToPlaylist: (playlistId, track) =>
        set((state) => ({
          playlists: state.playlists.map((p) => {
            if (p.id !== playlistId) return p
            const exists = p.tracks.some((t) => t.id === track.id)
            if (exists) return p
            return {
              ...p,
              tracks: [...p.tracks, track],
              totalDuration: p.totalDuration + track.duration,
              updatedAt: new Date().toISOString(),
            }
          }),
        })),

      removeTrackFromPlaylist: (playlistId, trackId) =>
        set((state) => ({
          playlists: state.playlists.map((p) => {
            if (p.id !== playlistId) return p
            const track = p.tracks.find((t) => t.id === trackId)
            return {
              ...p,
              tracks: p.tracks.filter((t) => t.id !== trackId),
              totalDuration: p.totalDuration - (track?.duration ?? 0),
              updatedAt: new Date().toISOString(),
            }
          }),
        })),

      reorderTracks: (playlistId, fromIndex, toIndex) =>
        set((state) => ({
          playlists: state.playlists.map((p) => {
            if (p.id !== playlistId) return p
            const tracks = [...p.tracks]
            const [moved] = tracks.splice(fromIndex, 1)
            tracks.splice(toIndex, 0, moved)
            return { ...p, tracks, updatedAt: new Date().toISOString() }
          }),
        })),
    }),
    {
      name: 'clark_playlists',
    },
  ),
)
