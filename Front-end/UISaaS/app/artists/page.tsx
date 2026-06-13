'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { AppShell } from '@/components/layout/AppShell'
import { useTranslation } from '@/hooks/useTranslation'
import { api } from '@/lib/api'
import { ALL_BRAZILIAN, ALL_INTERNATIONAL, BRAZILIAN_ARTISTS, INTERNATIONAL_ARTISTS, pickRandom } from '@/lib/seedCatalog'
import { Check, Music, Loader2, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UnifiedSearchResult } from '@/types'
import Image from 'next/image'

// ── Genre tabs with their artist pools ──────────────────────────
type GenreTab = {
  key: string
  label: string
  pool: readonly string[]
  count: number
}

const GENRE_TABS: GenreTab[] = [
  { key: 'all', label: 'All', pool: [...ALL_BRAZILIAN, ...ALL_INTERNATIONAL], count: 100 },
  { key: 'brazilian', label: '🇧🇷 Brazilian', pool: [...ALL_BRAZILIAN], count: 50 },
  { key: 'pop', label: 'Pop', pool: [...(BRAZILIAN_ARTISTS.pop_br ?? []), ...(INTERNATIONAL_ARTISTS.pop ?? [])], count: 30 },
  { key: 'rock', label: 'Rock', pool: [...(BRAZILIAN_ARTISTS.rock_br ?? []), ...(INTERNATIONAL_ARTISTS.rock ?? [])], count: 30 },
  { key: 'rap', label: 'Rap/Hip-Hop', pool: [...(BRAZILIAN_ARTISTS.rap_trap_br ?? []), ...(INTERNATIONAL_ARTISTS.rap ?? [])], count: 30 },
  { key: 'sertanejo', label: 'Sertanejo', pool: BRAZILIAN_ARTISTS.sertanejo ?? [], count: 8 },
  { key: 'mpb', label: 'MPB', pool: BRAZILIAN_ARTISTS.mpb ?? [], count: 10 },
  { key: 'rnb', label: 'R&B', pool: INTERNATIONAL_ARTISTS.rnb ?? [], count: 16 },
  { key: 'electronic', label: 'Electronic', pool: INTERNATIONAL_ARTISTS.electronic ?? [], count: 16 },
  { key: 'latin', label: 'Latin', pool: INTERNATIONAL_ARTISTS.latin ?? [], count: 16 },
  { key: 'indie', label: 'Indie', pool: INTERNATIONAL_ARTISTS.indie ?? [], count: 16 },
  { key: 'samba', label: 'Samba/Pagode', pool: BRAZILIAN_ARTISTS.samba_pagode ?? [], count: 10 },
  { key: 'country', label: 'Country', pool: INTERNATIONAL_ARTISTS.country ?? [], count: 12 },
  { key: 'kpop', label: 'K-Pop', pool: INTERNATIONAL_ARTISTS.kpop ?? [], count: 8 },
  { key: 'afrobeats', label: 'Afrobeats', pool: INTERNATIONAL_ARTISTS.afrobeats ?? [], count: 8 },
  { key: 'jazz', label: 'Jazz/Classical', pool: [...(INTERNATIONAL_ARTISTS.jazz ?? []), ...(INTERNATIONAL_ARTISTS.classical ?? [])], count: 16 },
]

export default function ArtistsPage() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<string>('all')
  const [artists, setArtists] = useState<UnifiedSearchResult[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [tabLoading, setTabLoading] = useState(false)

  const loadArtistsForTab = useCallback(async (tab: GenreTab) => {
    setTabLoading(true)
    setLoadError(false)
    let cancelled = false

    try {
      const seeds = pickRandom(tab.pool, tab.count)
      const results: UnifiedSearchResult[] = []

      // Process in parallel batches of 8 for speed
      for (let i = 0; i < seeds.length; i += 8) {
        if (cancelled) return
        const batch = seeds.slice(i, i + 8)
        const batchResults = await Promise.allSettled(
          batch.map(async (name) => {
            const data = await api.musicSearch(name, 1)
            return data.artists[0] ?? null
          })
        )
        for (const r of batchResults) {
          if (r.status === 'fulfilled' && r.value) results.push(r.value)
        }
      }

      if (!cancelled) {
        setArtists(results)
        if (results.length === 0) setLoadError(true)
      }
    } catch {
      if (!cancelled) setLoadError(true)
    } finally {
      if (!cancelled) {
        setTabLoading(false)
        setIsLoading(false)
      }
    }

    return () => { cancelled = true }
  }, [])

  // Initial load
  useEffect(() => {
    const tab = GENRE_TABS.find(t => t.key === 'all') ?? GENRE_TABS[0]
    const cleanup = loadArtistsForTab(tab)
    return () => { cleanup.then?.(fn => fn?.()) }
  }, [loadArtistsForTab])

  function handleTabChange(key: string) {
    setActiveTab(key)
    const tab = GENRE_TABS.find(t => t.key === key)
    if (tab) loadArtistsForTab(tab)
  }

  const activeTabObj = GENRE_TABS.find(t => t.key === activeTab)

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="font-display text-3xl tracking-widest uppercase">{t('artists')}</h1>
          {!isLoading && (
            <span className="font-body text-sm text-clark-text-muted">
              {artists.length} artists
            </span>
          )}
        </div>

        {/* ── Genre tabs ──────────────────────────────────── */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {GENRE_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              disabled={tabLoading}
              className={cn(
                'flex-shrink-0 px-4 py-2 rounded-full font-body text-sm font-medium transition-all duration-200 whitespace-nowrap',
                activeTab === tab.key
                  ? 'bg-clark-accent text-white shadow-lg shadow-clark-accent/20'
                  : 'bg-clark-bg-secondary text-clark-text-muted hover:text-clark-text-primary hover:bg-clark-bg-card border border-clark-steel/20',
                tabLoading && 'opacity-50 cursor-wait',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Loading skeleton ────────────────────────────── */}
        {(isLoading || tabLoading) && (
          <div role="status" aria-label="Loading artists" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {Array.from({ length: activeTabObj?.count ?? 20 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center animate-pulse">
                <div className="w-24 h-24 rounded-full bg-clark-bg-secondary" />
                <div className="h-4 w-20 bg-clark-bg-secondary rounded mt-3" />
                <div className="h-3 w-12 bg-clark-bg-secondary rounded mt-1" />
              </div>
            ))}
            <span className="sr-only">Loading artists...</span>
          </div>
        )}

        {/* ── Artist grid ─────────────────────────────────── */}
        {!isLoading && !tabLoading && artists.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {artists.map((result, idx) => {
              const artist = result.artist
              if (!artist) return null
              const imgUrl = result.cover_url ?? artist.image_url ?? null
              const mbid = artist.mbid ?? artist.spotify_id ?? `api-artist-${idx}`
              const genres = result.genres

              return (
                <Link
                  key={mbid}
                  href={`/artists/${mbid}?name=${encodeURIComponent(artist.name)}`}
                  className="group flex flex-col items-center text-center p-3 rounded-xl hover:bg-clark-bg-secondary/50 transition-colors"
                >
                  <div className="relative w-28 h-28 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-gradient-to-br from-clark-steel to-clark-bg-card group-hover:scale-105 transition-transform duration-200 shadow-lg">
                    {imgUrl ? (
                      <Image
                        src={imgUrl}
                        alt={`${artist.name} artist photo`}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                        className="object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="font-display text-4xl text-white/30">{artist.name.charAt(0)}</span>
                      </div>
                    )}
                    {genres.length > 0 && (
                      <div className="absolute bottom-0 right-0 w-5 h-5 bg-clark-accent rounded-full flex items-center justify-center border-2 border-clark-bg-primary">
                        <Check className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                  </div>
                  <p className="font-body font-medium text-sm truncate w-full mt-3 text-clark-text-primary group-hover:text-clark-gold transition-colors">
                    {artist.name}
                  </p>
                  {genres.length > 0 && (
                    <p className="font-condensed text-[10px] uppercase tracking-wider text-clark-text-muted mt-0.5 line-clamp-1">
                      {genres.slice(0, 2).join(', ')}
                    </p>
                  )}
                </Link>
              )
            })}
          </div>
        )}

        {/* ── Error state ─────────────────────────────────── */}
        {!isLoading && !tabLoading && loadError && artists.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-6 rounded-2xl bg-clark-bg-secondary border border-clark-steel/20 text-center">
            <Music className="w-12 h-12 text-clark-text-muted/30 mb-4" />
            <h2 className="font-display text-xl tracking-wider text-clark-text-primary mb-2">{t('noArtistsFound')}</h2>
            <p className="font-body text-sm text-clark-text-muted max-w-md mb-6">Try again or check your connection.</p>
            <button
              onClick={() => { const tab = GENRE_TABS.find(t => t.key === activeTab); if (tab) loadArtistsForTab(tab) }}
              className="flex items-center gap-2 px-5 py-2.5 bg-clark-bg-card hover:bg-clark-bg-card/80 border border-clark-steel/30 rounded-lg font-body text-sm text-clark-text-muted hover:text-clark-text-primary transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Retry
            </button>
          </div>
        )}
      </div>
    </AppShell>
  )
}
