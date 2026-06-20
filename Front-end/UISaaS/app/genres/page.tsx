'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { GenreMosaic } from '@/components/GenreMosaic'
import { useTranslation } from '@/hooks/useTranslation'
import { useGenres } from '@/hooks/useCatalog'
import { getGenreImage, getGenreGradient } from '@/lib/genre-image-map'
import { cn } from '@/lib/utils'
import type { CatalogGenreItem } from '@/types'
import Image from 'next/image'
import { Music } from 'lucide-react'

const PAGE_SIZE = 30

const mosaicLayout = [
  'col-span-2 row-span-2',
  'col-span-1 row-span-2',
  'col-span-1 row-span-1',
  'col-span-1 row-span-1',
  'col-span-2 row-span-1',
  'col-span-1 row-span-1',
  'col-span-2 row-span-1',
  'col-span-1 row-span-1',
  'col-span-1 row-span-1',
  'col-span-1 row-span-2',
  'col-span-1 row-span-1',
  'col-span-1 row-span-1',
  'col-span-1 row-span-1',
  'col-span-1 row-span-1',
  'col-span-1 row-span-1',
  'col-span-1 row-span-1',
  'col-span-1 row-span-1',
  'col-span-1 row-span-1',
  'col-span-1 row-span-1',
]

export default function GenresPage() {
  const { t } = useTranslation()
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGenres()

  // Flatten all pages into a single array
  const genres: CatalogGenreItem[] = data?.pages.flatMap((p) => p.items) ?? []

  // ── IntersectionObserver for scroll infinite ─────────────────────────
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { rootMargin: '400px' },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const showSkeleton = isLoading && genres.length === 0

  return (
    <AppShell>
      <div className="space-y-6">
        <h1 className="font-display text-3xl tracking-widest uppercase">{t('browseByGenre')}</h1>

        {showSkeleton ? (
          <div role="status" aria-label="Loading genres" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[120px]">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'rounded-xl bg-clark-bg-secondary animate-pulse',
                  mosaicLayout[i % mosaicLayout.length],
                )}
              />
            ))}
            <span className="sr-only">Loading genres...</span>
          </div>
        ) : genres.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-6 rounded-2xl bg-clark-bg-secondary border border-clark-steel/20 text-center">
            <div className="w-12 h-12 rounded-full bg-clark-bg-card flex items-center justify-center mb-4">
              <Music className="w-6 h-6 text-clark-text-muted" />
            </div>
            <p className="font-display text-lg tracking-wider text-clark-text-primary mb-1">No genres yet</p>
            <p className="font-body text-sm text-clark-text-muted">Catalog data will appear here once available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[120px]">
            {genres.map((genre, i) => {
              const layoutIdx = i % mosaicLayout.length
              const gradient = getGenreGradient(genre.slug)
              const localImage = getGenreImage(genre.slug)
              return (
                <Link
                  key={genre.slug}
                  href={`/genres/${genre.slug}`}
                  className={cn(
                    'relative rounded-xl overflow-hidden group transition-transform hover:scale-[1.02]',
                    mosaicLayout[layoutIdx],
                  )}
                >
                  {/* ── Solid background layer ─────────────────────────── */}
                  <div className={cn('absolute inset-0 bg-gradient-to-br', gradient.from, gradient.to)} />

                  {/* ── Mosaic at bottom-right (when images available) ─── */}
                  {genre.mosaic_images && genre.mosaic_images.length > 0 ? (
                    <div
                      className="absolute bottom-0 right-0 z-0"
                      style={{ width: '82%', height: '92%' }}
                    >
                      <GenreMosaic
                        images={genre.mosaic_images}
                        genreName={genre.name}
                        size="100%"
                      />
                    </div>
                  ) : localImage ? (
                    <Image
                      src={localImage}
                      alt={genre.name}
                      fill
                      className="object-cover z-0"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  ) : null}

                  {/* ── Title + track count at top-left ────────────────── */}
                  <div className="absolute top-0 left-0 z-10 p-3 pr-16 max-w-full">
                    <h3 className="text-white font-bold leading-tight line-clamp-2 drop-shadow-lg"
                        style={{ fontSize: 'clamp(0.85rem, 1.5vw, 1rem)' }}>
                      {genre.name}
                    </h3>
                    <p className="font-condensed text-[10px] uppercase tracking-wider text-white/70 mt-1">
                      {genre.track_count.toLocaleString()} {t('tracks')}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* Sentinel element for IntersectionObserver */}
        {genres.length > 0 && (
          <div
            ref={sentinelRef}
            className="w-full h-4"
            aria-hidden="true"
          />
        )}

        {/* Loading more indicator */}
        {isFetchingNextPage && (
          <div className="flex justify-center py-4">
            <div className="w-6 h-6 rounded-full border-2 border-clark-gold border-t-transparent animate-spin" />
          </div>
        )}

        {/* Error with stale data */}
        {isError && genres.length > 0 && (
          <p className="text-center font-body text-xs text-clark-text-muted/40">
            Failed to load more genres — scroll to retry
          </p>
        )}
      </div>
    </AppShell>
  )
}
