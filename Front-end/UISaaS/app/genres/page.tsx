'use client'

import Link from 'next/link'
import { AppShell } from '@/components/layout/AppShell'
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
                  {/* Genre cover image (local) or gradient fallback */}
                  {localImage ? (
                    <Image
                      src={localImage}
                      alt={genre.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  ) : (
                    <div className={cn('absolute inset-0 bg-gradient-to-br', gradient.from, gradient.to)} />
                  )}
                  {/* Gradient overlay for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                  <div className="relative z-10 p-5 flex flex-col justify-end h-full">
                    <h2 className="font-display text-2xl tracking-widest uppercase text-white drop-shadow-lg">{genre.name}</h2>
                    <p className="font-condensed text-xs uppercase tracking-wider text-white/70 mt-1">
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
