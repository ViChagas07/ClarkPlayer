'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { AppShell } from '@/components/layout/AppShell'
import { TrackRow } from '@/components/library/TrackRow'
import { useTranslation } from '@/hooks/useTranslation'
import { usePlaylistStore } from '@/store/playlistStore'
import { usePlayerStore } from '@/store/playerStore'
import type { Track } from '@/types'
import {
  Play,
  Shuffle,
  Search,
  Share2,
  Download,
  MoreHorizontal,
  Lock,
  Users,
  Clock,
  Calendar,
  Plus,
  FileJson,
  ArrowLeft,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

function formatDuration(totalSeconds: number): string {
  const hrs = Math.floor(totalSeconds / 3600)
  const mins = Math.floor((totalSeconds % 3600) / 60)
  return hrs > 0 ? `${hrs}h ${mins}m` : `${mins} min`
}

export default function PlaylistDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { t } = useTranslation()
  const resolvedParams = React.use(params)
  const { playlists } = usePlaylistStore()
  const { setQueue, currentTrack, isPlaying } = usePlayerStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [showMenu, setShowMenu] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setHydrated(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const playlist = playlists.find((p) => p.id === resolvedParams.id)
  const tracks = playlist?.tracks ?? []

  const filteredTracks = searchQuery
    ? tracks.filter(
        (t) =>
          t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.artist.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : tracks

  function handlePlay(track: Track, index: number) {
    setQueue(filteredTracks, index)
  }

  function handleExport(format: 'm3u8' | 'json') {
    if (format === 'json') {
      const blob = new Blob([JSON.stringify(tracks, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${playlist?.name ?? 'playlist'}.json`
      a.click()
      URL.revokeObjectURL(url)
    } else {
      const content = tracks.map((t) => `#${t.title} - ${t.artist}\n${t.title}.mp3`).join('\n')
      const blob = new Blob([content], { type: 'audio/x-mpegurl' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${playlist?.name ?? 'playlist'}.m3u8`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  if (!hydrated) {
    return (
      <AppShell>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-clark-accent animate-spin" />
        </div>
      </AppShell>
    )
  }

  if (!playlist) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-clark-bg-secondary flex items-center justify-center mb-4">
            <ArrowLeft className="w-8 h-8 text-clark-text-muted" />
          </div>
          <h2 className="font-display text-xl tracking-wider text-clark-text-primary mb-2">Playlist not found</h2>
          <p className="font-body text-sm text-clark-text-muted mb-6">This playlist may have been deleted or does not exist.</p>
          <Link
            href="/playlists"
            className="flex items-center gap-2 px-6 py-3 bg-clark-accent hover:bg-clark-accent-hover font-body font-semibold text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to playlists
          </Link>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Cover */}
          <div className="w-48 h-48 rounded-xl bg-gradient-to-br from-clark-steel to-clark-bg-card flex-shrink-0 grid grid-cols-2 grid-rows-2 overflow-hidden">
            {playlist.coverUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={playlist.coverUrl}
                alt={playlist.name}
                className="col-span-2 row-span-2 w-full h-full object-cover"
              />
            ) : (
              tracks.slice(0, 4).map((t, i) => (
                <div
                  key={i}
                  className={cn(
                    'flex items-center justify-center',
                    i === 0 ? 'bg-gradient-to-br from-clark-steel to-clark-bg-secondary' :
                    i === 1 ? 'bg-gradient-to-br from-clark-accent/80 to-clark-bg-secondary' :
                    i === 2 ? 'bg-gradient-to-br from-clark-gold/80 to-clark-bg-secondary' :
                    'bg-gradient-to-br from-clark-bg-card to-clark-bg-secondary',
                  )}
                >
                  <span className="font-display text-white/30 text-xl">{t.title.charAt(0)}</span>
                </div>
              ))
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {playlist.isCollaborative && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full font-body font-medium text-xs bg-clark-accent/10 text-clark-accent border border-clark-accent/30">
                  <Users className="w-3 h-3" /> {t('collaborativeLabel')}
                </span>
              )}
              {playlist.isPrivate && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full font-body font-medium text-xs bg-clark-bg-secondary text-clark-text-muted border border-clark-steel/30">
                  <Lock className="w-3 h-3" /> {t('privateLabel')}
                </span>
              )}
            </div>

            <h1 className="font-display text-4xl md:text-6xl tracking-widest uppercase mb-2 text-clark-text-primary">{playlist.name}</h1>
            {playlist.description && <p className="font-body text-sm text-clark-text-muted mb-4">{playlist.description}</p>}

            {playlist.isCollaborative && playlist.collaborators.length > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex -space-x-2">
                  {playlist.collaborators.slice(0, 5).map((c, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-clark-accent border-2 border-clark-bg-secondary flex items-center justify-center font-condensed text-xs text-white"
                      title={c.displayName}
                    >
                      {c.displayName.charAt(0)}
                    </div>
                  ))}
                </div>
                <span className="font-body text-xs text-clark-text-muted">
                  {playlist.collaborators.map((c) => c.displayName).join(', ')}
                </span>
              </div>
            )}

            <div className="flex items-center gap-4 font-body text-sm text-clark-text-muted">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {tracks.length} {t('tracks')} · {formatDuration(playlist.totalDuration)}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {t('updated')} {new Date(playlist.updatedAt).toLocaleDateString()}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 mt-6">
              <button
                className="flex items-center gap-2 px-6 py-3 bg-clark-accent hover:bg-clark-accent-hover font-body font-semibold text-white rounded-lg transition-colors"
                onClick={() => setQueue(tracks, 0)}
              >
                <Play className="w-5 h-5" />
                {t('playAction')}
              </button>
              <button className="p-3 bg-clark-bg-secondary hover:bg-clark-bg-card rounded-lg text-clark-text-muted hover:text-clark-gold transition-colors border border-clark-steel/40 hover:border-clark-gold/40" aria-label={t('shuffleAction')}>
                <Shuffle className="w-5 h-5" />
              </button>
              <div className="relative">
                <button
                  className="p-3 bg-clark-bg-secondary hover:bg-clark-bg-card rounded-lg text-clark-text-muted hover:text-clark-text-primary transition-colors border border-clark-steel/40"
                  onClick={() => setShowMenu(!showMenu)}
                  aria-label={t('moreOptions')}
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>
                {showMenu && (
                  <div className="absolute left-0 top-full mt-1 w-52 bg-clark-bg-secondary border border-clark-steel/20 rounded-lg shadow-card z-20 py-1">
                    <button className="w-full flex items-center gap-3 px-4 py-2.5 font-body text-sm text-clark-text-muted hover:bg-clark-bg-card hover:text-clark-text-primary" onClick={() => setShowMenu(false)}>
                      <Share2 className="w-4 h-4" /> {t('shareAction')}
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-2.5 font-body text-sm text-clark-text-muted hover:bg-clark-bg-card hover:text-clark-text-primary" onClick={() => handleExport('json')}>
                      <FileJson className="w-4 h-4" /> {t('exportJSON')}
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-2.5 font-body text-sm text-clark-text-muted hover:bg-clark-bg-card hover:text-clark-text-primary" onClick={() => handleExport('m3u8')}>
                      <Download className="w-4 h-4" /> {t('exportM3U8')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Search within playlist */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-clark-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchInPlaylist')}
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-clark-bg-secondary text-clark-text-primary border border-clark-steel/40 font-body focus:outline-none focus:ring-2 focus:ring-clark-gold focus:border-transparent text-sm"
          />
        </div>

        {/* Track list */}
        {tracks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 rounded-2xl bg-clark-bg-secondary border border-clark-steel/20 text-center">
            <div className="w-12 h-12 rounded-full bg-clark-bg-card flex items-center justify-center mb-4">
              <Play className="w-6 h-6 text-clark-text-muted" />
            </div>
            <p className="font-display text-lg tracking-wider text-clark-text-primary mb-1">No tracks in this playlist yet</p>
            <p className="font-body text-sm text-clark-text-muted mb-6">Search for tracks and add them to this playlist.</p>
            <button className="flex items-center gap-3 px-4 py-2.5 font-body text-sm bg-clark-accent hover:bg-clark-accent-hover text-white rounded-lg transition-colors">
              <Plus className="w-5 h-5" />
              <span className="font-medium">{t('addTracks')}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-0.5">
            <div className="grid grid-cols-[36px_1fr_44px_36px] sm:grid-cols-[40px_1fr_1fr_80px_60px_40px] gap-4 px-4 py-2 font-body font-medium text-xs text-clark-text-muted uppercase tracking-wider border-b border-clark-steel/20">
              <span>#</span>
              <span>{t('titleColumn')}</span>
              <span className="hidden sm:block">{t('albumColumn')}</span>
              <span className="text-right">{t('durationColumn')}</span>
              <span className="hidden sm:block">{t('formatColumn')}</span>
              <span />
            </div>

            {filteredTracks.map((track, index) => (
              <TrackRow
                key={track.id}
                track={track}
                index={index}
                isSelected={false}
                isPlaying={currentTrack?.id === track.id && isPlaying}
                isMultiSelectActive={false}
                onPlay={() => handlePlay(track, index)}
                onSelect={() => {}}
                onContextMenu={() => {}}
              />
            ))}

            <button className="w-full flex items-center gap-3 px-4 py-4 font-body text-sm text-clark-text-muted hover:text-clark-text-primary hover:bg-clark-bg-secondary rounded-lg transition-colors">
              <Plus className="w-5 h-5" />
              <span className="font-medium">{t('addTracks')}</span>
            </button>
          </div>
        )}
      </div>
    </AppShell>
  )
}
