import { create } from 'zustand'
import type { Track, PlayerState } from '@/types'

/// Zustand store for managing music player state, including current track, playback status, queue, and settings like shuffle and repeat modes.
export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentTrack: null,
  isPlaying: false,
  queue: [],
  queueIndex: -1,
  progress: 0,
  volume: 0.8,
  isShuffled: false,
  repeatMode: 'off',
  isPlayerVisible: true,

// Action to set the current track and start playing it, also resets progress to 0
  setCurrentTrack: (track: Track) => {
    set({ currentTrack: track, isPlaying: true, progress: 0 })
  },

  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

  setQueue: (tracks: Track[], startIndex = 0) => {
    set({
      queue: tracks,
      queueIndex: startIndex,
      currentTrack: tracks[startIndex] ?? null,
      isPlaying: true,
      progress: 0,
    })
  },

  nextTrack: () => {
    const { queue, queueIndex, isShuffled, repeatMode } = get()
    if (queue.length === 0) return

    let nextIndex: number
    if (isShuffled) {
      nextIndex = Math.floor(Math.random() * queue.length)
    } else {
      nextIndex = queueIndex + 1
      if (nextIndex >= queue.length) {
        nextIndex = repeatMode === 'all' ? 0 : queueIndex
      }
    }

    set({
      queueIndex: nextIndex,
      currentTrack: queue[nextIndex] ?? null,
      progress: 0,
    })
  },

  prevTrack: () => {
    const { queue, queueIndex, progress } = get()
    if (queue.length === 0) return

    if (progress > 3) {
      set({ progress: 0 })
      return
    }

    const prevIndex = queueIndex - 1
    if (prevIndex < 0) return

    set({
      queueIndex: prevIndex,
      currentTrack: queue[prevIndex] ?? null,
      progress: 0,
    })
  },

  setProgress: (progress: number) => set({ progress }),
  setVolume: (volume: number) => set({ volume }),

  toggleShuffle: () => set((state) => ({ isShuffled: !state.isShuffled })),

  toggleRepeat: () =>
    set((state) => ({
      repeatMode:
        state.repeatMode === 'off' ? 'all' : state.repeatMode === 'all' ? 'one' : 'off',
    })),

  setPlayerVisible: (visible: boolean) => set({ isPlayerVisible: visible }),
}))
