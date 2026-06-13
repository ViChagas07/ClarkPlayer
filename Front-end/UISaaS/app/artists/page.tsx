'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import Link from 'next/link'
import { AppShell } from '@/components/layout/AppShell'
import { useTranslation } from '@/hooks/useTranslation'
import { useInfiniteArtists, useGenres } from '@/hooks/useCatalog'
import { getCachedCatalogData, setCachedCatalogData } from '@/lib/catalogCache'
import { Music, Loader2, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import type { CatalogArtistItem } from '@/types'

type GenreTab = {
  key: string
  label: string
  genre: string | null
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

const CACHE_KEY = 'all_artists'

export default function ArtistsPage() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<string>('all')
  const observerRef = useRef<HTMLDivElement>(null)

  const restoredFromCache = getCachedCatalogData<CatalogArtistItem[]>(CACHE_KEY)
  const previousDataRef = useRef<CatalogArtistItem[]>(restoredFromCache ?? [])

  useGenres()

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteArtists(30)

  const allArtists = useMemo(() => {
    if (data) {
      const items = data.pages.flatMap((page) => page.items)
      previousDataRef.current = items
      return items
    }
    return previousDataRef.current
  }, [data])

  useEffect(() => {
    if (allArtists.length > 0 && data) {
      setCachedCatalogData(CACHE_KEY, allArtists)
    }
  }, [allArtists, data])

  const tab = GENRE_TABS.find((t) => t.key === activeTab) ?? GENRE_TABS[0]

  const filteredArtists = useMemo(() => {
    if (!tab.genre) return allArtists
    const genreLower = tab.genre.toLowerCase()
    return allArtists.filter((a) =>
      a.genres.some((g) => g.toLowerCase() === genreLower),
    )
  }, [allArtists, tab.genre])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 0.1 },
    )

    if (observerRef.current) {
      observer.observe(observerRef.current)
    }

    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const showSkeleton = isLoading && allArtists.length === 0

  const totalCount = data?.pages[0]?.total ?? allArtists.length

  return (
    <AppShell>
      <div className="space-y-6">
        <h1 className="font-display text-3xl tracking-widest uppercase">{t('artists')}</h1>

        {/* Genre tabs — horizontal scroll on mobile */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
          {GENRE_TABS.map((gt) => (
            <button
              key={gt.key}
              onClick={() => setActiveTab(gt.key)}
              className={cn(
                'flex-shrink-0 px-4 py-2 rounded-full font-body text-sm transition-all duration-200',
                'border min-w-[44px] min-h-[44px] flex items-center justify-center',
                activeTab === gt.key
                  ? 'bg-clark-accent text-white border-clark-accent shadow-glow-hero'
                  : 'bg-clark-bg-secondary text-clark-text-muted border-clark-steel/30 hover:text-clark-text-primary hover:border-clark-gold/40',
              )}
            >
              {gt.label}
            </button>
          ))}
        </div>

        {/* Artist stats */}
        {!showSkeleton && (
          <p className="font-body text-sm text-clark-text-muted">
            {filteredArtists.length.toLocaleString()} {t('artists').toLowerCase()} found
          </p>
        )}

        {/* Artist grid */}
        {showSkeleton ? (
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
        ) : filteredArtists.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Music className="w-12 h-12 text-clark-text-muted/30 mb-4" />
            <p className="font-body text-clark-text-muted">
              No artists found for this genre yet.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {filteredArtists.map((artist) => (
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
              {isFetchingNextPage && (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 text-clark-gold animate-spin" />
                  <span className="font-body text-sm text-clark-text-muted">Loading more artists...</span>
                </div>
              )}
              {!hasNextPage && allArtists.length > 0 && (
                <div className="flex items-center gap-2 text-clark-text-muted/40">
                  <ChevronDown className="w-4 h-4" />
                  <span className="font-body text-xs">All {totalCount.toLocaleString()} artists loaded</span>
                </div>
              )}
            </div>
          </>
        )}

        {/* Subtle stale-data indicator when showing cached results after an error */}
        {isError && allArtists.length > 0 && (
          <p className="text-center font-body text-xs text-clark-text-muted/40">
            Showing cached catalog data — refresh may be unavailable
          </p>
        )}
      </div>
    </AppShell>
  )
}
