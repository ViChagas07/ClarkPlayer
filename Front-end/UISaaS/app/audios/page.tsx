'use client'

import { useState, useMemo, useEffect } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { TrackRow } from '@/components/library/TrackRow'
import { usePlayerStore } from '@/store/playerStore'
import { useTranslation } from '@/hooks/useTranslation'
import { api } from '@/lib/api'
import type { Track, CatalogTrackItem, CatalogDiscoveryResponse } from '@/types'
import {
  ArrowDownAZ,
  ArrowUpAZ,
  Clock,
  Music,
  List,
  Check,
  Play,
  TrendingUp,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type SortKey = 'title' | 'artist' | 'album' | 'duration' | 'format'
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

function catalogTrackToTrack(item: CatalogTrackItem): Track {
  return {
    id: item.id,
    title: item.title,
    artist: item.artist_name ?? 'Unknown',
    album: item.album_title ?? 'Unknown',
    duration: item.duration_ms ? Math.round(item.duration_ms / 1000) : 0,
    format: 'MP3',
    coverUrl: item.album_cover ?? undefined,
    previewUrl: item.preview_url ?? undefined,
    isPreview: false,
  }
}

const DISCOVERY_KEY = ['catalog', 'discovery']

export default function AudiosPage() {
  const { t } = useTranslation()
  const { setQueue, currentTrack, isPlaying } = usePlayerStore()

  const [sortKey, setSortKey] = useState<SortKey>('title')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [formatFilter, setFormatFilter] = useState<string>('All')
  const [multiSelect, setMultiSelect] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const [tracks, setTracks] = useState<Track[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)

  const [trendingTracks, setTrendingTracks] = useState<CatalogTrackItem[]>([])
  const [trendingLoading, setTrendingLoading] = useState(true)

  // ── Load catalog tracks (no auth required) ──────────────────────
  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setLoadError(false)

    async function loadTracks() {
      try {
        // Fetch catalog tracks with preview URLs (public endpoint)
        const qs = new URLSearchParams({
          limit: '100',
          has_preview: 'false',
          offset: '0',
        })
        const res = await fetch(`/api/v1/catalog/tracks?${qs.toString()}`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        const items: CatalogTrackItem[] = data.tracks ?? []
        if (cancelled) return
        setTracks(items.map(catalogTrackToTrack))
      } catch {
        if (!cancelled) setLoadError(true)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    loadTracks()
    return () => { cancelled = true }
  }, [])

  // ── Load trending tracks from discovery API ─────────────────────
  useEffect(() => {
    let cancelled = false
    async function loadTrending() {
      try {
        const res = await fetch('/api/v1/catalog/discovery')
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data: CatalogDiscoveryResponse = await res.json()
        if (!cancelled) {
          setTrendingTracks(data.trending_tracks ?? [])
        }
      } catch { /* skip trending on error */ }
      if (!cancelled) setTrendingLoading(false)
    }
    loadTrending()
    return () => { cancelled = true }
  }, [])

  const formats = useMemo(() => {
    const set = new Set(tracks.map((t) => t.format))
    return ['All', ...Array.from(set).sort()]
  }, [tracks])

  const sortedTracks = useMemo(() => {
    let filtered = formatFilter === 'All' ? [...tracks] : tracks.filter((t) => t.format === formatFilter)

    filtered.sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case 'title': cmp = a.title.localeCompare(b.title); break
        case 'artist': cmp = a.artist.localeCompare(b.artist); break
        case 'album': cmp = a.album.localeCompare(b.album); break
        case 'duration': cmp = a.duration - b.duration; break
        case 'format': cmp = a.format.localeCompare(b.format); break
      }
      return sortDir === 'asc' ? cmp : -cmp
    })

    return filtered
  }, [tracks, sortKey, sortDir, formatFilter])

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

        {/* Trending Now — powered by discovery API (no auth, diverse) */}
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
              {trendingTracks.slice(0, 20).map((item, idx) => {
                const coverUrl = item.album_cover ?? null
                if (!item) return null

                function playThis() {
                  const allTrackObjs: Track[] = trendingTracks
                    .slice(0, 20)
                    .filter(Boolean)
                    .map((t, i) => catalogTrackToTrack(t))
                  setQueue(allTrackObjs, idx)
                }

                return (
                  <div
                    key={item.id ?? `trending-${idx}`}
                    onClick={playThis}
                    className="group flex-shrink-0 w-44 cursor-pointer p-2.5 rounded-xl hover:bg-clark-bg-secondary/60 transition-all duration-200 hover:scale-[1.02]"
                  >
                    <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-clark-steel to-clark-bg-card shadow-lg">
                      {coverUrl ? (
                        <img
                          src={coverUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Music className="w-10 h-10 text-white/20" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-clark-accent flex items-center justify-center shadow-xl">
                          <Play className="w-5 h-5 text-white ml-0.5" />
                        </div>
                      </div>
                    </div>

                    <p className="font-body font-semibold text-sm text-clark-text-primary mt-3 truncate">
                      {item.title}
                    </p>
                    <p className="font-body text-xs text-clark-text-muted truncate">
                      {item.artist_name ?? 'Unknown'}
                    </p>

                    {item.popularity > 0 && (
                      <div className="mt-2 h-1 bg-clark-bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-clark-gold to-clark-accent"
                          style={{ width: `${Math.min(item.popularity, 100)}%` }}
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </section>

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
          {isLoading ? (
            Array.from({ length: 20 }).map((_, i) => (
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
          ) : loadError ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 rounded-2xl bg-clark-bg-secondary border border-clark-steel/20 text-center">
              <p className="font-display text-lg tracking-wider text-clark-text-primary mb-2">
                Failed to load tracks
              </p>
              <p className="font-body text-sm text-clark-text-muted mb-4">
                The catalog backend may be starting up. Please try again in a moment.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-5 py-2 bg-clark-accent hover:bg-clark-accent-hover font-body font-medium text-white rounded-lg transition-colors"
              >
                Retry
              </button>
            </div>
          ) : sortedTracks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 rounded-2xl bg-clark-bg-secondary border border-clark-steel/20 text-center">
              <Music className="w-10 h-10 text-clark-text-muted/30 mb-3" />
              <p className="font-display text-lg tracking-wider text-clark-text-primary mb-1">{t('noTracksYet')}</p>
              <p className="font-body text-sm text-clark-text-muted max-w-sm">{t('startUploading')}</p>
            </div>
          ) : (
            sortedTracks.map((track, index) => (
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
            ))
          )}
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
