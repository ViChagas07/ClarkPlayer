'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { useTranslation } from '@/hooks/useTranslation'
import { usePlayerStore } from '@/store/playerStore'
import { mockTracks } from '@/lib/mockData'
import { api } from '@/lib/api'
import { Music, Heart, Clock, Play, TrendingUp, Loader2 } from 'lucide-react'
import type { UnifiedSearchResult, Track } from '@/types'

export default function LibraryPage() {
  const { t } = useTranslation()
  const { setQueue } = usePlayerStore()
  const [discoverTracks, setDiscoverTracks] = useState<UnifiedSearchResult[]>([])
  const [discoverLoading, setDiscoverLoading] = useState(true)
  const favorites = mockTracks.filter((tr) => tr.isFavorite)
  const totalDuration = mockTracks.reduce((a, tr) => a + tr.duration, 0)

  // Fetch "Discover Weekly" - trending tracks from API
  useEffect(() => {
    let cancelled = false
    async function loadDiscover() {
      const queries = [
        'Blinding Lights The Weeknd',
        'As It Was Harry Styles',
        'Flowers Miley Cyrus',
        'Anti-Hero Taylor Swift',
        'Save Your Tears',
        'Good 4 U Olivia Rodrigo',
        'Levitating Dua Lipa',
        'Stay Kid Laroi',
      ]
      const results: UnifiedSearchResult[] = []
      for (const q of queries) {
        if (cancelled) return
        try {
          const data = await api.musicSearch(q, 1)
          const track = data.tracks[0]
          if (track && track.track && track.track.title) results.push(track)
        } catch { /* skip */ }
      }
      if (!cancelled) setDiscoverTracks(results)
      if (!cancelled) setDiscoverLoading(false)
    }
    loadDiscover()
    return () => { cancelled = true }
  }, [])

  function handlePlay(result: UnifiedSearchResult, idx: number) {
    const tracks: Track[] = discoverTracks
      .filter((r) => r.track)
      .map((r, i) => ({
        id: r.track?.mbid ?? `discover-${i}`,
        title: r.track?.title ?? '',
        artist: r.artist?.name ?? '',
        album: r.album?.title ?? '',
        duration: r.track?.duration ? Math.round(r.track.duration / 1000) : 200,
        format: 'MP3' as const,
        coverUrl: r.cover_url ?? r.album?.cover_url ?? undefined,
      }))
    setQueue(tracks, idx)
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <h1 className="font-display text-3xl tracking-widest uppercase">{t('library')}</h1>

        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-clark-bg-secondary rounded-xl border border-clark-steel/20 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-clark-accent/20 flex items-center justify-center">
                <Music className="w-5 h-5 text-clark-accent" />
              </div>
              <span className="font-display text-2xl">{mockTracks.length}</span>
            </div>
            <p className="font-body text-sm text-clark-text-muted">{t('totalTracks')}</p>
          </div>

          <div className="bg-clark-bg-secondary rounded-xl border border-clark-steel/20 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-clark-accent/20 flex items-center justify-center">
                <Heart className="w-5 h-5 text-clark-accent" />
              </div>
              <span className="font-display text-2xl">{favorites.length}</span>
            </div>
            <p className="font-body text-sm text-clark-text-muted">{t('favorites')}</p>
          </div>

          <div className="bg-clark-bg-secondary rounded-xl border border-clark-steel/20 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-clark-gold/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-clark-gold" />
              </div>
              <span className="font-display text-2xl">{Math.floor(totalDuration / 3600)}h</span>
            </div>
            <p className="font-body text-sm text-clark-text-muted">{t('totalDuration')}</p>
          </div>
        </div>

        <p className="font-body text-sm text-clark-text-muted text-center py-4">
          {t('libraryOverview')}{' '}
          <Link href="/audios" className="text-clark-gold hover:underline font-medium">{t('libraryOverviewBrowse')} {t('allTracks')}</Link>
          {' '}{t('libraryOverviewOr')}{' '}
          <Link href="/playlists" className="text-clark-gold hover:underline font-medium">{t('playlists')}</Link>.
        </p>

        {/* ── Discover — Real API tracks in Spotify-style card grid ── */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-clark-gold" />
            <h2 className="font-condensed text-xs tracking-widest text-clark-gold uppercase">Discover</h2>
          </div>

          {discoverLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="p-3 rounded-xl bg-clark-bg-secondary animate-pulse">
                  <div className="aspect-square rounded-lg bg-clark-bg-card" />
                  <div className="h-4 bg-clark-bg-card rounded mt-3 w-3/4" />
                  <div className="h-3 bg-clark-bg-card rounded mt-1 w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {discoverTracks.map((result, idx) => {
                const track = result.track
                const artist = result.artist
                const coverUrl = result.cover_url ?? result.album?.cover_url ?? null
                if (!track) return null

                return (
                  <div
                    key={track.mbid ?? `discover-${idx}`}
                    onClick={() => handlePlay(result, idx)}
                    className="group p-3 rounded-xl bg-clark-bg-secondary hover:bg-clark-bg-card transition-all duration-200 cursor-pointer hover:scale-[1.02] border border-transparent hover:border-clark-steel/20"
                  >
                    {/* Album art */}
                    <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-clark-steel to-clark-bg-card shadow-md">
                      {coverUrl ? (
                        <img
                          src={coverUrl}
                          alt={track.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Music className="w-8 h-8 text-white/20" />
                        </div>
                      )}
                      {/* Play button */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-clark-accent flex items-center justify-center shadow-lg">
                          <Play className="w-4 h-4 text-white ml-0.5" />
                        </div>
                      </div>
                    </div>

                    <p className="font-body font-semibold text-sm text-clark-text-primary mt-3 truncate">
                      {track.title}
                    </p>
                    <p className="font-body text-xs text-clark-text-muted truncate">
                      {artist?.name ?? 'Unknown'}
                    </p>

                    {/* Popularity */}
                    {result.popularity > 0 && (
                      <div className="mt-2 h-1 bg-clark-bg-primary rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-clark-gold to-clark-accent"
                          style={{ width: `${result.popularity}%` }}
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  )
}
