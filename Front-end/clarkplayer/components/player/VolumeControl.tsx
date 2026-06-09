"use client";

import { useCallback, useRef } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

interface VolumeControlProps {
  volume: number; // 0–1
  onSetVolume: (vol: number) => void;
  className?: string;
}

export function VolumeControl({ volume, onSetVolume, className }: VolumeControlProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const getVolFromPosition = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track) return 0;
      const rect = track.getBoundingClientRect();
      return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    },
    []
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      isDragging.current = true;
      onSetVolume(getVolFromPosition(e.clientX));
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [getVolFromPosition, onSetVolume]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging.current) return;
      onSetVolume(getVolFromPosition(e.clientX));
    },
    [getVolFromPosition, onSetVolume]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging.current) return;
      isDragging.current = false;
      onSetVolume(getVolFromPosition(e.clientX));
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    },
    [getVolFromPosition, onSetVolume]
  );

  const muted = volume === 0;
  const low = volume > 0 && volume < 0.5;

  const VolumeIcon = muted ? VolumeX : Volume2;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <button
        aria-label={muted ? "Unmute" : "Mute"}
        onClick={() => onSetVolume(muted ? 0.8 : 0)}
        className="p-1.5 rounded-lg text-muted hover:text-body hover:bg-bg-tertiary transition-all duration-200 cursor-pointer"
      >
        <VolumeIcon size={18} />
      </button>

      <div
        ref={trackRef}
        role="slider"
        aria-label="Volume"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(volume * 100)}
        aria-valuetext={`${Math.round(volume * 100)}%`}
        tabIndex={0}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="relative w-24 h-6 flex items-center cursor-pointer group"
      >
        <div className="absolute inset-x-0 h-1 rounded-full bg-white/10" />
        <div
          className="absolute h-1 rounded-full bg-accent"
          style={{ width: `${volume * 100}%` }}
        />
        <div
          className="absolute w-2.5 h-2.5 rounded-full bg-white shadow opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ left: `calc(${volume * 100}% - 5px)` }}
        />
      </div>

      <span className="text-xs text-muted tabular-nums w-8 select-none">
        {Math.round(volume * 100)}%
      </span>
    </div>
  );
}
