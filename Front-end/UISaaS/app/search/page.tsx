'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { AppShell } from '@/components/layout/AppShell'
import { useTranslation } from '@/hooks/useTranslation'
import { usePlayerStore } from '@/store/playerStore'
import { api } from '@/lib/api'
import { getSessionTracks, getSessionArtists } from '@/lib/seedCatalog'
import { cn } from '@/lib/utils'
import type { UnifiedSearchResponse, UnifiedSearchResult, Track } from '@/types'
import {
  Search as SearchIcon,
  Music,
  Mic2,
  Play,
  Loader2,
  AlertCircle,
  Clock,
  BarChart3,
  Activity,
  Headphones,
  TrendingUp,
} from 'lucide-react'

const KEY_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

// ── Seed queries — randomly rotated per session ───────────────────
const POPULAR_TRACK_QUERIES = getSessionTracks(20)
const POPULAR_ARTIST_QUERIES = getSessionArtists(20)

export default function SearchPage() {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<UnifiedSearchResponse | null>(null)
  const [activeTab, setActiveTab] = useState<'tracks' | 'artists'>('tracks')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)
  const { setQueue } = usePlayerStore()

  // ── Pre-search suggestions ─────────────────────────────────────
  const [suggestedTracks, setSuggestedTracks] = useState<UnifiedSearchResult[]>([])
  const [suggestedArtists, setSuggestedArtists] = useState<UnifiedSearchResult[]>([])
  const [suggestionsLoading, setSuggestionsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function loadSuggestions() {
      // ── Parallel batch loading for speed ──────────────
      async function loadBatch(queries: string[], pickFn: (data: UnifiedSearchResponse) => UnifiedSearchResult | null) {
        const results: UnifiedSearchResult[] = []
        for (let i = 0; i < queries.length; i += 5) {
          if (cancelled) return results
          const batch = queries.slice(i, i + 5)
          const batchResults = await Promise.allSettled(
            batch.map(async (q) => {
              const data = await api.musicSearch(q, 1)
              return pickFn(data)
            })
          )
          for (const r of batchResults) {
            if (r.status === 'fulfilled' && r.value) results.push(r.value)
          }
        }
        return results
      }

      const tracks = await loadBatch(POPULAR_TRACK_QUERIES, (d) => d.tracks[0]?.track?.title ? d.tracks[0] : null)
      if (!cancelled) setSuggestedTracks(tracks)

      const artists = await loadBatch(POPULAR_ARTIST_QUERIES, (d) => d.artists[0]?.artist?.name ? d.artists[0] : null)
      if (!cancelled) setSuggestedArtists(artists)
      if (!cancelled) setSuggestionsLoading(false)
    }

    loadSuggestions()
    return () => { cancelled = true }
  }, [])

  const searchApi = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults(null)
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const data = await api.musicSearch(q, 8)
      setResults(data)
    } catch {
      setError(t('searchErrorLabel'))
    } finally {
      setIsLoading(false)
    }
  }, [t])

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    debounceRef.current = setTimeout(() => {
      searchApi(query)
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, searchApi])

  function toTrack(result: UnifiedSearchResult, index: number): Track {
    const title = result.track?.title ?? 'Unknown'
    const artistName = result.artist?.name ?? 'Unknown'
    const duration = result.track?.duration
      ? Math.round(result.track.duration / 1000)
      : 200
    return {
      id: result.track?.mbid ?? `search-${index}`,
      title,
      artist: artistName,
      album: result.album?.title ?? '',
      duration,
      format: 'MP3',
      coverUrl: result.cover_url ?? undefined,
      previewUrl: result.track?.preview_url ?? null,
    }
  }

  function handlePlay(result: UnifiedSearchResult, idx: number) {
    const tracks = (results?.tracks ?? []).map((r, i) => toTrack(r, i))
    setQueue(tracks, idx)
  }

  function handleSuggestedPlay(result: UnifiedSearchResult, idx: number) {
    const tracks = suggestedTracks.map((r, i) => toTrack(r, i))
    setQueue(tracks, idx)
  }

  function formatDuration(ms: number | null): string {
    if (!ms) return ''
    const totalSec = Math.round(ms / 1000)
    const m = Math.floor(totalSec / 60)
    const s = totalSec % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  function getKeyName(key: number | null | undefined): string {
    if (key === null || key === undefined || key < 0 || key > 11) return ''
    return KEY_NAMES[key]
  }

  const trackResults = results?.tracks ?? []
  const artistResults = results?.artists ?? []

  // ── Shared track card renderer ─────────────────────────────────
  function renderTrackCard(result: UnifiedSearchResult, idx: number, list: UnifiedSearchResult[], onPlay: (r: UnifiedSearchResult, i: number) => void) {
    const track = result.track
    const artist = result.artist
    const album = result.album
    if (!track) return null

    return (
      <div
        key={track.mbid ?? `track-${idx}`}
        className="group flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-clark-bg-secondary/80 transition-all duration-200 cursor-pointer border border-transparent hover:border-clark-steel/20"
        onDoubleClick={() => onPlay(result, idx)}
      >
        {/* Cover art */}
        <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-clark-bg-card">
          {result.cover_url || album?.cover_url ? (
            <img
              src={result.cover_url ?? album?.cover_url ?? ''}
              alt={track.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-clark-steel to-clark-bg-card">
              <Music className="w-5 h-5 text-white/30" />
            </div>
          )}
          <button
            className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onPlay(result, idx)}
            aria-label={`Play ${track.title}`}
          >
            <Play className="w-6 h-6 text-white ml-0.5" />
          </button>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Link
              href={track.mbid ? `/music/track/${track.mbid}` : '#'}
              className="font-body font-semibold text-sm text-clark-text-primary truncate hover:text-clark-gold transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              {track.title}
            </Link>
            {track.preview_url && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-clark-gold/15 text-clark-gold font-condensed uppercase tracking-wider flex-shrink-0">
                {t('previewLabel')}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <p className="font-body text-xs text-clark-text-muted truncate">{artist?.name ?? 'Unknown'}</p>
            {album?.title && (
              <>
                <span className="text-clark-text-muted/40">·</span>
                <p className="font-body text-xs text-clark-text-muted/70 truncate">{album.title}</p>
              </>
            )}
          </div>
        </div>

        {/* Preview & duration */}
        <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
          {track.preview_url && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                const previewUrl: string = track.preview_url!
                const trk = toTrack(result, idx)
                trk.previewUrl = previewUrl
                usePlayerStore.getState().playPreview(previewUrl, trk)
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-clark-gold/10 hover:bg-clark-gold/20 text-clark-gold font-body text-xs font-medium transition-colors"
              aria-label={t('playPreview')}
            >
              <Headphones className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">{t('playPreview')}</span>
            </button>
          )}

          {result.popularity > 0 && (
            <div className="flex items-center gap-1.5" title={`${t('popularityLabel')}: ${result.popularity}`}>
              <BarChart3 className="w-3.5 h-3.5 text-clark-text-muted" />
              <div className="w-16 h-1.5 bg-clark-bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-clark-gold to-clark-accent transition-all"
                  style={{ width: `${result.popularity}%` }}
                />
              </div>
            </div>
          )}

          {track.duration && (
            <span className="flex items-center gap-1 font-condensed text-xs text-clark-text-muted">
              <Clock className="w-3 h-3" />
              {formatDuration(track.duration)}
            </span>
          )}
        </div>
      </div>
    )
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <h1 className="font-display text-3xl tracking-widest uppercase">{t('search')}</h1>

        {/* Search input — centered Spotify-style */}
        <div className="flex justify-center">
          <div className="relative w-full max-w-2xl">
            <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-clark-text-muted" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('searchGlobalPlaceholder')}
              className="w-full h-14 pl-14 pr-4 rounded-2xl bg-clark-bg-secondary text-clark-text-primary border border-clark-steel/30 font-body text-lg focus:outline-none focus:ring-2 focus:ring-clark-gold focus:border-transparent transition-shadow"
              autoFocus
            />
            {isLoading && (
              <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-clark-gold animate-spin" />
            )}
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-clark-accent/10 border border-clark-accent/30">
            <AlertCircle className="w-5 h-5 text-clark-accent flex-shrink-0" />
            <p className="font-body text-sm text-clark-accent">{error}</p>
          </div>
        )}

        {/* ── PRE-SEARCH SUGGESTIONS (no query typed yet) ────────── */}
        {!query && (
          <div className="space-y-8">
            {/* Popular Tracks */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-clark-gold" />
                <h2 className="font-condensed text-xs tracking-widest text-clark-gold uppercase">
                  Popular Tracks
                </h2>
              </div>
              {suggestionsLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-clark-bg-secondary/50 animate-pulse">
                      <div className="w-12 h-12 rounded-lg bg-clark-bg-card flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-clark-bg-card rounded w-2/3" />
                        <div className="h-3 bg-clark-bg-card rounded w-1/3" />
                      </div>
                      <div className="h-3 bg-clark-bg-card rounded w-12" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-0.5">
                  {suggestedTracks.map((result, idx) => renderTrackCard(result, idx, suggestedTracks, handleSuggestedPlay))}
                </div>
              )}
            </section>

            {/* Popular Artists */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Mic2 className="w-5 h-5 text-clark-gold" />
                <h2 className="font-condensed text-xs tracking-widest text-clark-gold uppercase">
                  Popular Artists
                </h2>
              </div>
              {suggestionsLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex flex-col items-center animate-pulse p-4">
                      <div className="w-24 h-24 rounded-full bg-clark-bg-secondary" />
                      <div className="h-4 w-20 bg-clark-bg-secondary rounded mt-3" />
                      <div className="h-3 w-12 bg-clark-bg-secondary rounded mt-1" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                  {suggestedArtists.map((result, idx) => {
                    const artist = result.artist
                    if (!artist) return null
                    return (
                      <Link
                        key={artist.mbid ?? `artist-${idx}`}
                        href={artist.mbid ? `/artists/${artist.mbid}?name=${encodeURIComponent(artist.name)}` : `#`}
                        className="group flex flex-col items-center p-4 rounded-2xl bg-clark-bg-secondary/40 hover:bg-clark-bg-secondary transition-all duration-200 hover:scale-[1.02] border border-transparent hover:border-clark-steel/20"
                      >
                        {/* Popular Artists section */}
                        <div className="relative w-24 h-24 rounded-full overflow-hidden mb-3 bg-gradient-to-br from-clark-steel to-clark-bg-card shadow-lg group-hover:shadow-xl transition-shadow">
                          {result.cover_url || artist.image_url ? (
                            <img
                              src={result.cover_url ?? artist.image_url ?? ''}
                              alt={artist.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="font-display text-3xl text-white/30">{artist.name.charAt(0)}</span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-full" />
                        </div>
                        <p className="font-body font-semibold text-sm text-center text-clark-text-primary truncate w-full">
                          {artist.name}
                        </p>
                        {result.genres.length > 0 && (
                          <p className="font-body text-xs text-clark-text-muted/70 text-center mt-1 line-clamp-1">
                            {result.genres.slice(0, 3).join(', ')}
                          </p>
                        )}
                        {result.popularity > 0 && (
                          <div className="flex items-center gap-1 mt-2">
                            <Activity className="w-3 h-3 text-clark-text-muted" />
                            <span className="font-condensed text-xs text-clark-text-muted">
                              {result.popularity}
                            </span>
                          </div>
                        )}
                      </Link>
                    )
                  })}
                </div>
              )}
            </section>

            {/* Hint to search */}
            <p className="text-center font-body text-sm text-clark-text-muted/50">
              {t('searchAcrossWebDesc')}
            </p>
          </div>
        )}

        {/* Tabs */}
        {query.length >= 2 && (isLoading || results) && (
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('tracks')}
              className={cn(
                'flex items-center gap-2 px-5 py-2.5 rounded-full font-body font-medium text-sm transition-all duration-200',
                activeTab === 'tracks'
                  ? 'bg-clark-accent text-white shadow-lg shadow-clark-accent/30'
                  : 'bg-clark-bg-secondary text-clark-text-muted hover:text-clark-text-primary hover:bg-clark-bg-card',
              )}
            >
              <Music className="w-4 h-4" />
              {t('tracksTab')}
              {results && <span className="text-xs opacity-70">({results.total_tracks})</span>}
            </button>
            <button
              onClick={() => setActiveTab('artists')}
              className={cn(
                'flex items-center gap-2 px-5 py-2.5 rounded-full font-body font-medium text-sm transition-all duration-200',
                activeTab === 'artists'
                  ? 'bg-clark-accent text-white shadow-lg shadow-clark-accent/30'
                  : 'bg-clark-bg-secondary text-clark-text-muted hover:text-clark-text-primary hover:bg-clark-bg-card',
              )}
            >
              <Mic2 className="w-4 h-4" />
              {t('artistsTab')}
              {results && <span className="text-xs opacity-70">({results.total_artists})</span>}
            </button>
          </div>
        )}

        {/* Skeleton loaders */}
        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-clark-bg-secondary/50 animate-pulse">
                <div className="w-12 h-12 rounded-lg bg-clark-bg-card flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-clark-bg-card rounded w-2/3" />
                  <div className="h-3 bg-clark-bg-card rounded w-1/3" />
                </div>
                <div className="h-3 bg-clark-bg-card rounded w-12" />
              </div>
            ))}
          </div>
        )}

        {/* Track results — Spotify-style cards */}
        {!isLoading && activeTab === 'tracks' && query.length >= 2 && (
          <div className="space-y-0.5">
            {trackResults.length === 0 && results ? (
              <p className="font-body text-clark-text-muted text-center py-12">
                {t('noTracksFound')} &quot;{query}&quot;
              </p>
            ) : (
              trackResults.map((result, idx) => renderTrackCard(result, idx, trackResults, handlePlay))
            )}
          </div>
        )}

        {/* Artist results — card grid */}
        {!isLoading && activeTab === 'artists' && query.length >= 2 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {artistResults.length === 0 && results ? (
              <p className="font-body text-clark-text-muted text-center py-12 col-span-full">
                {t('noArtistsFound')} &quot;{query}&quot;
              </p>
            ) : (
              artistResults.map((result, idx) => {
                const artist = result.artist
                if (!artist) return null
                return (
                  <Link
                    key={artist.mbid ?? `artist-${idx}`}
                    href={artist.mbid ? `/artists/${artist.mbid}?name=${encodeURIComponent(artist.name)}` : `#`}
                    className="group flex flex-col items-center p-4 rounded-2xl bg-clark-bg-secondary/40 hover:bg-clark-bg-secondary transition-all duration-200 hover:scale-[1.02] border border-transparent hover:border-clark-steel/20"
                  >
                    <div className="relative w-28 h-28 rounded-full overflow-hidden mb-3 bg-gradient-to-br from-clark-steel to-clark-bg-card shadow-lg group-hover:shadow-xl transition-shadow">
                      {result.cover_url || artist.image_url ? (
                        <img
                          src={result.cover_url ?? artist.image_url ?? ''}
                          alt={artist.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="font-display text-4xl text-white/30">{artist.name.charAt(0)}</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-full" />
                    </div>
                    <p className="font-body font-semibold text-sm text-center text-clark-text-primary truncate w-full">
                      {artist.name}
                    </p>
                    {result.genres.length > 0 && (
                      <p className="font-body text-xs text-clark-text-muted/70 text-center mt-1 line-clamp-1">
                        {result.genres.slice(0, 3).join(', ')}
                      </p>
                    )}
                    {result.popularity > 0 && (
                      <div className="flex items-center gap-1 mt-2">
                        <Activity className="w-3 h-3 text-clark-text-muted" />
                        <span className="font-condensed text-xs text-clark-text-muted">
                          {result.popularity}
                        </span>
                      </div>
                    )}
                  </Link>
                )
              })
            )}
          </div>
        )}
      </div>
    </AppShell>
  )
}
