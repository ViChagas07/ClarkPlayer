'use client'

import React, { memo } from 'react'
import type { Track } from '@/types'
import { cn } from '@/lib/utils'
import { MoreHorizontal, Play, Pause, Heart, Share2, Plus, Trash2 } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { TrackLine } from '@/components/track/TrackLine'
import type { TrackLineData } from '@/components/track/TrackLine'

interface TrackRowProps {
  track: Track
  index: number
  isSelected: boolean
  isPlaying: boolean
  isMultiSelectActive: boolean
  onPlay: () => void
  onSelect: () => void
  onContextMenu: (e: React.MouseEvent, track: Track) => void
}

/** Format badge colours — Superman palette */
const formatColors: Record<string, string> = {
  FLAC:   'bg-clark-steel/20 text-clark-text-muted border border-clark-steel/40',
  WAV:    'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40',
  MP3:    'bg-shell-border/30 text-clark-text-muted border border-shell-border',
  AAC:    'bg-clark-gold/20 text-clark-gold border border-clark-gold/40',
  OGG:    'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40',
  M4A:    'bg-clark-sky/20 text-clark-sky border border-clark-sky/40',
  OPUS:   'bg-purple-500/20 text-purple-400 border border-purple-500/40',
  WMA:    'bg-clark-accent/20 text-clark-accent border border-clark-accent/40',
  MIDI:   'bg-pink-500/20 text-pink-400 border border-pink-500/40',
  AIFF:   'bg-cyan-400/20 text-cyan-400 border border-cyan-400/40',
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function trackToLineData(t: Track): TrackLineData {
  return {
    id: t.id,
    title: t.title,
    artistName: t.artist,
    coverUrl: t.coverUrl ?? null,
    previewUrl: t.previewUrl ?? null,
    durationMs: t.duration ? t.duration * 1000 : null,
    albumTitle: t.album,
  }
}

export const TrackRow = memo(function TrackRow({
  track,
  index,
  isSelected,
  isPlaying,
  isMultiSelectActive,
  onPlay,
  onSelect,
  onContextMenu,
}: TrackRowProps) {
  const { t } = useTranslation()
  const [showMenu, setShowMenu] = React.useState(false)

  return (
    <TrackLine
      data={trackToLineData(track)}
      variant="row"
      onPlay={onPlay}
      className={cn(
        'grid gap-4 px-4 py-2.5 h-14 items-center rounded-lg transition-all duration-200 group',
        // Mobile: 3 cols (checkbox/idx + title + duration + menu)
        // Desktop: 6 cols (checkbox/idx + title + album + duration + format + menu)
        'grid-cols-[36px_1fr_44px_36px] sm:grid-cols-[40px_1fr_1fr_80px_60px_40px]',
        isPlaying
          ? 'bg-clark-steel/10 border-l-2 border-l-clark-gold'
          : index % 2 === 0
          ? 'bg-transparent'
          : 'bg-clark-bg-secondary/30',
        'hover:bg-clark-bg-secondary/60',
        isSelected && 'ring-1 ring-clark-gold/50 bg-clark-bg-secondary/40',
      )}
    >
      {/* Index / Equalizer / Checkbox */}
      <div className="flex items-center justify-center">
        {isMultiSelectActive ? (
          <label className="flex items-center justify-center p-1 -m-1 cursor-pointer" onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onSelect}
              className="w-5 h-5 rounded border-clark-steel/40 bg-clark-bg-secondary text-clark-gold focus:ring-clark-gold cursor-pointer"
              aria-label={`${t('selectTrack')} ${track.title}`}
            />
          </label>
        ) : isPlaying ? (
          /* Gold equalizer bars */
          <div className="flex items-end gap-0.5 h-4" aria-label={t('currentlyPlaying')}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1 bg-clark-gold rounded-full animate-equalizer"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        ) : (
          <span className="font-condensed text-sm text-clark-text-muted group-hover:hidden">{index + 1}</span>
        )}
        {!isMultiSelectActive && !isPlaying && (
          <Play className="w-4 h-4 text-clark-gold hidden group-hover:block" />
        )}
      </div>

      {/* Title + Artist */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Album art */}
        <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0 bg-gradient-to-br from-clark-steel to-clark-bg-secondary shadow-glow-blue ring-1 ring-clark-gold/20">
          {track.coverUrl ? (
            <img
              src={track.coverUrl}
              alt={track.album}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="font-condensed text-xs text-clark-gold">{track.title.charAt(0).toUpperCase()}</span>
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className={cn(
            'font-body font-medium text-sm truncate transition-colors',
            isPlaying ? 'text-clark-gold' : 'text-clark-text-primary group-hover:text-clark-gold'
          )}>
            {track.title}
          </p>
          <p className="font-body text-xs text-clark-text-muted truncate">{track.artist}</p>
        </div>
      </div>

      {/* Album — hidden on mobile */}
      <p className="hidden sm:block font-body text-sm text-clark-text-muted truncate">{track.album}</p>

      {/* Duration */}
      <p className="font-condensed text-sm text-clark-text-muted text-right tabular-nums">{formatDuration(track.duration)}</p>

      {/* Format badge — hidden on mobile */}
      <div className="hidden sm:flex items-center justify-center">
        <span className={cn(
          'px-2 py-0.5 rounded font-condensed text-xs uppercase tracking-wide',
          formatColors[track.format] ?? 'bg-shell-border/50 text-clark-text-muted'
        )}>
          {track.format}
        </span>
      </div>

      {/* Context menu */}
      <div className="relative">
        <button
          className="p-1 rounded hover:bg-clark-bg-secondary text-clark-text-muted hover:text-clark-gold opacity-0 group-hover:opacity-100 focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all"
          onClick={(e) => {
            e.stopPropagation()
            setShowMenu(!showMenu)
          }}
          aria-label={t('moreOptions')}
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
        {showMenu && (
          <div className="absolute right-0 top-full mt-1 w-52 max-w-[calc(100vw-1rem)] bg-clark-bg-secondary border border-clark-steel/30 rounded-xl shadow-modal z-20 py-1 backdrop-blur-sm">
            <button className="w-full flex items-center gap-3 px-4 py-2.5 font-body text-sm text-clark-text-primary hover:bg-clark-bg-card hover:text-clark-gold transition-colors" onClick={() => setShowMenu(false)}>
              <Play className="w-4 h-4 text-clark-gold" /> {t('playAction')}
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-2.5 font-body text-sm text-clark-text-primary hover:bg-clark-bg-card hover:text-clark-accent transition-colors" onClick={() => setShowMenu(false)}>
              <Heart className="w-4 h-4 text-clark-accent" /> {track.isFavorite ? t('unfavorite') : t('addToFavorites')}
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-2.5 font-body text-sm text-clark-text-primary hover:bg-clark-bg-card hover:text-clark-gold transition-colors" onClick={() => setShowMenu(false)}>
              <Plus className="w-4 h-4 text-clark-text-muted" /> {t('addToPlaylist')}
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-2.5 font-body text-sm text-clark-text-primary hover:bg-clark-bg-card hover:text-clark-gold transition-colors" onClick={() => setShowMenu(false)}>
              <Share2 className="w-4 h-4 text-clark-text-muted" /> {t('shareAction')}
            </button>
            <div className="my-1 border-t border-clark-steel/20" />
            <button className="w-full flex items-center gap-3 px-4 py-2.5 font-body text-sm text-clark-accent hover:bg-clark-accent/10 transition-colors" onClick={() => setShowMenu(false)}>
              <Trash2 className="w-4 h-4" /> {t('deleteAction')}
            </button>
          </div>
        )}
      </div>
    </TrackLine>
  )
})
