'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { AppShell } from '@/components/layout/AppShell'
import { useTranslation } from '@/hooks/useTranslation'
import { api } from '@/lib/api'
import { getSessionArtists } from '@/lib/seedCatalog'
import { Check, Music, Loader2, RefreshCw } from 'lucide-react'
import type { UnifiedSearchResult } from '@/types'

const FAMOUS_ARTISTS = getSessionArtists(20)

export default function ArtistsPage() {
  const { t } = useTranslation()
  const [artists, setArtists] = useState<UnifiedSearchResult[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)

  const loadArtists = useCallback(async () => {
    setIsLoading(true)
    setLoadError(false)
    let cancelled = false
    try {
      const results: UnifiedSearchResult[] = []
      for (const name of FAMOUS_ARTISTS) {
        if (cancelled) return
        try {
          const data = await api.musicSearch(name, 1)
          const artistResult = data.artists[0]
          if (artistResult) results.push(artistResult)
        } catch {
          // Skip individual failures
        }
      }
      if (!cancelled) {
        setArtists(results)
        // Only set error if we got ZERO results from all searches
        if (results.length === 0) setLoadError(true)
      }
    } catch {
      if (!cancelled) setLoadError(true)
    } finally {
      if (!cancelled) setIsLoading(false)
    }
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    const cleanup = loadArtists()
    return () => { cleanup.then?.(fn => fn?.()) }
  }, [loadArtists])

  return (
    <AppShell>
      <div className="space-y-6">
        <h1 className="font-display text-3xl tracking-widest uppercase">{t('artists')}</h1>

        {/* Loading skeleton */}
        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center animate-pulse">
                <div className="w-24 h-24 rounded-full bg-clark-bg-secondary" />
                <div className="h-4 w-20 bg-clark-bg-secondary rounded mt-3" />
                <div className="h-3 w-12 bg-clark-bg-secondary rounded mt-1" />
              </div>
            ))}
          </div>
        )}

        {/* Real API Artists */}
        {!isLoading && artists.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {artists.map((result, idx) => {
              const artist = result.artist
              if (!artist) return null
              const imgUrl = result.cover_url ?? artist.image_url ?? null
              const mbid = artist.mbid ?? artist.spotify_id ?? `api-artist-${idx}`
              const popularity = result.popularity
              const genres = result.genres

              return (
                <Link
                  key={mbid}
                  href={`/artists/${mbid}?name=${encodeURIComponent(artist.name)}`}
                  className="group flex flex-col items-center text-center p-3 rounded-xl hover:bg-clark-bg-secondary/50 transition-colors"
                >
                  <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-clark-steel to-clark-bg-card group-hover:scale-105 transition-transform duration-200">
                    {imgUrl ? (
                      <img
                        src={imgUrl}
                        alt={artist.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="font-display text-3xl text-white/40">{artist.name.charAt(0)}</span>
                      </div>
                    )}
                    {popularity > 60 && (
                      <div className="absolute bottom-0 right-0 w-6 h-6 bg-clark-accent rounded-full flex items-center justify-center border-2 border-clark-bg-primary">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  <p className="font-body font-medium text-sm truncate w-full mt-3 text-clark-text-primary">
                    {artist.name}
                  </p>
                  {genres.length > 0 ? (
                    <p className="font-condensed text-xs uppercase tracking-wider text-clark-text-muted mt-0.5 line-clamp-1">
                      {genres.slice(0, 2).join(', ')}
                    </p>
                  ) : popularity > 0 ? (
                    <p className="font-condensed text-xs uppercase tracking-wider text-clark-text-muted mt-0.5">
                      {popularity} {t('popularityLabel').toLowerCase()}
                    </p>
                  ) : null}
                </Link>
              )
            })}
          </div>
        )}

        {/* Error state — all searches failed */}
        {!isLoading && loadError && artists.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-6 rounded-2xl bg-clark-bg-secondary border border-clark-steel/20 text-center">
            <Music className="w-12 h-12 text-clark-text-muted/30 mb-4" />
            <h2 className="font-display text-xl tracking-wider text-clark-text-primary mb-2">
              {t('noArtistsFound')}
            </h2>
            <p className="font-body text-sm text-clark-text-muted max-w-md mb-6">
              Try importing music into your library or check back later.
            </p>
            <button
              onClick={loadArtists}
              className="flex items-center gap-2 px-5 py-2.5 bg-clark-bg-card hover:bg-clark-bg-card/80 border border-clark-steel/30 rounded-lg font-body text-sm text-clark-text-muted hover:text-clark-text-primary transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        )}

        {/* Empty state — API worked but returned nothing */}
        {!isLoading && !loadError && artists.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-6 rounded-2xl bg-clark-bg-secondary border border-clark-steel/20 text-center">
            <Music className="w-12 h-12 text-clark-text-muted/30 mb-4" />
            <h2 className="font-display text-xl tracking-wider text-clark-text-primary mb-2">
              {t('noArtistsFound')}
            </h2>
            <p className="font-body text-sm text-clark-text-muted max-w-md">
              Import music or search to discover artists.
            </p>
          </div>
        )}
      </div>
    </AppShell>
  )
}
