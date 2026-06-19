'use client'

import Link from 'next/link'
import { AppShell } from '@/components/layout/AppShell'
import { GenreMosaic } from '@/components/GenreMosaic'
import { useTranslation } from '@/hooks/useTranslation'
import { useGenres } from '@/hooks/useCatalog'
import { getCachedCatalogData, setCachedCatalogData } from '@/lib/catalogCache'
import { getGenreImage, getGenreGradient } from '@/lib/genre-image-map'
import { cn } from '@/lib/utils'
import type { CatalogGenreItem } from '@/types'
import Image from 'next/image'
import { Music } from 'lucide-react'

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

const CACHE_KEY = 'genres'

export default function GenresPage() {
  const { t } = useTranslation()

  const restoredFromCache = getCachedCatalogData<CatalogGenreItem[]>(CACHE_KEY)
  const {
    data: genres,
    isLoading,
    isError,
  } = useGenres()

  const displayGenres = genres ?? restoredFromCache ?? []

  if (genres && genres.length > 0) {
    setCachedCatalogData(CACHE_KEY, genres)
  }

  const showSkeleton = isLoading && displayGenres.length === 0

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
        ) : displayGenres.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-6 rounded-2xl bg-clark-bg-secondary border border-clark-steel/20 text-center">
            <div className="w-12 h-12 rounded-full bg-clark-bg-card flex items-center justify-center mb-4">
              <Music className="w-6 h-6 text-clark-text-muted" />
            </div>
            <p className="font-display text-lg tracking-wider text-clark-text-primary mb-1">No genres yet</p>
            <p className="font-body text-sm text-clark-text-muted">Catalog data will appear here once available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[120px]">
            {displayGenres.map((genre, i) => {
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
                      style={{ width: '55%', height: '75%' }}
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

        {/* Subtle stale-data indicator when showing cached results after an error */}
        {isError && displayGenres.length > 0 && (
          <p className="text-center font-body text-xs text-clark-text-muted/40">
            Showing cached genres — refresh may be unavailable
          </p>
        )}
      </div>
    </AppShell>
  )
}
