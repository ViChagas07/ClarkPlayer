'use client'

import Link from 'next/link'
import Image from 'next/image'
import { AppShell } from '@/components/layout/AppShell'
import { useTranslation } from '@/hooks/useTranslation'
import { useGenres } from '@/hooks/useCatalog'
import { getCachedCatalogData, setCachedCatalogData } from '@/lib/catalogCache'
import { cn } from '@/lib/utils'
import type { CatalogGenreItem } from '@/types'
import { Music } from 'lucide-react'

const CACHE_KEY = 'genres'

const genreGradients: Record<string, string> = {
  pop: 'from-pink-500 to-rose-700',
  rock: 'from-zinc-700 to-zinc-900',
  'hip-hop': 'from-amber-600 to-yellow-900',
  rap: 'from-amber-600 to-yellow-900',
  electronic: 'from-cyan-500 to-blue-800',
  jazz: 'from-emerald-600 to-teal-900',
  classical: 'from-indigo-600 to-violet-900',
  rnb: 'from-purple-600 to-fuchsia-900',
  'r&b': 'from-purple-600 to-fuchsia-900',
  reggae: 'from-lime-600 to-green-900',
  country: 'from-amber-700 to-orange-900',
  metal: 'from-slate-700 to-stone-950',
  blues: 'from-blue-800 to-indigo-950',
  folk: 'from-amber-800 to-yellow-950',
  latin: 'from-red-500 to-orange-700',
  brazilian: 'from-green-500 to-emerald-800',
  forro: 'from-yellow-500 to-orange-700',
  pagode: 'from-yellow-500 to-red-600',
  sertanejo: 'from-green-600 to-teal-800',
  samba: 'from-emerald-500 to-green-800',
  funk: 'from-fuchsia-500 to-pink-800',
  gospel: 'from-sky-500 to-indigo-700',
  ambient: 'from-cyan-700 to-slate-800',
  romantic: 'from-pink-400 to-rose-600',
  trap: 'from-violet-600 to-purple-900',
  'heavy-metal': 'from-stone-600 to-zinc-950',
}

function getGradient(slug: string): string {
  const g = genreGradients[slug]
  if (g) return g
  // Derive from slug hash for consistency
  const code = slug.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const hue = code % 360
  return `from-[hsl(${hue},60%,30%)] to-[hsl(${(hue + 40) % 360},50%,20%)]`
}

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
          <div role="status" aria-label="Loading genres" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-clark-bg-secondary animate-pulse aspect-square" />
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {displayGenres.map((genre) => (
              <Link
                key={genre.slug}
                href={`/genres/${genre.slug}`}
                className="group relative rounded-2xl overflow-hidden bg-clark-bg-secondary transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:shadow-black/40 focus-visible:outline-2 focus-visible:outline-clark-gold"
              >
                {/* Cover image or gradient fallback */}
                {genre.cover_url ? (
                  <div className="relative aspect-square">
                    <Image
                      src={genre.cover_url}
                      alt={genre.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className={cn(
                    'aspect-square bg-gradient-to-br',
                    getGradient(genre.slug),
                  )} />
                )}

                {/* Dark overlay at bottom for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Genre name + stats */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h2 className="font-display text-xl md:text-2xl tracking-widest uppercase text-white drop-shadow-lg">
                    {genre.name}
                  </h2>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="font-condensed text-[11px] uppercase tracking-wider text-white/70">
                      {(genre.artist_count ?? 0).toLocaleString()} {t('artists') || 'artists'}
                    </span>
                    <span className="font-condensed text-[11px] uppercase tracking-wider text-white/50">
                      {(genre.track_count ?? 0).toLocaleString()} {t('tracks') || 'tracks'}
                    </span>
                  </div>
                </div>

                {/* Hover tooltip — representative artist */}
                {genre.cover_artist_name && (
                  <div className="absolute top-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1.5 text-center">
                      <p className="font-condensed text-[10px] uppercase tracking-wider text-clark-gold/80">Representado por</p>
                      <p className="font-body text-sm font-semibold text-white truncate">{genre.cover_artist_name}</p>
                    </div>
                  </div>
                )}
              </Link>
            ))}
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
