'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { AppShell } from '@/components/layout/AppShell'
import { useTranslation } from '@/hooks/useTranslation'
import { usePlayerStore } from '@/store/playerStore'
import { useDiscovery, useCatalogSearch } from '@/hooks/useCatalog'
import { cn } from '@/lib/utils'
import type { CatalogSearchResult, CatalogTrackItem, CatalogArtistItem, Track } from '@/types'
import {
  Search as SearchIcon,
  Music,
  Mic2,
  Disc,
  Play,
  Loader2,
  AlertCircle,
  TrendingUp,
  Headphones,
  BarChart3,
  Clock,
} from 'lucide-react'

function catalogTrackToPlayerTrack(item: CatalogTrackItem): Track {
  return {
    id: item.id,
    title: item.title,
    artist: item.artist_name,
    album: item.album_title ?? '',
    duration: item.duration_ms ? Math.round(item.duration_ms / 1000) : 200,
    format: 'MP3',
    coverUrl: item.album_cover ?? undefined,
    previewUrl: item.preview_url ?? null,
  }
}

function formatDuration(ms: number | null): string {
  if (!ms) return ''
  const totalSec = Math.round(ms / 1000)
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function SearchPage() {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'tracks' | 'artists' | 'albums'>('tracks')
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)
  const { setQueue } = usePlayerStore()

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setDebouncedQuery(query), 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  // Catalog discovery for suggestions (no query)
  const { data: discovery, isLoading: discoveryLoading } = useDiscovery()

  // Catalog search (query >= 2 chars)
  const { data: searchResults, isLoading: searchLoading, isError: searchError } = useCatalogSearch(debouncedQuery)
  const isSearching = debouncedQuery.length >= 2

  const trackResults = searchResults?.results.filter((r) => r.type === 'track') ?? []
  const artistResults = searchResults?.results.filter((r) => r.type === 'artist') ?? []
  const albumResults = searchResults?.results.filter((r) => r.type === 'album') ?? []

  function handleDiscoveryPlay(item: CatalogTrackItem, idx: number) {
    const tracks = (discovery?.trending_tracks ?? []).map((t) => catalogTrackToPlayerTrack(t))
    setQueue(tracks, idx)
  }

  function handleDiscoveryPreview(item: CatalogTrackItem) {
    if (item.preview_url) {
      const track = catalogTrackToPlayerTrack(item)
      usePlayerStore.getState().playPreview(item.preview_url, track)
    }
  }

  function renderDiscoveryTrackCard(item: CatalogTrackItem, idx: number) {
    return (
      <div
        key={item.id}
        role="button"
        tabIndex={0}
        aria-label={`Play ${item.title} by ${item.artist_name}`}
        className="group flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-clark-bg-secondary/80 transition-all duration-200 cursor-pointer border border-transparent hover:border-clark-steel/20"
        onClick={() => handleDiscoveryPlay(item, idx)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleDiscoveryPlay(item, idx) } }}
      >
        {/* Cover art */}
        <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-clark-bg-card">
          {item.album_cover ? (
            <img
              src={item.album_cover}
              alt={item.title}
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
            onClick={() => handleDiscoveryPlay(item, idx)}
            aria-label={`Play ${item.title}`}
          >
            <Play className="w-6 h-6 text-white ml-0.5" />
          </button>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Link
              href={`/catalog/track/${item.id}`}
              className="font-body font-semibold text-sm text-clark-text-primary truncate hover:text-clark-gold transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              {item.title}
            </Link>
            {item.preview_url && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-clark-gold/15 text-clark-gold font-condensed uppercase tracking-wider flex-shrink-0">
                {t('previewLabel')}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <p className="font-body text-xs text-clark-text-muted truncate">{item.artist_name}</p>
            {item.album_title && (
              <>
                <span className="text-clark-text-muted/40">&middot;</span>
                <p className="font-body text-xs text-clark-text-muted/70 truncate">{item.album_title}</p>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
          {item.preview_url && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleDiscoveryPreview(item)
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-clark-gold/10 hover:bg-clark-gold/20 text-clark-gold font-body text-xs font-medium transition-colors"
              aria-label={t('playPreview')}
            >
              <Headphones className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">{t('playPreview')}</span>
            </button>
          )}

          {item.popularity > 0 && (
            <div className="flex items-center gap-1.5" title={`${t('popularityLabel')}: ${item.popularity}`}>
              <BarChart3 className="w-3.5 h-3.5 text-clark-text-muted" />
              <div className="w-16 h-1.5 bg-clark-bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-clark-gold to-clark-accent transition-all"
                  style={{ width: `${Math.min(item.popularity, 100)}%` }}
                />
              </div>
            </div>
          )}

          {item.duration_ms && (
            <span className="flex items-center gap-1 font-condensed text-xs text-clark-text-muted">
              <Clock className="w-3 h-3" />
              {formatDuration(item.duration_ms)}
            </span>
          )}
        </div>
      </div>
    )
  }

  function renderDiscoveryArtistCard(item: CatalogArtistItem) {
    return (
      <Link
        key={item.id}
        href={`/artists/${item.id}?name=${encodeURIComponent(item.name)}`}
        className="group flex flex-col items-center p-4 rounded-2xl bg-clark-bg-secondary/40 hover:bg-clark-bg-secondary transition-all duration-200 hover:scale-[1.02] border border-transparent hover:border-clark-steel/20"
      >
        <div className="relative w-24 h-24 rounded-full overflow-hidden mb-3 bg-gradient-to-br from-clark-steel to-clark-bg-card shadow-lg group-hover:shadow-xl transition-shadow">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="font-display text-3xl text-white/30">{item.name.charAt(0)}</span>
            </div>
          )}
        </div>
        <p className="font-body font-semibold text-sm text-center text-clark-text-primary truncate w-full">
          {item.name}
        </p>
        {item.genres.length > 0 && (
          <p className="font-body text-xs text-clark-text-muted/70 text-center mt-1 line-clamp-1">
            {item.genres.slice(0, 3).join(', ')}
          </p>
        )}
        {item.track_count > 0 && (
          <p className="font-condensed text-xs text-clark-text-muted mt-1">
            {item.track_count.toLocaleString()} {t('tracks')}
          </p>
        )}
      </Link>
    )
  }

  function renderSearchTrackCard(result: CatalogSearchResult) {
    return (
      <Link
        key={result.id}
        href={`/catalog/track/${result.id}`}
        className="group flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-clark-bg-secondary/80 transition-all duration-200 border border-transparent hover:border-clark-steel/20"
      >
        <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-clark-bg-card">
          {result.cover_url ? (
            <img
              src={result.cover_url}
              alt={result.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-clark-steel to-clark-bg-card">
              <Music className="w-5 h-5 text-white/30" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-body font-semibold text-sm text-clark-text-primary truncate">{result.title}</p>
          {result.artist_name && (
            <p className="font-body text-xs text-clark-text-muted truncate">{result.artist_name}</p>
          )}
        </div>
      </Link>
    )
  }

  function renderSearchArtistCard(result: CatalogSearchResult) {
    return (
      <Link
        key={result.id}
        href={`/artists/${result.id}?name=${encodeURIComponent(result.title)}`}
        className="group flex flex-col items-center p-4 rounded-2xl bg-clark-bg-secondary/40 hover:bg-clark-bg-secondary transition-all duration-200 hover:scale-[1.02] border border-transparent hover:border-clark-steel/20"
      >
        <div className="relative w-28 h-28 rounded-full overflow-hidden mb-3 bg-gradient-to-br from-clark-steel to-clark-bg-card shadow-lg group-hover:shadow-xl transition-shadow">
          {result.cover_url ? (
            <img
              src={result.cover_url}
              alt={result.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="font-display text-4xl text-white/30">{result.title.charAt(0)}</span>
            </div>
          )}
        </div>
        <p className="font-body font-semibold text-sm text-center text-clark-text-primary truncate w-full">
          {result.title}
        </p>
      </Link>
    )
  }

  function renderSearchAlbumCard(result: CatalogSearchResult) {
    return (
      <Link
        key={result.id}
        href={`/catalog/album/${result.id}`}
        className="group flex flex-col items-center p-4 rounded-2xl bg-clark-bg-secondary/40 hover:bg-clark-bg-secondary transition-all duration-200 hover:scale-[1.02] border border-transparent hover:border-clark-steel/20"
      >
        <div className="relative w-32 h-32 rounded-lg overflow-hidden mb-3 bg-gradient-to-br from-clark-steel to-clark-bg-card shadow-lg group-hover:shadow-xl transition-shadow">
          {result.cover_url ? (
            <img
              src={result.cover_url}
              alt={result.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Disc className="w-10 h-10 text-white/30" />
            </div>
          )}
        </div>
        <p className="font-body font-semibold text-sm text-center text-clark-text-primary truncate w-full">
          {result.title}
        </p>
        {result.artist_name && (
          <p className="font-body text-xs text-clark-text-muted/70 text-center mt-1 truncate w-full">
            {result.artist_name}
          </p>
        )}
      </Link>
    )
  }

  const trendingTracks = discovery?.trending_tracks ?? []
  const topArtists = discovery?.top_artists ?? []

  return (
    <AppShell>
      <div className="space-y-6">
        <h1 className="font-display text-3xl tracking-widest uppercase">{t('search')}</h1>

        {/* Search input — centered */}
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
            {searchLoading && (
              <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-clark-gold animate-spin" />
            )}
          </div>
        </div>

        {/* Error state for search */}
        {searchError && isSearching && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-clark-accent/10 border border-clark-accent/30">
            <AlertCircle className="w-5 h-5 text-clark-accent flex-shrink-0" />
            <p className="font-body text-sm text-clark-accent">{t('searchUnavailable')}</p>
          </div>
        )}

        {/* ── PRE-SEARCH SUGGESTIONS (no query typed yet) ────────── */}
        {!query && (
          <div className="space-y-8">
            {/* Trending Tracks from local catalog */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-clark-gold" />
                <h2 className="font-condensed text-xs tracking-widest text-clark-gold uppercase">
                  Trending Tracks
                </h2>
              </div>
              {discoveryLoading ? (
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
              ) : trendingTracks.length === 0 ? (
                <p className="font-body text-sm text-clark-text-muted/50">
                  No trending tracks in the catalog yet.
                </p>
              ) : (
                <div className="space-y-0.5">
                  {trendingTracks.map((item, idx) => renderDiscoveryTrackCard(item, idx))}
                </div>
              )}
            </section>

            {/* Top Artists from local catalog */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Mic2 className="w-5 h-5 text-clark-gold" />
                <h2 className="font-condensed text-xs tracking-widest text-clark-gold uppercase">
                  Top Artists
                </h2>
              </div>
              {discoveryLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex flex-col items-center animate-pulse p-4">
                      <div className="w-24 h-24 rounded-full bg-clark-bg-secondary" />
                      <div className="h-4 w-20 bg-clark-bg-secondary rounded mt-3" />
                      <div className="h-3 w-12 bg-clark-bg-secondary rounded mt-1" />
                    </div>
                  ))}
                </div>
              ) : topArtists.length === 0 ? (
                <p className="font-body text-sm text-clark-text-muted/50">
                  No artists in the catalog yet.
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                  {topArtists.map((item) => renderDiscoveryArtistCard(item))}
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
        {isSearching && (searchLoading || searchResults) && (
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
              {searchResults && <span className="text-xs opacity-70">({trackResults.length})</span>}
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
              {searchResults && <span className="text-xs opacity-70">({artistResults.length})</span>}
            </button>
            <button
              onClick={() => setActiveTab('albums')}
              className={cn(
                'flex items-center gap-2 px-5 py-2.5 rounded-full font-body font-medium text-sm transition-all duration-200',
                activeTab === 'albums'
                  ? 'bg-clark-accent text-white shadow-lg shadow-clark-accent/30'
                  : 'bg-clark-bg-secondary text-clark-text-muted hover:text-clark-text-primary hover:bg-clark-bg-card',
              )}
            >
              <Disc className="w-4 h-4" />
              Albums
              {searchResults && <span className="text-xs opacity-70">({albumResults.length})</span>}
            </button>
          </div>
        )}

        {/* Skeleton loaders for search */}
        {searchLoading && isSearching && (
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

        {/* Search results — Tracks */}
        {!searchLoading && activeTab === 'tracks' && isSearching && (
          <div className="space-y-0.5">
            {trackResults.length === 0 && searchResults ? (
              <p className="font-body text-clark-text-muted text-center py-12">
                {t('noTracksFound')} &quot;{debouncedQuery}&quot;
              </p>
            ) : (
              trackResults.map((result) => renderSearchTrackCard(result))
            )}
          </div>
        )}

        {/* Search results — Artists */}
        {!searchLoading && activeTab === 'artists' && isSearching && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {artistResults.length === 0 && searchResults ? (
              <p className="font-body text-clark-text-muted text-center py-12 col-span-full">
                {t('noArtistsFound')} &quot;{debouncedQuery}&quot;
              </p>
            ) : (
              artistResults.map((result) => renderSearchArtistCard(result))
            )}
          </div>
        )}

        {/* Search results — Albums */}
        {!searchLoading && activeTab === 'albums' && isSearching && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {albumResults.length === 0 && searchResults ? (
              <p className="font-body text-clark-text-muted text-center py-12 col-span-full">
                No albums found for &quot;{debouncedQuery}&quot;
              </p>
            ) : (
              albumResults.map((result) => renderSearchAlbumCard(result))
            )}
          </div>
        )}
      </div>
    </AppShell>
  )
}
