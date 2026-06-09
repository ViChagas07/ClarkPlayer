"use client";

import { useCallback, useRef, useState } from "react";
import { cn, formatDuration } from "@/lib/utils";

interface SeekBarProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  className?: string;
}

export function SeekBar({ currentTime, duration, onSeek, className }: SeekBarProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragValue, setDragValue] = useState<number | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const progress = duration > 0 ? (isDragging ? dragValue! : currentTime) / duration : 0;

  const getTimeFromPosition = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track || duration === 0) return 0;
      const rect = track.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      return ratio * duration;
    },
    [duration]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      setIsDragging(true);
      setDragValue(getTimeFromPosition(e.clientX));
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [getTimeFromPosition]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      const time = getTimeFromPosition(e.clientX);
      setDragValue(time);
    },
    [isDragging, getTimeFromPosition]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      const time = getTimeFromPosition(e.clientX);
      setIsDragging(false);
      setDragValue(null);
      onSeek(time);
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    },
    [isDragging, getTimeFromPosition, onSeek]
  );

  const displayTime = isDragging ? dragValue ?? currentTime : currentTime;

  return (
    <div className={cn("flex items-center gap-3 w-full", className)}>
      <span className="text-xs text-muted tabular-nums w-10 text-right select-none">
        {formatDuration(displayTime)}
      </span>

      {/* Track */}
      <div
        ref={trackRef}
        role="slider"
        aria-label="Seek"
        aria-valuemin={0}
        aria-valuemax={duration}
        aria-valuenow={displayTime}
        aria-valuetext={formatDuration(displayTime)}
        tabIndex={0}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="relative flex-1 h-6 flex items-center cursor-pointer group"
      >
        {/* Background rail */}
        <div className="absolute inset-x-0 h-1 rounded-full bg-white/10 group-hover:h-1.5 transition-all duration-150" />

        {/* Buffered indicator (static approximation) */}
        <div
          className="absolute h-1 rounded-full bg-white/10"
          style={{ width: "100%" }}
        />

        {/* Progress fill */}
        <div
          className="absolute h-1 rounded-full bg-accent group-hover:h-1.5 transition-all duration-150"
          style={{ width: `${progress * 100}%` }}
        />

        {/* Thumb */}
        <div
          className={cn(
            "absolute w-3 h-3 rounded-full bg-white shadow-md",
            "opacity-0 group-hover:opacity-100 transition-opacity duration-150",
            "top-1/2 -translate-y-1/2 -translate-x-1/2",
            isDragging && "opacity-100"
          )}
          style={{ left: `${progress * 100}%` }}
        />
      </div>

      <span className="text-xs text-muted tabular-nums w-10 select-none">
        {formatDuration(duration)}
      </span>
    </div>
  );
}
