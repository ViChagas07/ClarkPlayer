"use client";

import { memo } from "react";
import { Play } from "lucide-react";
import type { Track } from "@/types";
import { formatDuration } from "@/lib/utils";
import { ContextMenu } from "@/components/ui/ContextMenu";
import type { MenuItem } from "@/components/ui/ContextMenu";

interface TrackListItemProps {
  track: Track;
  index: number;
  onPlay: (track: Track) => void;
}

export const TrackListItem = memo(function TrackListItem({
  track,
  index,
  onPlay,
}: TrackListItemProps) {
  const menuItems: MenuItem[] = [
    {
      label: "Play",
      icon: <Play size={14} />,
      onClick: () => onPlay(track),
    },
  ];

  return (
    <div
      className="group flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-bg-tertiary transition-colors duration-150"
      onClick={() => onPlay(track)}
      onKeyDown={(e) => e.key === "Enter" && onPlay(track)}
      role="button"
      tabIndex={0}
      aria-label={`${track.title} by ${track.artist ?? "unknown"}`}
    >
      {/* Index / Play indicator */}
      <div className="w-8 text-center flex-shrink-0">
        <span className="text-sm text-muted tabular-nums group-hover:hidden">
          {index + 1}
        </span>
        <Play
          size={14}
          fill="currentColor"
          className="hidden group-hover:block mx-auto text-body"
        />
      </div>

      {/* Track info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-heading truncate">{track.title}</p>
        <p className="text-xs text-muted truncate">{track.artist ?? "—"}</p>
      </div>

      {/* Album */}
      {track.album && (
        <p className="hidden sm:block text-xs text-muted truncate max-w-[160px]">
          {track.album}
        </p>
      )}

      {/* Duration */}
      <span className="text-xs text-muted tabular-nums flex-shrink-0 w-12 text-right">
        {formatDuration(track.duration)}
      </span>

      {/* Context menu */}
      <div onClick={(e) => e.stopPropagation()}>
        <ContextMenu
          trackId={track.id}
          items={menuItems}
        />
      </div>
    </div>
  );
});
