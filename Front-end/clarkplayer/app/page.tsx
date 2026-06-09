"use client";

import { useState } from "react";
import Image from "next/image";
import { ListMusic, Mic } from "lucide-react";
import { usePlayerStore } from "@/store/playerStore";
import { Drawer } from "@/components/ui/Drawer";
import { SeekBar } from "@/components/player/SeekBar";
import { VolumeControl } from "@/components/player/VolumeControl";
import { PlaybackControls } from "@/components/player/PlaybackControls";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const {
    currentTrack,
    isPlaying,
    isShuffle,
    repeatMode,
    volume,
    currentTime,
    duration,
    queue,
    play,
    pause,
    next,
    previous,
    seek,
    setVolume,
    toggleShuffle,
    cycleRepeat,
    togglePlay,
  } = usePlayerStore();

  const [queueOpen, setQueueOpen] = useState(false);
  const [lyricsOpen, setLyricsOpen] = useState(false);

  if (!currentTrack) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <EmptyState
          heading="Nothing playing"
          subtext="Choose a track from your library to start listening."
          icon={
            <svg width="64" height="64" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 3.5C3 3.5 6 2 8 4C10 6 13 4.5 13 4.5V11.5C13 11.5 10 10 8 12C6 14 3 12.5 3 12.5V3.5Z" fill="currentColor" opacity="0.4" />
            </svg>
          }
        />
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-5rem)] flex flex-col">
      {/* ── Full-screen hero background ─────────────────────────────────── */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {currentTrack.coverArtPath ? (
          <div
            className="absolute inset-0 bg-cover bg-center pointer-events-none"
            style={{ backgroundImage: `url(${currentTrack.coverArtPath})` }}
            aria-hidden="true"
          />
        ) : (
          <div
            className="absolute inset-0 bg-gradient-to-b from-indigo-900/40 via-bg-primary to-bg-primary pointer-events-none"
            aria-hidden="true"
          />
        )}

        <div
          className="absolute inset-0 bg-gradient-to-b from-transparent via-bg-primary/70 to-bg-primary pointer-events-none"
          aria-hidden="true"
        />
      </div>

      {/* ── Main content ─────────────────────────────────────────────── */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-16 min-h-[calc(100vh-5rem)]">
        {/* Album art */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 mb-8 flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
          {currentTrack.coverArtPath ? (
            <Image
              src={currentTrack.coverArtPath}
              alt={currentTrack.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 640px) 256px, (max-width: 768px) 288px, 320px"
            />
          ) : (
            <div className="w-full h-full bg-bg-tertiary flex items-center justify-center">
              <svg width="80" height="80" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 3.5C3 3.5 6 2 8 4C10 6 13 4.5 13 4.5V11.5C13 11.5 10 10 8 12C6 14 3 12.5 3 12.5V3.5Z" fill="#6366F1" />
              </svg>
            </div>
          )}
        </div>

        {/* Track info */}
        <div className="text-center mb-8 max-w-lg">
          <h1
            className="text-3xl sm:text-4xl font-bold text-heading tracking-tight mb-2"
            aria-live="polite"
          >
            {currentTrack.title}
          </h1>
          <p className="text-base text-body/80">
            {currentTrack.artist ?? "Unknown Artist"}
          </p>
          {currentTrack.album && (
            <p className="text-sm text-muted mt-1">{currentTrack.album}</p>
          )}
        </div>

        {/* Playback controls */}
        <div className="w-full max-w-lg mb-6">
          <PlaybackControls
            isPlaying={isPlaying}
            isShuffle={isShuffle}
            repeatMode={repeatMode}
            onPlay={play}
            onPause={pause}
            onNext={next}
            onPrevious={previous}
            onToggleShuffle={toggleShuffle}
            onCycleRepeat={cycleRepeat}
            className="mb-4"
          />

          <SeekBar
            currentTime={currentTime}
            duration={duration}
            onSeek={seek}
          />
        </div>

        {/* Volume + side buttons */}
        <div className="w-full max-w-lg flex items-center justify-between gap-4">
          <VolumeControl
            volume={volume}
            onSetVolume={setVolume}
          />

          <div className="flex items-center gap-2">
            <button
              aria-label="Toggle lyrics panel"
              onClick={() => setLyricsOpen((v) => !v)}
              className={cn(
                "p-2 rounded-lg transition-all duration-200 cursor-pointer",
                lyricsOpen
                  ? "text-accent bg-accent/10"
                  : "text-muted hover:text-body hover:bg-bg-tertiary"
              )}
            >
              <Mic size={18} />
            </button>
            <button
              aria-label="Toggle queue panel"
              onClick={() => setQueueOpen((v) => !v)}
              className={cn(
                "p-2 rounded-lg transition-all duration-200 cursor-pointer",
                queueOpen
                  ? "text-accent bg-accent/10"
                  : "text-muted hover:text-body hover:bg-bg-tertiary"
              )}
            >
              <ListMusic size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Queue Drawer ─────────────────────────────────────────────── */}
      <Drawer
        isOpen={queueOpen}
        onClose={() => setQueueOpen(false)}
        side="right"
        title={`Queue (${queue.length})`}
      >
        {queue.length === 0 ? (
          <p className="text-sm text-muted text-center py-8">Queue is empty.</p>
        ) : (
          <ul aria-label="Playback queue" className="space-y-1">
            {queue.map((track, idx) => {
              const isCurrent = track.id === currentTrack.id;
              return (
                <li
                  key={track.id}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm",
                    isCurrent
                      ? "bg-accent/10 text-accent"
                      : "text-muted hover:text-body hover:bg-bg-tertiary"
                  )}
                >
                  <span className="w-5 text-center text-xs tabular-nums flex-shrink-0">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">{track.title}</p>
                    <p className="text-xs truncate">{track.artist ?? "—"}</p>
                  </div>
                  {isCurrent && isPlaying && (
                    <div className="flex-shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Drawer>

      {/* ── Lyrics Drawer ───────────────────────────────────────────── */}
      <Drawer
        isOpen={lyricsOpen}
        onClose={() => setLyricsOpen(false)}
        side="left"
        title="Lyrics"
      >
        <div className="text-center py-12">
          <Mic size={40} className="mx-auto text-muted opacity-30 mb-4" />
          <p className="text-sm text-muted">Lyrics not available for this track.</p>
        </div>
      </Drawer>
    </div>
  );
}
