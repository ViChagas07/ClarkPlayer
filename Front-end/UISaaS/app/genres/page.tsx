'use client'

import Link from 'next/link'
import { useEffect, useRef, useMemo } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { GenreMosaic } from '@/components/GenreMosaic'
import { GenreSearchBar } from '@/components/search/GenreSearchBar'
import { useTranslation } from '@/hooks/useTranslation'
import { useGenres } from '@/hooks/useCatalog'
import { useGenreFilter } from '@/hooks/useGenreFilter'
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

// ── Genre Card ───────────────────────────────────────────────────

function GenreCard({
  genre,
  index,
  isHighlighted,
  isSearchActive,
}: {
  genre: CatalogGenreItem
  index: number
  isHighlighted: boolean
  isSearchActive: boolean
}) {
  const { t } = useTranslation()
  const layoutIdx = index % mosaicLayout.length
  const gradient = getGenreGradient(genre.slug)
  const localImage = getGenreImage(genre.slug)

  return (
    <Link
      key={genre.slug}
      href={`/genres/${genre.slug}`}
      className={cn(
        'relative rounded-xl overflow-hidden group transition-all duration-250 ease-out',
        mosaicLayout[layoutIdx],
        'animate-fade-in-scale',
        // ── Highlighted (matching) ────────────────────────
        isSearchActive && isHighlighted && [
          'z-10',
          'scale-[1.02]',
          'shadow-xl shadow-clark-accent/10',
          'ring-1 ring-clark-accent/20',
        ],
        // ── Non-matching (blurred out) ────────────────────
        isSearchActive && !isHighlighted && [
          'blur-[4px]',
          'opacity-25',
          'scale-[0.97]',
          'pointer-events-none',
          'select-none',
        ],
      )}
      style={{
        animationDelay: `${Math.min(index * 20, 250)}ms`,
        transitionProperty: 'filter, opacity, transform, box-shadow',
      }}
      aria-hidden={isSearchActive && !isHighlighted ? true : undefined}
      tabIndex={isSearchActive && !isHighlighted ? -1 : undefined}
    >
      {/* Solid background gradient */}
      <div className={cn('absolute inset-0 bg-gradient-to-br', gradient.from, gradient.to)} />

      {/* Mosaic at bottom-right */}
      {genre.mosaic_images && genre.mosaic_images.length > 0 ? (
        <div className="absolute bottom-0 right-0 z-0" style={{ width: '82%', height: '92%' }}>
          <GenreMosaic images={genre.mosaic_images} genreName={genre.name} size="100%" />
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

      {/* Title + track count */}
      <div className="absolute top-0 left-0 z-10 p-3 pr-16 max-w-full">
        <h3
          className="text-white font-bold leading-tight line-clamp-2 drop-shadow-lg"
          style={{ fontSize: 'clamp(0.85rem, 1.5vw, 1rem)' }}
        >
          {genre.name}
        </h3>
        <p className="font-condensed text-[10px] uppercase tracking-wider text-white/70 mt-1">
          {genre.track_count.toLocaleString()} {t('tracks')}
        </p>
      </div>
    </Link>
  )
}

// ── Main Page ────────────────────────────────────────────────────

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

  // ── Genre search hook ──────────────────────────────────────────
  const {
    query,
    setQuery,
    isFocused,
    setIsFocused,
    matchingSlugs,
    isSearching,
    hasResults,
    clearSearch,
    handleKeyDown,
  } = useGenreFilter(genres)

  // Whether the match/no-match visual treatment is active:
  // only after the debounce has settled (debouncedQuery is non-empty).
  // During the 300ms debounce window, genres stay normal → no flicker.
  const isSearchActive = isSearching && hasResults

  // Split genres into matching (top) and non-matching (bottom) when searching.
  // This moves results closer to the search bar for better UX.
  const matchingGenres = useMemo(
    () => genres.filter((g) => matchingSlugs.has(g.slug)),
    [genres, matchingSlugs],
  )
  const nonMatchingGenres = useMemo(
    () => genres.filter((g) => !matchingSlugs.has(g.slug)),
    [genres, matchingSlugs],
  )

  // ── IntersectionObserver for scroll infinite ───────────────────
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
  const showEmptyCatalog = genres.length === 0 && !isSearching

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Title */}
        <h1 className="font-display text-3xl tracking-widest uppercase">{t('browseByGenre')}</h1>

        {/* Search bar */}
        <GenreSearchBar
          value={query}
          onChange={setQuery}
          isFocused={isFocused}
          onFocusChange={setIsFocused}
          onClear={clearSearch}
          onKeyDown={handleKeyDown}
        />

        {/* Loading skeleton */}
        {showSkeleton ? (
          <div
            role="status"
            aria-label="Loading genres"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[120px]"
          >
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
        ) : showEmptyCatalog ? (
          /* Empty catalog (not searching) */
          <div className="flex flex-col items-center justify-center py-12 px-6 rounded-2xl bg-clark-bg-secondary border border-clark-steel/20 text-center">
            <div className="w-12 h-12 rounded-full bg-clark-bg-card flex items-center justify-center mb-4">
              <Music className="w-6 h-6 text-clark-text-muted" />
            </div>
            <p className="font-display text-lg tracking-wider text-clark-text-primary mb-1">No genres yet</p>
            <p className="font-body text-sm text-clark-text-muted">
              Catalog data will appear here once available.
            </p>
          </div>
        ) : isSearchActive ? (
          <>
            {/* ── MATCHING GENRES (top, closer to search bar) ─────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[120px]">
              {matchingGenres.map((genre, i) => (
                <GenreCard
                  key={genre.slug}
                  genre={genre}
                  index={i}
                  isHighlighted={true}
                  isSearchActive={true}
                />
              ))}
            </div>

            {/* ── NON-MATCHING GENRES (blurred, below) ────────────── */}
            {nonMatchingGenres.length > 0 && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[120px]">
                  {nonMatchingGenres.map((genre, i) => (
                    <GenreCard
                      key={genre.slug}
                      genre={genre}
                      index={i + matchingGenres.length}
                      isHighlighted={false}
                      isSearchActive={true}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        ) : !isSearching ? (
          <>
            {/* ── ALL GENRES (normal, no search) ──────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[120px]">
              {genres.map((genre, i) => (
                <GenreCard
                  key={genre.slug}
                  genre={genre}
                  index={i}
                  isHighlighted={false}
                  isSearchActive={false}
                />
              ))}
            </div>
          </>
        ) : null}

        {/* ── Empty search hint (when searching but no matches) ── */}
        {isSearching && !hasResults && genres.length > 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center animate-fade-in-scale">
            <p className="font-body text-sm text-clark-text-muted/70">
              Nenhum gênero encontrado para{' '}
              <span className="text-clark-text-primary/80 font-medium">
                &ldquo;{query}&rdquo;
              </span>
            </p>
            <p className="font-body text-xs text-clark-text-muted/40 mt-2">
              Tente pesquisar utilizando outros termos.
            </p>
          </div>
        )}

        {/* Infinite scroll (only when not searching) */}
        {!isSearching && genres.length > 0 && (
          <div ref={sentinelRef} className="w-full h-4" aria-hidden="true" />
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
