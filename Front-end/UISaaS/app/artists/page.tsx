'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { AppShell } from '@/components/layout/AppShell'
import { useTranslation } from '@/hooks/useTranslation'
import { api } from '@/lib/api'
import { Music, Loader2, RefreshCw, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import type { CatalogArtistItem } from '@/types'

// ── Genre filter tabs — maps UI filter to catalog genre ─────────────────
type GenreTab = {
  key: string
  label: string
  genre: string | null  // null = all artists
}

const GENRE_TABS: GenreTab[] = [
  { key: 'all', label: 'All', genre: null },
  { key: 'brazilian', label: 'Brazilian', genre: 'brazilian' },
  { key: 'pop', label: 'Pop', genre: 'pop' },
  { key: 'rock', label: 'Rock', genre: 'rock' },
  { key: 'hip-hop', label: 'Hip-Hop', genre: 'hip-hop' },
  { key: 'rnb', label: 'R&B', genre: 'rnb' },
  { key: 'electronic', label: 'Electronic', genre: 'electronic' },
  { key: 'jazz', label: 'Jazz', genre: 'jazz' },
  { key: 'latin', label: 'Latin', genre: 'latin' },
  { key: 'sertanejo', label: 'Sertanejo', genre: 'sertanejo' },
  { key: 'mpb', label: 'MPB', genre: 'mpb' },
  { key: 'samba', label: 'Samba', genre: 'samba' },
  { key: 'rap', label: 'Rap', genre: 'rap' },
  { key: 'indie', label: 'Indie', genre: 'indie' },
  { key: 'country', label: 'Country', genre: 'country' },
  { key: 'classical', label: 'Classical', genre: 'classical' },
  { key: 'gospel', label: 'Gospel', genre: 'gospel' },
  { key: 'blues', label: 'Blues', genre: 'blues' },
  { key: 'soul', label: 'Soul', genre: 'soul' },
]

const PAGE_SIZE = 30

export default function ArtistsPage() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<string>('all')
  const [artists, setArtists] = useState<CatalogArtistItem[]>([])
  const [totalArtists, setTotalArtists] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const observerRef = useRef<HTMLDivElement>(null)
  const offsetRef = useRef(0)

  // ── Load artists ──────────────────────────────────────────────────────
  const loadArtists = useCallback(async (tab: GenreTab, reset: boolean) => {
    if (reset) {
      setIsLoading(true)
      offsetRef.current = 0
    } else {
      setLoadingMore(true)
    }

    setLoadError(false)

    try {
      const data = await api.catalogArtists(PAGE_SIZE, offsetRef.current)

      const filtered = tab.genre
        ? data.items.filter((a) => a.genres.some((g) => g.toLowerCase() === tab.genre?.toLowerCase()))
        : data.items

      if (reset) {
        setArtists(filtered)
      } else {
        setArtists((prev) => [...prev, ...filtered])
      }

      setTotalArtists(data.total)
      offsetRef.current += PAGE_SIZE
      setHasMore(offsetRef.current < data.total)
    } catch {
      setLoadError(true)
    } finally {
      setIsLoading(false)
      setLoadingMore(false)
    }
  }, [])

  // ── Tab switch ────────────────────────────────────────────────────────
  useEffect(() => {
    const tab = GENRE_TABS.find((t) => t.key === activeTab) ?? GENRE_TABS[0]
    loadArtists(tab, true)
  }, [activeTab, loadArtists])

  // ── Infinite scroll with Intersection Observer ────────────────────────
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !isLoading && !loadingMore) {
          const tab = GENRE_TABS.find((t) => t.key === activeTab) ?? GENRE_TABS[0]
          loadArtists(tab, false)
        }
      },
      { threshold: 0.1 },
    )

    if (observerRef.current) {
      observer.observe(observerRef.current)
    }

    return () => observer.disconnect()
  }, [hasMore, isLoading, loadingMore, activeTab, loadArtists])

  return (
    <AppShell>
      <div className="space-y-6">
        <h1 className="font-display text-3xl tracking-widest uppercase">{t('artists')}</h1>

        {/* Genre tabs — horizontal scroll on mobile */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
          {GENRE_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex-shrink-0 px-4 py-2 rounded-full font-body text-sm transition-all duration-200',
                'border min-w-[44px] min-h-[44px] flex items-center justify-center',
                activeTab === tab.key
                  ? 'bg-clark-accent text-white border-clark-accent shadow-glow-hero'
                  : 'bg-clark-bg-secondary text-clark-text-muted border-clark-steel/30 hover:text-clark-text-primary hover:border-clark-gold/40',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Artist stats */}
        {!isLoading && !loadError && (
          <p className="font-body text-sm text-clark-text-muted">
            {totalArtists.toLocaleString()} {t('artists').toLowerCase()} found
          </p>
        )}

        {/* Artist grid */}
        {isLoading ? (
          <div role="status" aria-label="Loading artists" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="p-4 rounded-xl bg-clark-bg-secondary animate-pulse">
                <div className="w-full aspect-square rounded-full bg-clark-bg-card mx-auto" />
                <div className="h-4 bg-clark-bg-card rounded mt-3 w-3/4 mx-auto" />
                <div className="h-3 bg-clark-bg-card rounded mt-1 w-1/2 mx-auto" />
              </div>
            ))}
            <span className="sr-only">Loading artists...</span>
          </div>
        ) : loadError ? (
          <div className="flex flex-col items-center justify-center py-12 px-6 rounded-2xl bg-clark-bg-secondary border border-clark-steel/20 text-center">
            <div className="w-12 h-12 rounded-full bg-clark-danger/10 flex items-center justify-center mb-4">
              <RefreshCw className="w-6 h-6 text-clark-danger" />
            </div>
            <p className="font-display text-lg tracking-wider text-clark-text-primary mb-2">
              Failed to load artists
            </p>
            <p className="font-body text-sm text-clark-text-muted mb-4">
              The catalog is still being populated. Try the search page instead.
            </p>
            <Link
              href="/search"
              className="flex items-center gap-2 px-4 py-2 bg-clark-bg-card hover:bg-clark-steel/20 font-body text-sm text-clark-text-primary rounded-lg transition-colors border border-clark-steel/30"
            >
              Go to Search
            </Link>
          </div>
        ) : artists.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Music className="w-12 h-12 text-clark-text-muted/30 mb-4" />
            <p className="font-body text-clark-text-muted">
              No artists found for this genre in the catalog yet.
            </p>
            <p className="font-body text-sm text-clark-text-muted/50 mt-1">
              Try running the catalog ingestion or check back later.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {artists.map((artist) => (
                <Link
                  key={artist.id}
                  href={`/artists/${artist.id}?name=${encodeURIComponent(artist.name)}`}
                  className="group p-4 rounded-xl bg-clark-bg-secondary hover:bg-clark-bg-card transition-all duration-200 hover:scale-[1.02] border border-transparent hover:border-clark-steel/20 text-center"
                >
                  {/* Artist avatar */}
                  <div className="relative w-full aspect-square rounded-full overflow-hidden bg-gradient-to-br from-clark-steel to-clark-bg-card shadow-md mx-auto max-w-[160px]">
                    {artist.image_url ? (
                      <Image
                        src={artist.image_url}
                        alt={artist.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                        className="object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music className="w-10 h-10 text-white/20" />
                      </div>
                    )}
                  </div>

                  <h3 className="font-body font-semibold text-sm text-clark-text-primary mt-3 truncate">
                    {artist.name}
                  </h3>

                  {/* Genres tags */}
                  {artist.genres.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-1 mt-1">
                      {artist.genres.slice(0, 2).map((g) => (
                        <span
                          key={g}
                          className="px-1.5 py-0.5 rounded text-[10px] font-condensed uppercase tracking-wider bg-clark-gold/10 text-clark-gold"
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Track count */}
                  <p className="font-body text-xs text-clark-text-muted/60 mt-1">
                    {artist.track_count > 0
                      ? `${artist.track_count} ${t('tracks')}`
                      : `${artist.popularity > 0 ? artist.popularity : '--'} popularity`}
                  </p>
                </Link>
              ))}
            </div>

            {/* Infinite scroll sentinel */}
            <div ref={observerRef} className="flex items-center justify-center py-8">
              {loadingMore && (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 text-clark-gold animate-spin" />
                  <span className="font-body text-sm text-clark-text-muted">Loading more artists...</span>
                </div>
              )}
              {!hasMore && artists.length > 0 && (
                <div className="flex items-center gap-2 text-clark-text-muted/40">
                  <ChevronDown className="w-4 h-4" />
                  <span className="font-body text-xs">All {totalArtists} artists loaded</span>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AppShell>
  )
}
