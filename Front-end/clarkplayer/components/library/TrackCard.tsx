"use client";

import { memo } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import type { Track } from "@/types";
import { formatDuration } from "@/lib/utils";

interface TrackCardProps {
  track: Track;
  index?: number;
  view?: "grid" | "list";
  onPlay?: (track: Track) => void;
  onAddToQueue?: (track: Track) => void;
  onDelete?: (track: Track) => void;
}

export const TrackCard = memo(function TrackCard({
  track,
  index,
  view = "grid",
  onPlay,
}: TrackCardProps) {
  if (view === "list") {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={() => onPlay?.(track)}
        onKeyDown={(e) => e.key === "Enter" && onPlay?.(track)}
        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-bg-tertiary transition-all duration-200 cursor-pointer group"
      >
        {index !== undefined && (
          <span className="w-6 text-center text-sm text-muted tabular-nums flex-shrink-0 group-hover:hidden">
            {index + 1}
          </span>
        )}
        <span className="hidden group-hover:block w-6 text-center text-sm text-muted flex-shrink-0">
          <Play size={14} fill="currentColor" />
        </span>

        <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-bg-tertiary">
          {track.coverArtPath ? (
            <Image
              src={track.coverArtPath}
              alt={track.title}
              fill
              className="object-cover"
              sizes="40px"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-accent/20 flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 3.5C3 3.5 6 2 8 4C10 6 13 4.5 13 4.5V11.5C13 11.5 10 10 8 12C6 14 3 12.5 3 12.5V3.5Z" fill="#6366F1" />
              </svg>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-heading truncate">{track.title}</p>
          <p className="text-xs text-muted truncate">{track.artist ?? "—"}</p>
        </div>

        <span className="text-xs text-muted tabular-nums flex-shrink-0">
          {formatDuration(track.duration)}
        </span>
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onPlay?.(track)}
      onKeyDown={(e) => e.key === "Enter" && onPlay?.(track)}
      className="flex items-center gap-3 p-3 rounded-xl bg-bg-tertiary hover:bg-bg-tertiary/80 transition-all duration-200 cursor-pointer group"
    >
      <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-bg-primary">
        {track.coverArtPath ? (
          <Image
            src={track.coverArtPath}
            alt={track.title}
            fill
            className="object-cover"
            sizes="48px"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-accent/20 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 3.5C3 3.5 6 2 8 4C10 6 13 4.5 13 4.5V11.5C13 11.5 10 10 8 12C6 14 3 12.5 3 12.5V3.5Z" fill="#6366F1" />
            </svg>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-heading truncate">{track.title}</p>
        <p className="text-xs text-muted truncate">{track.artist ?? "—"}</p>
      </div>

      <span className="text-xs text-muted tabular-nums flex-shrink-0">
        {formatDuration(track.duration)}
      </span>
    </div>
  );
});
