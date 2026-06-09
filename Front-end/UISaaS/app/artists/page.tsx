'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { AppShell } from '@/components/layout/AppShell'
import { useTranslation } from '@/hooks/useTranslation'
import { mockArtists } from '@/lib/mockData'
import { api } from '@/lib/api'
import { Check, Music, Loader2 } from 'lucide-react'
import type { UnifiedSearchResult } from '@/types'

const FAMOUS_ARTISTS = [
  'Coldplay', 'Drake', 'Taylor Swift', 'The Weeknd', 'Ed Sheeran',
  'Beyoncé', 'Kendrick Lamar', 'Billie Eilish', 'Post Malone', 'Dua Lipa',
  'Bruno Mars', 'Adele', 'Eminem', 'Rihanna', 'Harry Styles',
]

export default function ArtistsPage() {
  const { t } = useTranslation()
  const [artists, setArtists] = useState<UnifiedSearchResult[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        // Search for each famous artist and merge results
        const results: UnifiedSearchResult[] = []
        for (const name of FAMOUS_ARTISTS) {
          if (cancelled) return
          try {
            const data = await api.musicSearch(name, 1)
            const artistResult = data.artists[0]
            if (artistResult) results.push(artistResult)
          } catch {
            // Skip failed artist searches gracefully
          }
        }
        if (!cancelled) setArtists(results)
      } catch {
        // On total failure, keep empty — we show fallback
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  // Fallback to mock data if no API results
  const displayArtists = artists.length > 0 ? artists : null

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
        {!isLoading && displayArtists && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {displayArtists.map((result, idx) => {
              const artist = result.artist
              if (!artist) return null
              const imgUrl = result.cover_url ?? artist.image_url ?? null
              const mbid = artist.mbid ?? artist.spotify_id ?? `api-artist-${idx}`
              const popularity = result.popularity
              const genres = result.genres

              return (
                <Link
                  key={mbid}
                  href={`/artists/${mbid}`}
                  className="group flex flex-col items-center text-center p-3 rounded-xl hover:bg-clark-bg-secondary/50 transition-colors"
                >
                  {/* Avatar — real image or fallback initial */}
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
                    {/* Verified badge for popular artists */}
                    {popularity > 60 && (
                      <div className="absolute bottom-0 right-0 w-6 h-6 bg-clark-accent rounded-full flex items-center justify-center border-2 border-clark-bg-primary">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>

                  <p className="font-body font-medium text-sm truncate w-full mt-3 text-clark-text-primary">
                    {artist.name}
                  </p>

                  {/* Genres or popularity fallback */}
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

        {/* Fallback: mock data */}
        {!isLoading && !displayArtists && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {mockArtists.map((artist) => (
              <Link
                key={artist.id}
                href={`/artists/${artist.id}`}
                className="group flex flex-col items-center text-center"
              >
                <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-clark-steel to-clark-bg-card overflow-hidden group-hover:scale-105 transition-transform duration-200">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-display text-3xl text-white/40">{artist.name.charAt(0)}</span>
                  </div>
                  {artist.isVerified && (
                    <div className="absolute bottom-0 right-0 w-6 h-6 bg-clark-accent rounded-full flex items-center justify-center border-2 border-clark-bg-primary">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <p className="font-body font-medium text-sm truncate w-full mt-3 text-clark-text-primary">{artist.name}</p>
                <p className="font-condensed text-xs uppercase tracking-wider text-clark-text-muted">
                  {artist.albumCount} {artist.albumCount !== 1 ? t('albumPlural') : t('albumSingular')}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}
