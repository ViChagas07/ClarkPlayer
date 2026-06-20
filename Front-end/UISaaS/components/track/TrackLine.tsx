'use client'

import React from 'react'
import { Music, Headphones, Play } from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Normalised data type ──────────────────────────────────────────
export interface TrackLineData {
  id: string
  title: string
  artistName: string
  artistId?: string
  coverUrl?: string | null
  previewUrl?: string | null
  durationMs?: number | null
  popularity?: number
  /** Display in album/artist pages when you want the album name visible */
  albumTitle?: string | null
}

// ── Props ─────────────────────────────────────────────────────────
export interface TrackLineProps {
  /** Track data (always required – used for label generation) */
  data: TrackLineData
  /** Visual variant */
  variant?: 'row' | 'card'
  /** Called when the user clicks / presses Enter/Space on the row */
  onPlay: () => void
  /** Optional — when set, artist name is rendered as a navigable button */
  onArtistClick?: (artistId: string) => void
  /** Row-index displayed in list views */
  index?: number
  /** When true the row shows a headphone / preview indicator */
  showPreviewIndicator?: boolean
  /** When true duration is rendered (row variant only) */
  showDuration?: boolean
  /** When true a popularity bar is shown */
  showPopularity?: boolean
  /** Extra classes forwarded to the root element */
  className?: string
  /** ⚠ When children are passed they REPLACE the built‑in variant content entirely.
   *  The click‑wrapper, role, tabIndex, onKeyDown and aria‑label are still applied. */
  children?: React.ReactNode
}

// ── Helpers ───────────────────────────────────────────────────────
function formatDuration(ms: number | null): string {
  if (!ms) return ''
  const m = Math.floor(ms / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  return `${m}:${s.toString().padStart(2, '0')}`
}

// ── Component ─────────────────────────────────────────────────────
export function TrackLine({
  data,
  variant = 'row',
  onPlay,
  onArtistClick,
  index,
  showPreviewIndicator = true,
  showDuration = true,
  showPopularity = false,
  className = '',
  children,
}: TrackLineProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onPlay()
    }
  }

  const handleArtistClickInternal = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onArtistClick && data.artistId) {
      onArtistClick(data.artistId)
    }
  }

  const ariaLabel = `Tocar prévia de ${data.title} por ${data.artistName || 'artista desconhecido'}`
  const hasPreview = !!data.previewUrl

  // ── When children are provided, render ONLY the wrapper ──────
  if (children !== undefined) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={onPlay}
        onKeyDown={handleKeyDown}
        aria-label={ariaLabel}
        className={cn('cursor-pointer transition-colors', className)}
      >
        {children}
      </div>
    )
  }

  // ── Built‑in variant: row ─────────────────────────────────────
  if (variant === 'row') {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={onPlay}
        onKeyDown={handleKeyDown}
        aria-label={ariaLabel}
        className={cn(
          'group flex items-center gap-4 px-4 py-2.5 rounded-xl',
          'hover:bg-clark-bg-secondary/60 transition-all duration-200',
          'cursor-pointer border border-transparent hover:border-clark-steel/20',
          className,
        )}
      >
        {/* Index — purely decorative */}
        {index !== undefined && (
          <span className="w-6 text-right font-condensed text-xs text-clark-text-muted/50 flex-shrink-0 pointer-events-none">
            {index + 1}
          </span>
        )}

        {/* Cover art — purely decorative, no listener captures clicks */}
        <div className="relative w-10 h-10 rounded overflow-hidden flex-shrink-0 bg-gradient-to-br from-clark-steel to-clark-bg-card pointer-events-none">
          {data.coverUrl ? (
            <img
              src={data.coverUrl}
              alt={data.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Music className="w-4 h-4 text-white/20" />
            </div>
          )}
          {/* Play overlay — purely decorative, pointer-events-none so click passes through to root */}
          {hasPreview && (
            <div
              className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              aria-hidden="true"
            >
              <Play className="w-5 h-5 text-white ml-0.5" />
            </div>
          )}
        </div>

        {/* Title + Artist — purely decorative */}
        <div className="flex-1 min-w-0 pointer-events-none">
          <p className="font-body font-medium text-sm text-clark-text-primary truncate group-hover:text-clark-gold transition-colors">
            {data.title}
          </p>
          {/* Artist: clickable navigation (EXCEPTION — stopPropagation on the button) */}
          {onArtistClick && data.artistId ? (
            <button
              onClick={handleArtistClickInternal}
              className="font-body text-xs text-clark-text-muted/70 truncate hover:underline text-left"
            >
              {data.artistName}
            </button>
          ) : (
            <p className="font-body text-xs text-clark-text-muted/70 truncate">
              {data.artistName}
              {data.albumTitle && (
                <>
                  <span className="text-clark-text-muted/40 mx-1">&middot;</span>
                  <span className="text-clark-text-muted/50">{data.albumTitle}</span>
                </>
              )}
            </p>
          )}
        </div>

        {/* Popularity bar — purely decorative */}
        {showPopularity && data.popularity != null && data.popularity > 0 && (
          <div className="hidden sm:block w-16 pointer-events-none">
            <div className="h-1 bg-clark-bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-clark-gold to-clark-accent"
                style={{ width: `${Math.min(data.popularity, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Preview indicator — already pointer-events-none */}
        {showPreviewIndicator && hasPreview && (
          <span
            className="flex items-center gap-1 p-1.5 rounded-lg text-clark-gold transition-colors pointer-events-none"
            aria-hidden="true"
          >
            <Headphones className="w-4 h-4" />
            <span className="hidden group-hover:inline font-condensed text-[10px] tracking-wider uppercase">
              Preview
            </span>
          </span>
        )}

        {/* Duration — purely decorative */}
        {showDuration && data.durationMs && (
          <span className="font-condensed text-xs text-clark-text-muted flex-shrink-0 w-10 text-right pointer-events-none">
            {formatDuration(data.durationMs)}
          </span>
        )}
      </div>
    )
  }

  // ── Built‑in variant: card ─────────────────────────────────────
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onPlay}
      onKeyDown={handleKeyDown}
      aria-label={ariaLabel}
      className={cn(
        'group p-3 rounded-xl bg-clark-bg-secondary hover:bg-clark-bg-card',
        'transition-all duration-200 cursor-pointer hover:scale-[1.02]',
        'border border-transparent hover:border-clark-steel/20',
        className,
      )}
    >
      {/* Cover art — purely decorative, pointer-events-none ensures click passes to root */}
      <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-clark-steel to-clark-bg-card shadow-md pointer-events-none">
        {data.coverUrl ? (
          <img
            src={data.coverUrl}
            alt={data.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Music className="w-8 h-8 text-white/20" />
          </div>
        )}
        {hasPreview && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
            <div className="w-10 h-10 rounded-full bg-clark-accent flex items-center justify-center shadow-lg">
              <Play className="w-4 h-4 text-white ml-0.5" />
            </div>
          </div>
        )}
      </div>

      {/* Title + optional headphone icon — purely decorative */}
      <div className="flex items-center gap-2 mt-3 pointer-events-none">
        <p className="font-body font-semibold text-sm text-clark-text-primary truncate flex-1">
          {data.title}
        </p>
        {showPreviewIndicator && hasPreview && (
          <span
            className="flex-shrink-0 p-1 rounded-lg text-clark-gold transition-colors pointer-events-none"
            aria-hidden="true"
          >
            <Headphones className="w-3.5 h-3.5" />
          </span>
        )}
      </div>

      {/* Artist name */}
      {onArtistClick && data.artistId ? (
        <button
          onClick={handleArtistClickInternal}
          className="font-body text-xs text-clark-text-muted truncate hover:underline text-left w-full mt-0.5"
        >
          {data.artistName}
        </button>
      ) : (
        <p className="font-body text-xs text-clark-text-muted truncate mt-0.5 pointer-events-none">
          {data.artistName}
        </p>
      )}

      {/* Popularity bar — purely decorative */}
      {showPopularity && data.popularity != null && data.popularity > 0 && (
        <div className="mt-2 h-1 bg-clark-bg-primary rounded-full overflow-hidden pointer-events-none">
          <div
            className="h-full rounded-full bg-gradient-to-r from-clark-gold to-clark-accent"
            style={{ width: `${data.popularity}%` }}
          />
        </div>
      )}
    </div>
  )
}
