'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { AppShell } from '@/components/layout/AppShell'
import { useTranslation } from '@/hooks/useTranslation'
import { usePlayerStore } from '@/store/playerStore'
import { useDiscovery, useCatalogSearch, useCatalogSearchSuggestions } from '@/hooks/useCatalog'
import { cn } from '@/lib/utils'
import { TrackLine } from '@/components/track/TrackLine'
import type {
  CatalogTrackItem,
  CatalogArtistItem,
  CatalogArtistSummary,
  CatalogAlbumSummary,
  CatalogGenreResponse,
  CatalogSearchSuggestions,
  Track,
} from '@/types'
import {
  Search as SearchIcon,
  Music,
  Mic2,
  Disc,
  Loader2,
  AlertCircle,
  TrendingUp,
  ListMusic,
} from 'lucide-react'

// ── Helpers ─────────────────────────────────────────────────────────────

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

// ── Sub-components ──────────────────────────────────────────────────────

function ArtistCard({ artist }: { artist: CatalogArtistSummary }) {
  return (
    <Link
      href={`/artists/${artist.id}?name=${encodeURIComponent(artist.name)}`}
      className="group flex flex-col items-center p-4 rounded-2xl bg-clark-bg-secondary/40 hover:bg-clark-bg-secondary transition-all duration-200 hover:scale-[1.02] border border-transparent hover:border-clark-steel/20"
    >
      <div className="relative w-24 h-24 rounded-full overflow-hidden mb-3 bg-gradient-to-br from-clark-steel to-clark-bg-card shadow-lg group-hover:shadow-xl transition-shadow">
        {artist.image_url ? (
          <img
            src={artist.image_url}
            alt={artist.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-display text-3xl text-white/30">
              {artist.name.charAt(0)}
            </span>
          </div>
        )}
      </div>

      <p className="font-body font-semibold text-sm text-center text-clark-text-primary truncate w-full">
        {artist.name}
      </p>

      <div className="flex items-center gap-2 mt-1">
        {artist.is_brazilian && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-condensed font-bold uppercase tracking-wider bg-green-900/40 text-green-400 border border-green-700/30">
            🇧🇷 BR
          </span>
        )}
        {artist.country && !artist.is_brazilian && (
          <span className="text-[11px] font-body text-clark-text-muted/60 uppercase">
            {artist.country}
          </span>
        )}
        {artist.popularity > 0 && (
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 rounded-full bg-clark-gold/60" />
            <span className="text-[11px] font-body text-clark-text-muted/50">
              {artist.popularity}%
            </span>
          </div>
        )}
      </div>

      {artist.genres.length > 0 && (
        <p className="font-body text-[11px] text-clark-text-muted/60 text-center mt-1 line-clamp-1 px-2">
          {artist.genres.slice(0, 3).join(', ')}
        </p>
      )}
    </Link>
  )
}

function AlbumCard({ album }: { album: CatalogAlbumSummary }) {
  return (
    <Link
      href={`/catalog/album/${album.id}`}
      className="group flex flex-col p-3 rounded-2xl bg-clark-bg-secondary/40 hover:bg-clark-bg-secondary transition-all duration-200 hover:scale-[1.02] border border-transparent hover:border-clark-steel/20"
    >
      <div className="relative aspect-square w-full rounded-lg overflow-hidden mb-3 bg-gradient-to-br from-clark-steel to-clark-bg-card shadow-lg group-hover:shadow-xl transition-shadow">
        {album.cover_url ? (
          <img
            src={album.cover_url}
            alt={album.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Disc className="w-10 h-10 text-white/30" />
          </div>
        )}
      </div>

      <p className="font-body font-semibold text-sm text-clark-text-primary truncate">
        {album.title}
      </p>

      <p className="font-body text-xs text-clark-text-muted/70 truncate mt-0.5">
        {album.artist_name}
      </p>

      {album.track_count > 0 && (
        <p className="font-condensed text-[11px] text-clark-text-muted/50 mt-1">
          {album.track_count} tracks
        </p>
      )}
    </Link>
  )
}

function GenreCard({ genre }: { genre: CatalogGenreResponse }) {
  return (
    <Link
      href={`/genres/${genre.slug}`}
      className="group relative flex flex-col justify-end p-4 rounded-2xl overflow-hidden min-h-[120px] border border-transparent hover:border-clark-steel/20 transition-all duration-200 hover:scale-[1.02]"
      style={{
        background: `linear-gradient(135deg, #1a1a2e, #16213e)`,
      }}
    >
      {genre.mosaic_images.length > 0 && (
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-0 opacity-30">
          {genre.mosaic_images.slice(0, 4).map((url, i) => (
            <div key={i} className="overflow-hidden">
              <img
                src={url}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      )}

      <div className="relative z-10">
        <p className="font-display text-lg font-bold text-white drop-shadow-lg">
          {genre.name}
        </p>
        {genre.artist_count > 0 && (
          <p className="font-condensed text-xs text-white/70 mt-1">
            {genre.artist_count} artists
          </p>
        )}
      </div>
    </Link>
  )
}

function SearchTrackRow({ track }: { track: CatalogTrackItem }) {
  const { setQueue } = usePlayerStore()

  function handlePlay() {
    const tracks = [catalogTrackToPlayerTrack(track)]
    setQueue(tracks, 0)
  }

  return (
    <TrackLine
      data={{
        id: track.id,
        title: track.title,
        artistName: track.artist_name,
        coverUrl: track.album_cover,
        previewUrl: track.preview_url,
        durationMs: track.duration_ms,
        popularity: track.popularity,
        albumTitle: track.album_title,
      }}
      variant="row"
      onPlay={handlePlay}
      showDuration={true}
      showPopularity={true}
      showPreviewIndicator={!!track.preview_url}
    />
  )
}

// ── Tab config ──────────────────────────────────────────────────────────

type SearchTab = 'all' | 'tracks' | 'artists' | 'albums' | 'genres'

const TABS: { key: SearchTab; label: string; icon: React.ReactNode }[] = [
  { key: 'all', label: 'Todos', icon: null },
  { key: 'tracks', label: 'Músicas', icon: <Music className="w-4 h-4" /> },
  { key: 'artists', label: 'Artistas', icon: <Mic2 className="w-4 h-4" /> },
  { key: 'albums', label: 'Álbuns', icon: <Disc className="w-4 h-4" /> },
  { key: 'genres', label: 'Gêneros', icon: <ListMusic className="w-4 h-4" /> },
]

// ── Skeleton ────────────────────────────────────────────────────────────

function SearchSkeleton() {
  return (
    <div className="space-y-4">
      {/* Track skeletons */}
      <div className="space-y-1">
        <div className="h-4 w-24 bg-clark-bg-card rounded mb-3" />
        {Array.from({ length: 3 }).map((_, i) => (
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

      {/* Card grid skeletons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-square rounded-lg bg-clark-bg-secondary mb-2" />
            <div className="h-4 bg-clark-bg-secondary rounded w-3/4 mb-1" />
            <div className="h-3 bg-clark-bg-secondary rounded w-1/2" />
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Empty State ─────────────────────────────────────────────────────────

function EmptyState({ query: q }: { query: string }) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="w-20 h-20 rounded-full bg-clark-bg-secondary/60 flex items-center justify-center mb-6">
        <SearchIcon className="w-8 h-8 text-clark-text-muted/40" />
      </div>
      <p className="font-body text-lg text-clark-text-primary font-medium">
        {t('noTracksFound')}
      </p>
      <p className="font-body text-sm text-clark-text-muted/60 mt-2 text-center max-w-md">
        {t('noPlaylistsFound')}{' '}
        &quot;<span className="text-clark-text-primary/80 font-medium">{q}</span>&quot;
      </p>
      <p className="font-body text-xs text-clark-text-muted/40 mt-4">
        {t('startTyping')}
      </p>
    </div>
  )
}

// ── Section shell ──────────────────────────────────────────────────────

function Section({
  title,
  icon,
  children,
}: {
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
}) {
  if (!children) return null
  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        {icon && <span className="text-clark-gold">{icon}</span>}
        <h2 className="font-condensed text-xs tracking-widest text-clark-gold uppercase">
          {title}
        </h2>
      </div>
      {children}
    </section>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────

export default function SearchPage() {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [activeTab, setActiveTab] = useState<SearchTab>('all')
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

  // Instant suggestions for the dropdown (query >= 1 char, live — NOT debounced)
  const { data: suggestions } = useCatalogSearchSuggestions(query)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchContainerRef = useRef<HTMLDivElement>(null)

  // Close suggestions on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Catalog search (query >= 2 chars)
  const { data: searchResults, isLoading: searchLoading, isError: searchError } = useCatalogSearch(debouncedQuery)
  const isSearching = debouncedQuery.length >= 2

  // Pull data from the correct backend contract fields
  const trackResults = searchResults?.tracks ?? []
  const artistResults = searchResults?.artists ?? []
  const albumResults = searchResults?.albums ?? []
  const genreResults = searchResults?.genres ?? []

  // Determine if we have any results at all
  const hasAnyResults =
    trackResults.length > 0 ||
    artistResults.length > 0 ||
    albumResults.length > 0 ||
    genreResults.length > 0

  function handleDiscoveryPlay(item: CatalogTrackItem, idx: number) {
    const tracks = (discovery?.trending_tracks ?? []).map((t) => catalogTrackToPlayerTrack(t))
    setQueue(tracks, idx)
  }

  // ── Discovery renderers (pre-search, no query) ──────────────────

  function renderDiscoveryTrackCard(item: CatalogTrackItem, idx: number) {
    return (
      <TrackLine
        key={item.id}
        data={{
          id: item.id,
          title: item.title,
          artistName: item.artist_name,
          coverUrl: item.album_cover,
          previewUrl: item.preview_url,
          durationMs: item.duration_ms,
          popularity: item.popularity,
          albumTitle: item.album_title,
        }}
        variant="row"
        onPlay={() => handleDiscoveryPlay(item, idx)}
        showPopularity={true}
        showDuration={true}
        showPreviewIndicator={true}
      />
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
        {(item.genres ?? []).length > 0 && (
          <p className="font-body text-xs text-clark-text-muted/70 text-center mt-1 line-clamp-1">
            {(item.genres ?? []).slice(0, 3).join(', ')}
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

  // ── Search results sections ─────────────────────────────────────

  function renderArtistSection(artists: CatalogArtistSummary[]) {
    if (artists.length === 0) return null
    return (
      <Section title={t('artistsTab')} icon={<Mic2 className="w-4 h-4" />}>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {artists.map((artist) => (
            <ArtistCard key={artist.id} artist={artist} />
          ))}
        </div>
      </Section>
    )
  }

  function renderAlbumSection(albums: CatalogAlbumSummary[]) {
    if (albums.length === 0) return null
    return (
      <Section title="Álbuns" icon={<Disc className="w-4 h-4" />}>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {albums.map((album) => (
            <AlbumCard key={album.id} album={album} />
          ))}
        </div>
      </Section>
    )
  }

  function renderTrackSection(tracks: CatalogTrackItem[]) {
    if (tracks.length === 0) return null
    return (
      <Section title={t('tracksTab')} icon={<Music className="w-4 h-4" />}>
        <div className="space-y-0.5">
          {tracks.map((track) => (
            <SearchTrackRow key={track.id} track={track} />
          ))}
        </div>
      </Section>
    )
  }

  function renderGenreSection(genres: CatalogGenreResponse[]) {
    if (genres.length === 0) return null
    return (
      <Section title="Gêneros" icon={<ListMusic className="w-4 h-4" />}>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {genres.map((genre) => (
            <GenreCard key={genre.id} genre={genre} />
          ))}
        </div>
      </Section>
    )
  }

  // ── Tab counts ──────────────────────────────────────────────────

  const tabCounts: Record<SearchTab, number> = {
    all: hasAnyResults ? 1 : 0,
    tracks: trackResults.length,
    artists: artistResults.length,
    albums: albumResults.length,
    genres: genreResults.length,
  }

  // ── Render ──────────────────────────────────────────────────────

  const trendingTracks = discovery?.trending_tracks ?? []
  const topArtists = discovery?.top_artists ?? []

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Page title */}
        <h1 className="font-display text-3xl tracking-widest uppercase">{t('search')}</h1>

        {/* Search input + suggestions dropdown */}
        <div className="flex justify-center" ref={searchContainerRef}>
          <div className="relative w-full max-w-2xl">
            <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-clark-text-muted" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              placeholder={t('searchGlobalPlaceholder')}
              className="w-full h-14 pl-14 pr-12 rounded-2xl bg-clark-bg-secondary text-clark-text-primary border border-clark-steel/30 font-body text-lg focus:outline-none focus:ring-2 focus:ring-clark-gold focus:border-transparent transition-shadow"
              autoFocus
            />
            {searchLoading && (
              <Loader2 className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-clark-gold animate-spin" />
            )}

            {/* ── Suggestions dropdown ───────────────────────────── */}
            {showSuggestions && query.length >= 1 && suggestions && (
              <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl bg-clark-bg-card border border-clark-steel/20 shadow-2xl overflow-hidden z-50 transition-opacity">
                {/* Artists */}
                {suggestions.artists.length > 0 && (
                  <div className="p-3">
                    <p className="font-condensed text-[11px] tracking-widest uppercase text-clark-text-muted/60 mb-2 px-2">
                      Artistas
                    </p>
                    {suggestions.artists.map((artist) => (
                      <Link
                        key={artist.id}
                        href={`/artists/${artist.id}?name=${encodeURIComponent(artist.name)}`}
                        onClick={() => setShowSuggestions(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-clark-bg-secondary/80 transition-colors"
                      >
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-clark-steel/30 flex-shrink-0">
                          {artist.image_url ? (
                            <img src={artist.image_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/40 text-sm font-display">
                              {artist.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <span className="font-body text-sm text-clark-text-primary truncate">
                          {artist.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Albums */}
                {suggestions.albums.length > 0 && (
                  <div className="p-3 pt-0 border-t border-clark-steel/10">
                    <p className="font-condensed text-[11px] tracking-widest uppercase text-clark-text-muted/60 mb-2 px-2 pt-3">
                      Álbuns
                    </p>
                    {suggestions.albums.map((album) => (
                      <Link
                        key={album.id}
                        href={`/catalog/album/${album.id}`}
                        onClick={() => setShowSuggestions(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-clark-bg-secondary/80 transition-colors"
                      >
                        <div className="w-9 h-9 rounded overflow-hidden bg-clark-steel/30 flex-shrink-0">
                          {album.cover_url ? (
                            <img src={album.cover_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Disc className="w-4 h-4 text-white/30" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-body text-sm text-clark-text-primary truncate">{album.title}</p>
                          <p className="font-body text-xs text-clark-text-muted/60 truncate">{album.artist_name}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Tracks */}
                {suggestions.tracks.length > 0 && (
                  <div className="p-3 pt-0 border-t border-clark-steel/10">
                    <p className="font-condensed text-[11px] tracking-widest uppercase text-clark-text-muted/60 mb-2 px-2 pt-3">
                      Músicas
                    </p>
                    {suggestions.tracks.map((track) => (
                      <Link
                        key={track.id}
                        href={`/music/track/${track.id}`}
                        onClick={() => setShowSuggestions(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-clark-bg-secondary/80 transition-colors"
                      >
                        <div className="w-9 h-9 rounded overflow-hidden bg-clark-steel/30 flex-shrink-0">
                          {track.cover_url ? (
                            <img src={track.cover_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Music className="w-4 h-4 text-white/30" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-body text-sm text-clark-text-primary truncate">{track.title}</p>
                          <p className="font-body text-xs text-clark-text-muted/60 truncate">{track.artist_name}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {/* No suggestions — descriptive message */}
                {suggestions.artists.length === 0 &&
                  suggestions.albums.length === 0 &&
                  suggestions.tracks.length === 0 && (
                    <div className="p-6 text-center">
                      <div className="w-12 h-12 rounded-full bg-clark-bg-secondary/40 flex items-center justify-center mx-auto mb-3">
                        <SearchIcon className="w-5 h-5 text-clark-text-muted/30" />
                      </div>
                      <p className="font-body text-sm text-clark-text-muted/70">
                        Não foi possível encontrar{' '}
                        <span className="text-clark-text-primary/80 font-medium">
                          &ldquo;{query}&rdquo;
                        </span>
                      </p>
                      <p className="font-body text-xs text-clark-text-muted/40 mt-2">
                        Verifique a ortografia ou tente termos mais gerais.
                      </p>
                    </div>
                  )}
              </div>
            )}
          </div>
        </div>

        {/* ── Blurrable content below search bar ────────────────────── */}
        <div
          className={cn(
            'space-y-6 transition-all duration-300',
            showSuggestions && query.length >= 1 && 'blur-sm pointer-events-none select-none',
          )}
        >
        {/* ── Error state ────────────────────────────────────────── */}
        {searchError && isSearching && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-clark-accent/10 border border-clark-accent/30">
            <AlertCircle className="w-5 h-5 text-clark-accent flex-shrink-0" />
            <p className="font-body text-sm text-clark-accent">{t('searchUnavailable')}</p>
          </div>
        )}

        {/* ── PRE-SEARCH SUGGESTIONS (no query typed yet) ────────── */}
        {!query && (
          <div className="space-y-8">
            {/* Trending Tracks */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-clark-gold" />
                <h2 className="font-condensed text-xs tracking-widest text-clark-gold uppercase">
                  {t('discoverNewMusic')}
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
                  {t('noTracksFound')}
                </p>
              ) : (
                <div className="space-y-0.5">
                  {trendingTracks.map((item, idx) => renderDiscoveryTrackCard(item, idx))}
                </div>
              )}
            </section>

            {/* Top Artists */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Mic2 className="w-5 h-5 text-clark-gold" />
                <h2 className="font-condensed text-xs tracking-widest text-clark-gold uppercase">
                  {t('popularArtists')}
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
                  {t('noArtistsFound')}
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                  {topArtists.map((item) => renderDiscoveryArtistCard(item))}
                </div>
              )}
            </section>

            {/* Search hint */}
            <p className="text-center font-body text-sm text-clark-text-muted/50">
              {t('searchAcrossWebDesc')}
            </p>
          </div>
        )}

        {/* ── SEARCH MODE (query typed) ──────────────────────────── */}

        {/* Tabs */}
        {isSearching && (searchLoading || searchResults) && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {TABS.map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={cn(
                  'flex items-center gap-2 px-5 py-2.5 rounded-full font-body font-medium text-sm transition-all duration-200 whitespace-nowrap flex-shrink-0',
                  activeTab === key
                    ? 'bg-clark-accent text-white shadow-lg shadow-clark-accent/30'
                    : 'bg-clark-bg-secondary text-clark-text-muted hover:text-clark-text-primary hover:bg-clark-bg-card',
                )}
              >
                {icon}
                {label}
                {tabCounts[key] > 0 && key !== 'all' && (
                  <span className="text-xs opacity-70">({tabCounts[key]})</span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* ── Loading skeleton ───────────────────────────────────── */}
        {searchLoading && isSearching && <SearchSkeleton />}

        {/* ── Empty state ────────────────────────────────────────── */}
        {!searchLoading && isSearching && searchResults && !hasAnyResults && (
          <EmptyState query={debouncedQuery} />
        )}

        {/* ── Results ────────────────────────────────────────────── */}
        {!searchLoading && isSearching && hasAnyResults && (
          <div className="space-y-10">
            {/* ── TAB: All ─────────────────────────────────────── */}
            {activeTab === 'all' && (
              <>
                {renderArtistSection(artistResults)}
                {renderAlbumSection(albumResults)}
                {renderTrackSection(trackResults)}
                {renderGenreSection(genreResults)}
              </>
            )}

            {/* ── TAB: Artists ─────────────────────────────────── */}
            {activeTab === 'artists' && (
              artistResults.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {artistResults.map((artist) => (
                    <ArtistCard key={artist.id} artist={artist} />
                  ))}
                </div>
              ) : (
                <EmptyState query={debouncedQuery} />
              )
            )}

            {/* ── TAB: Albums ──────────────────────────────────── */}
            {activeTab === 'albums' && (
              albumResults.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {albumResults.map((album) => (
                    <AlbumCard key={album.id} album={album} />
                  ))}
                </div>
              ) : (
                <EmptyState query={debouncedQuery} />
              )
            )}

            {/* ── TAB: Tracks ──────────────────────────────────── */}
            {activeTab === 'tracks' && (
              trackResults.length > 0 ? (
                <div className="space-y-0.5">
                  {trackResults.map((track) => (
                    <SearchTrackRow key={track.id} track={track} />
                  ))}
                </div>
              ) : (
                <EmptyState query={debouncedQuery} />
              )
            )}

            {/* ── TAB: Genres ──────────────────────────────────── */}
            {activeTab === 'genres' && (
              genreResults.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {genreResults.map((genre) => (
                    <GenreCard key={genre.id} genre={genre} />
                  ))}
                </div>
              ) : (
                <EmptyState query={debouncedQuery} />
              )
            )}
          </div>
        )}
        </div>
      </div>
    </AppShell>
  )
}
