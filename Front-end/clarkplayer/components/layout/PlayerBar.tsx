"use client";

import Image from "next/image";
import { ListMusic } from "lucide-react";
import { usePlayerStore } from "@/store/playerStore";
import { SeekBar } from "@/components/player/SeekBar";
import { VolumeControl } from "@/components/player/VolumeControl";
import { PlaybackControls } from "@/components/player/PlaybackControls";

interface PlayerBarProps {
  onToggleQueue?: () => void;
}

export function PlayerBar({ onToggleQueue }: PlayerBarProps) {
  const {
    currentTrack,
    isPlaying,
    isShuffle,
    repeatMode,
    volume,
    currentTime,
    duration,
    play,
    pause,
    next,
    previous,
    seek,
    setVolume,
    toggleShuffle,
    cycleRepeat,
  } = usePlayerStore();

  if (!currentTrack) return null;

  return (
    <div
      aria-label="Player bar"
      className="fixed bottom-0 left-0 right-0 z-40 bg-bg-secondary border-t border-white/5"
    >
      <div className="flex items-center gap-4 px-4 h-20">
        {/* Track info */}
        <div className="flex items-center gap-3 w-56 min-w-0 flex-shrink-0">
          <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-bg-tertiary">
            {currentTrack.coverArtPath ? (
              <Image
                src={currentTrack.coverArtPath}
                alt={currentTrack.title}
                fill
                className="object-cover"
                sizes="56px"
              />
            ) : (
              <div className="w-full h-full bg-accent/20 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 3.5C3 3.5 6 2 8 4C10 6 13 4.5 13 4.5V11.5C13 11.5 10 10 8 12C6 14 3 12.5 3 12.5V3.5Z" fill="#6366F1" />
                </svg>
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-heading truncate">{currentTrack.title}</p>
            <p className="text-xs text-muted truncate">{currentTrack.artist ?? "—"}</p>
          </div>
        </div>

        {/* Center controls */}
        <div className="flex-1 flex flex-col items-center gap-1 min-w-0 max-w-2xl mx-auto">
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
          />
          <SeekBar
            currentTime={currentTime}
            duration={duration}
            onSeek={seek}
            className="w-full"
          />
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-3 w-56 justify-end flex-shrink-0">
          <VolumeControl
            volume={volume}
            onSetVolume={setVolume}
          />
          <button
            aria-label="Toggle queue"
            onClick={onToggleQueue}
            className="p-1.5 rounded-lg text-muted hover:text-body hover:bg-bg-tertiary transition-all duration-200 cursor-pointer"
          >
            <ListMusic size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
