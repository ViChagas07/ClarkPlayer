'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { TrackRow } from '@/components/library/TrackRow'
import { usePlayerStore } from '@/store/playerStore'
import { useTranslation } from '@/hooks/useTranslation'
import { mockTracks } from '@/lib/mockData'
import { api } from '@/lib/api'
import type { Track, UnifiedSearchResult } from '@/types'
import {
  ArrowDownAZ,
  ArrowUpAZ,
  Clock,
  Music,
  Filter,
  List,
  Check,
  Play,
  TrendingUp,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type SortKey = 'title' | 'artist' | 'album' | 'duration' | 'addedAt' | 'format'
type SortDir = 'asc' | 'desc'

function formatDuration(totalSeconds: number): string {
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const mins = Math.floor((totalSeconds % 3600) / 60)
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ${hours}h`
  if (hours > 0) return `${hours}h ${mins}m`
  return `${mins} min`
}

function formatTrackDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function AudiosPage() {
  const { t } = useTranslation()
  const { setQueue, currentTrack, isPlaying } = usePlayerStore()
  const [sortKey, setSortKey] = useState<SortKey>('title')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [formatFilter, setFormatFilter] = useState<string>('All')
  const [multiSelect, setMultiSelect] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [trendingTracks, setTrendingTracks] = useState<UnifiedSearchResult[]>([])
  const [trendingLoading, setTrendingLoading] = useState(true)

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  // Fetch trending tracks from APIs
  useEffect(() => {
    let cancelled = false
    async function loadTrending() {
      const queries = [
        'Blinding Lights', 'Shape of You', 'Bohemian Rhapsody',
        'Dance Monkey', 'Uptown Funk', 'Rolling in the Deep',
      ]
      const results: UnifiedSearchResult[] = []
      for (const q of queries) {
        if (cancelled) return
        try {
          const data = await api.musicSearch(q, 1)
          const track = data.tracks[0]
          if (track) results.push(track)
        } catch { /* skip */ }
      }
      if (!cancelled) setTrendingTracks(results)
      if (!cancelled) setTrendingLoading(false)
    }
    loadTrending()
    return () => { cancelled = true }
  }, [])

  const formats = useMemo(() => {
    const set = new Set(mockTracks.map((t) => t.format))
    return ['All', ...Array.from(set).sort()]
  }, [])

  const sortedTracks = useMemo(() => {
    let filtered = formatFilter === 'All' ? [...mockTracks] : mockTracks.filter((t) => t.format === formatFilter)

    filtered.sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case 'title': cmp = a.title.localeCompare(b.title); break
        case 'artist': cmp = a.artist.localeCompare(b.artist); break
        case 'album': cmp = a.album.localeCompare(b.album); break
        case 'duration': cmp = a.duration - b.duration; break
        case 'addedAt': cmp = (a.addedAt ?? '').localeCompare(b.addedAt ?? ''); break
        case 'format': cmp = a.format.localeCompare(b.format); break
      }
      return sortDir === 'asc' ? cmp : -cmp
    })

    return filtered
  }, [sortKey, sortDir, formatFilter])

  const totalDuration = useMemo(() => sortedTracks.reduce((a, t) => a + t.duration, 0), [sortedTracks])

  function handlePlay(track: Track, index: number) {
    setQueue(sortedTracks, index)
  }

  function handleSelect(trackId: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(trackId)) next.delete(trackId)
      else next.add(trackId)
      return next
    })
  }

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const SortIndicator = ({ active, dir }: { active: boolean; dir: SortDir }) => (
    <span className="ml-1 inline-flex">
      {active ? (dir === 'asc' ? <ArrowUpAZ className="w-3 h-3" /> : <ArrowDownAZ className="w-3 h-3" />) : null}
    </span>
  )

  return (
    <AppShell>
      <div className="space-y-6">
        <h1 className="font-display text-3xl tracking-widest uppercase">{t('allTracks')}</h1>

        {/* ── Trending Now — Real API Data in Spotify-style cards ── */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-clark-gold" />
            <h2 className="font-condensed text-xs tracking-widest text-clark-gold uppercase">Trending Now</h2>
          </div>

          {trendingLoading ? (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-44 animate-pulse">
                  <div className="w-44 h-44 rounded-xl bg-clark-bg-secondary" />
                  <div className="h-4 bg-clark-bg-secondary rounded mt-3 w-3/4" />
                  <div className="h-3 bg-clark-bg-secondary rounded mt-1 w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-thin">
              {trendingTracks.map((result, idx) => {
                const track = result.track
                const artist = result.artist
                const album = result.album
                const coverUrl = result.cover_url ?? album?.cover_url ?? null
                if (!track) return null

                function playThis() {
                  const allTrackObjs: Track[] = trendingTracks
                    .filter((r) => r.track)
                    .map((r, i) => ({
                      id: r.track?.mbid ?? `trending-${i}`,
                      title: r.track?.title ?? '',
                      artist: r.artist?.name ?? '',
                      album: r.album?.title ?? '',
                      duration: r.track?.duration ? Math.round(r.track.duration / 1000) : 200,
                      format: 'MP3' as const,
                      coverUrl: r.cover_url ?? r.album?.cover_url ?? undefined,
                    }))
                  setQueue(allTrackObjs, idx)
                }

                return (
                  <div
                    key={track.mbid ?? `trending-${idx}`}
                    onClick={playThis}
                    className="group flex-shrink-0 w-44 cursor-pointer p-2.5 rounded-xl hover:bg-clark-bg-secondary/60 transition-all duration-200 hover:scale-[1.02]"
                  >
                    {/* Album cover */}
                    <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-clark-steel to-clark-bg-card shadow-lg">
                      {coverUrl ? (
                        <img
                          src={coverUrl}
                          alt={track.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Music className="w-10 h-10 text-white/20" />
                        </div>
                      )}
                      {/* Play button overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-clark-accent flex items-center justify-center shadow-xl">
                          <Play className="w-5 h-5 text-white ml-0.5" />
                        </div>
                      </div>
                    </div>

                    {/* Track info */}
                    <p className="font-body font-semibold text-sm text-clark-text-primary mt-3 truncate">
                      {track.title}
                    </p>
                    <p className="font-body text-xs text-clark-text-muted truncate">
                      {artist?.name ?? 'Unknown'}
                    </p>

                    {/* Popularity bar */}
                    {result.popularity > 0 && (
                      <div className="mt-2 h-1 bg-clark-bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-clark-gold to-clark-accent"
                          style={{ width: `${result.popularity}%` }}
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* ── Your Library ── */}

        {/* Controls bar */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3 font-body text-sm text-clark-text-muted">
            <Music className="w-4 h-4" />
            <span>{sortedTracks.length.toLocaleString()} {t('songsLabel')}</span>
            <span className="text-clark-steel/40">·</span>
            <Clock className="w-4 h-4" />
            <span>{formatDuration(totalDuration)}</span>
          </div>

          <div className="flex-1" />

          {/* Format filter chips */}
          <div className="flex items-center gap-2 flex-wrap">
            {formats.map((fmt) => (
              <button
                key={fmt}
                onClick={() => setFormatFilter(fmt)}
                className={cn(
                  'px-3 py-1.5 rounded-full font-body text-xs font-medium transition-colors',
                  formatFilter === fmt
                    ? 'bg-clark-accent text-white'
                    : 'bg-clark-bg-secondary text-clark-text-muted hover:text-clark-text-primary',
                )}
              >
                {fmt}
              </button>
            ))}
          </div>

          {/* Sort dropdown */}
          <div className="relative group">
            <button
              onClick={(e) => {
                e.currentTarget.parentElement?.classList.toggle('sort-open')
              }}
              className="flex items-center gap-2 px-3 py-2 bg-clark-bg-secondary rounded-lg font-body text-sm text-clark-text-muted hover:text-clark-text-primary transition-colors border border-clark-steel/40"
            >
              {t('sortAction')}
            </button>
            <div className="absolute right-0 top-full mt-1 w-48 bg-clark-bg-secondary border border-clark-steel/20 rounded-lg shadow-card opacity-0 invisible group-hover:opacity-100 group-hover:visible [.sort-open_&]:opacity-100 [.sort-open_&]:visible transition-all z-10">
              {([
                ['title', t('titleColumn')],
                ['artist', t('artistColumn')],
                ['album', t('albumColumn')],
                ['duration', t('durationColumn')],
                ['addedAt', t('dateAdded')],
                ['format', t('formatColumn')],
              ] as [SortKey, string][]).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => handleSort(key)}
                  className={cn(
                    'w-full flex items-center justify-between px-4 py-2.5 font-body text-sm transition-colors',
                    sortKey === key ? 'text-clark-accent bg-clark-accent/10' : 'text-clark-text-muted hover:bg-clark-bg-card',
                  )}
                >
                  {label}
                  {sortKey === key && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* Multi-select toggle */}
          <button
            onClick={() => {
              setMultiSelect(!multiSelect)
              setSelectedIds(new Set())
            }}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg font-body font-medium text-sm transition-colors',
              multiSelect ? 'bg-clark-accent text-white' : 'bg-clark-bg-secondary text-clark-text-muted hover:text-clark-text-primary border border-clark-steel/40',
            )}
          >
            <List className="w-4 h-4" />
            {t('selectAction')}
          </button>
        </div>

        {/* Track list header */}
        <div className="grid grid-cols-[36px_1fr_44px_36px] sm:grid-cols-[40px_1fr_1fr_80px_60px_40px] gap-4 px-4 py-2 font-body font-medium text-xs text-clark-text-muted uppercase tracking-wider border-b border-clark-steel/20">
          <span>{t('trackIndex')}</span>
          <button onClick={() => handleSort('title')} className="text-left">
            {t('titleColumn')} <SortIndicator active={sortKey === 'title'} dir={sortDir} />
          </button>
          <button onClick={() => handleSort('album')} className="hidden sm:block text-left">
            {t('albumColumn')} <SortIndicator active={sortKey === 'album'} dir={sortDir} />
          </button>
          <button onClick={() => handleSort('duration')} className="text-right">
            <SortIndicator active={sortKey === 'duration'} dir={sortDir} />
          </button>
          <span className="hidden sm:block">{t('formatColumn')}</span>
          <span />
        </div>

        {/* Track list */}
        <div className="space-y-0.5">
          {isLoading
            ? Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="grid grid-cols-[36px_1fr_44px_36px] sm:grid-cols-[40px_1fr_1fr_80px_60px_40px] gap-4 px-4 py-3 h-14 items-center bg-clark-bg-secondary/50 rounded-lg animate-pulse">
                  <div className="w-4 h-4 bg-clark-steel/20 rounded" />
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-clark-steel/20 rounded" />
                    <div className="space-y-2">
                      <div className="w-32 h-4 bg-clark-steel/20 rounded" />
                      <div className="w-20 h-3 bg-clark-steel/20 rounded" />
                    </div>
                  </div>
                  <div className="hidden sm:block w-24 h-4 bg-clark-steel/20 rounded" />
                  <div className="w-10 h-4 bg-clark-steel/20 rounded ml-auto" />
                  <div className="hidden sm:block w-10 h-5 bg-clark-steel/20 rounded" />
                  <div className="w-4 h-4 bg-clark-steel/20 rounded" />
                </div>
              ))
            : sortedTracks.map((track, index) => (
                <TrackRow
                  key={track.id}
                  track={track}
                  index={index}
                  isSelected={selectedIds.has(track.id)}
                  isPlaying={currentTrack?.id === track.id && isPlaying}
                  isMultiSelectActive={multiSelect}
                  onPlay={() => handlePlay(track, index)}
                  onSelect={() => handleSelect(track.id)}
                  onContextMenu={() => {}}
                />
              ))}
        </div>

        {/* Bulk action bar */}
        {multiSelect && selectedIds.size > 0 && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-player-bar bg-clark-bg-secondary border border-clark-steel/20 rounded-xl shadow-card px-6 py-3 flex items-center gap-4">
            <span className="font-body text-sm text-clark-text-muted">{selectedIds.size} {t('selectedLabel')}</span>
            <div className="w-px h-6 bg-clark-steel/40" />
            <button className="font-body text-sm text-clark-accent hover:text-clark-accent-hover font-medium">{t('addToPlaylist')}</button>
            <button className="font-body text-sm text-clark-danger hover:text-clark-danger/80 font-medium">{t('deleteAction')}</button>
            <button onClick={() => { setMultiSelect(false); setSelectedIds(new Set()) }} className="font-body text-sm text-clark-text-muted hover:text-clark-text-primary">{t('cancelAction')}</button>
          </div>
        )}
      </div>
    </AppShell>
  )
}
