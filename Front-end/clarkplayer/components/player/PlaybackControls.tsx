"use client";

import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { RepeatMode } from "@/types";

interface PlaybackControlsProps {
  isPlaying: boolean;
  isShuffle: boolean;
  repeatMode: RepeatMode;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onToggleShuffle: () => void;
  onCycleRepeat: () => void;
  className?: string;
}

export function PlaybackControls({
  isPlaying,
  isShuffle,
  repeatMode,
  onPlay,
  onPause,
  onNext,
  onPrevious,
  onToggleShuffle,
  onCycleRepeat,
  className,
}: PlaybackControlsProps) {
  return (
    <div className={cn("flex items-center justify-center gap-4", className)}>
      {/* Shuffle */}
      <button
        aria-label={isShuffle ? "Disable shuffle" : "Enable shuffle"}
        onClick={onToggleShuffle}
        className={cn(
          "p-2 rounded-lg transition-all duration-200 cursor-pointer",
          isShuffle
            ? "text-accent hover:bg-accent/10"
            : "text-muted hover:text-body hover:bg-bg-tertiary"
        )}
      >
        <Shuffle size={18} />
      </button>

      {/* Previous */}
      <button
        aria-label="Previous track"
        onClick={onPrevious}
        className="p-2 rounded-lg text-muted hover:text-body hover:bg-bg-tertiary transition-all duration-200 cursor-pointer"
      >
        <SkipBack size={20} fill="currentColor" />
      </button>

      {/* Play / Pause */}
      <button
        aria-label={isPlaying ? "Pause" : "Play"}
        onClick={isPlaying ? onPause : onPlay}
        className={cn(
          "p-3 rounded-full bg-accent hover:bg-accent-hover",
          "text-white transition-all duration-200 cursor-pointer",
          "flex items-center justify-center"
        )}
      >
        {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
      </button>

      {/* Next */}
      <button
        aria-label="Next track"
        onClick={onNext}
        className="p-2 rounded-lg text-muted hover:text-body hover:bg-bg-tertiary transition-all duration-200 cursor-pointer"
      >
        <SkipForward size={20} fill="currentColor" />
      </button>

      {/* Repeat */}
      <button
        aria-label={
          repeatMode === "none"
            ? "Enable repeat all"
            : repeatMode === "all"
            ? "Enable repeat one"
            : "Disable repeat"
        }
        onClick={onCycleRepeat}
        className={cn(
          "p-2 rounded-lg transition-all duration-200 cursor-pointer",
          repeatMode !== "none"
            ? "text-accent hover:bg-accent/10"
            : "text-muted hover:text-body hover:bg-bg-tertiary"
        )}
      >
        {repeatMode === "one" ? <Repeat1 size={18} /> : <Repeat size={18} />}
      </button>
    </div>
  );
}
