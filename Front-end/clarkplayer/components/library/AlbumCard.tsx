"use client";

import { memo } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import type { Album } from "@/types";
import { formatDuration } from "@/lib/utils";

interface AlbumCardProps {
  album: Album;
  onPlay?: (album: Album) => void;
  className?: string;
}

export const AlbumCard = memo(function AlbumCard({
  album,
  onPlay,
  className,
}: AlbumCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onPlay?.(album)}
      onKeyDown={(e) => e.key === "Enter" && onPlay?.(album)}
      className={`group relative rounded-xl bg-bg-tertiary p-3 space-y-3 cursor-pointer hover:bg-bg-tertiary/80 transition-all duration-200 ${className ?? ""}`}
    >
      {/* Cover art */}
      <div className="relative aspect-square rounded-xl overflow-hidden bg-bg-primary">
        {album.coverArtPath ? (
          <Image
            src={album.coverArtPath}
            alt={album.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-indigo-900/40 flex items-center justify-center">
            <svg width="48" height="48" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 3.5C3 3.5 6 2 8 4C10 6 13 4.5 13 4.5V11.5C13 11.5 10 10 8 12C6 14 3 12.5 3 12.5V3.5Z" fill="#6366F1" opacity="0.6" />
            </svg>
          </div>
        )}

        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center shadow-lg">
            <Play size={18} fill="white" className="text-white ml-0.5" />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="space-y-1 min-w-0">
        <p className="text-sm font-semibold text-heading truncate">{album.name}</p>
        <p className="text-xs text-muted truncate">{album.artist}</p>
        <div className="flex items-center gap-2 text-xs text-muted">
          {album.year && <span>{album.year}</span>}
          {album.trackCount && <span>{album.trackCount} tracks</span>}
          {album.duration && (
            <span>{formatDuration(album.duration)}</span>
          )}
        </div>
      </div>
    </div>
  );
});
