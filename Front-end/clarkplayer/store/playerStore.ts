import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PlayerStore, RepeatMode, Track } from "@/types";

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set, get) => ({
      // ── State ──────────────────────────────────────────────────
      currentTrack: null,
      queue: [],
      isPlaying: false,
      isShuffle: false,
      repeatMode: "none",
      volume: 0.8,
      currentTime: 0,
      duration: 0,

      // ── Playback controls ───────────────────────────────────────
      play: () => set({ isPlaying: true }),
      pause: () => set({ isPlaying: false }),
      togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),

      next: () => {
        const { queue, currentTrack, isShuffle, repeatMode } = get();
        if (!queue.length || !currentTrack) return;

        const currentIndex = queue.findIndex((t) => t.id === currentTrack.id);

        if (repeatMode === "one") {
          // handled at consumer level via seek(0)
          set({ currentTime: 0 });
          return;
        }

        let nextIndex: number;
        if (isShuffle) {
          // Pick a random track that isn't the current one
          const others = queue.filter((t) => t.id !== currentTrack.id);
          if (!others.length) return;
          nextIndex = queue.indexOf(others[Math.floor(Math.random() * others.length)]);
        } else {
          nextIndex = currentIndex + 1;
          if (nextIndex >= queue.length) {
            if (repeatMode === "all") {
              nextIndex = 0;
            } else {
              set({ isPlaying: false });
              return;
            }
          }
        }

        const nextTrack = queue[nextIndex];
        set({
          currentTrack: nextTrack,
          currentTime: 0,
          duration: nextTrack.duration ?? 0,
          isPlaying: true,
        });
      },

      previous: () => {
        const { queue, currentTrack, currentTime, repeatMode } = get();
        if (!queue.length || !currentTrack) return;

        // If more than 3 seconds in, restart current track
        if (currentTime > 3) {
          set({ currentTime: 0 });
          return;
        }

        const currentIndex = queue.findIndex((t) => t.id === currentTrack.id);
        let prevIndex = currentIndex - 1;
        if (prevIndex < 0) {
          prevIndex = repeatMode === "all" ? queue.length - 1 : 0;
        }

        const prevTrack = queue[prevIndex];
        set({
          currentTrack: prevTrack,
          currentTime: 0,
          duration: prevTrack.duration ?? 0,
          isPlaying: true,
        });
      },

      seek: (time: number) => {
        const { duration } = get();
        const clamped = Math.min(Math.max(time, 0), duration);
        set({ currentTime: clamped });
      },

      setVolume: (vol: number) => {
        const clamped = Math.min(Math.max(vol, 0), 1);
        set({ volume: clamped });
      },

      toggleShuffle: () => set((s) => ({ isShuffle: !s.isShuffle })),

      cycleRepeat: () => {
        const order: RepeatMode[] = ["none", "all", "one"];
        const current = get().repeatMode;
        const nextIndex = (order.indexOf(current) + 1) % order.length;
        set({ repeatMode: order[nextIndex] });
      },

      // ── Queue management ────────────────────────────────────────
      setQueue: (tracks: Track[], startIndex = 0) => {
        const track = tracks[startIndex] ?? null;
        set({
          queue: tracks,
          currentTrack: track,
          currentTime: 0,
          duration: track?.duration ?? 0,
          isPlaying: track !== null,
        });
      },

      addToQueue: (track: Track) =>
        set((s) => ({ queue: [...s.queue, track] })),

      removeFromQueue: (trackId: string) =>
        set((s) => ({
          queue: s.queue.filter((t) => t.id !== trackId),
          // If removed track is current, advance to next
          currentTrack:
            s.currentTrack?.id === trackId
              ? s.queue.find((t) => t.id !== trackId) ?? null
              : s.currentTrack,
        })),

      clearQueue: () =>
        set({ queue: [], currentTrack: null, isPlaying: false, currentTime: 0, duration: 0 }),

      playTrack: (track: Track) =>
        set({
          currentTrack: track,
          currentTime: 0,
          duration: track.duration ?? 0,
          isPlaying: true,
        }),
    }),
    {
      name: "clarkplayer-player",
      partialize: (s) => ({
        volume: s.volume,
        isShuffle: s.isShuffle,
        repeatMode: s.repeatMode,
        // Persist queue only if small (avoid localStorage bloat)
        queue: s.queue.length < 500 ? s.queue : s.queue.slice(0, 500),
      }),
    }
  )
);
