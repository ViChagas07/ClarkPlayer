'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { useTranslation } from '@/hooks/useTranslation'
import { usePlayerStore } from '@/store/playerStore'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'
import { Music, Heart, Clock, Play, TrendingUp, Loader2, LogIn } from 'lucide-react'
import type { UnifiedSearchResult, Track } from '@/types'

interface LibraryStats {
  totalTracks: number
  favoritesCount: number
  totalDurationSec: number
}

export default function LibraryPage() {
  const { t } = useTranslation()
  const { setQueue } = usePlayerStore()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const accessToken = useAuthStore((s) => s.accessToken)
  const setShowAuthModal = useAuthStore((s) => s.setShowAuthModal)

  // ── Library stats (real data from API) ──────────────────
  const [stats, setStats] = useState<LibraryStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(false)
  const [statsError, setStatsError] = useState(false)

  // ── Discover section ────────────────────────────────────
  const [discoverTracks, setDiscoverTracks] = useState<UnifiedSearchResult[]>([])
  const [discoverLoading, setDiscoverLoading] = useState(true)

  // Fetch library stats when authenticated
  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      setStats(null)
      setStatsLoading(false)
      setStatsError(false)
      return
    }

    let cancelled = false
    setStatsLoading(true)
    setStatsError(false)

    async function loadStats() {
      try {
        // Fetch tracks (first page, up to 50) and favorites count in parallel
        const [tracksRes, favsRes] = await Promise.all([
          api.listTracks(accessToken!, new URLSearchParams('limit=50')),
          api.listFavorites(accessToken!).catch(() => null), // graceful fallback
        ])

        if (cancelled) return

        const totalDurationSec = tracksRes.items.reduce(
          (sum, item) => sum + (item.duration ?? 0),
          0,
        )

        setStats({
          totalTracks: tracksRes.total,
          favoritesCount: favsRes?.total ?? tracksRes.items.filter((t) => t.is_favorite).length,
          totalDurationSec,
        })
      } catch {
        if (!cancelled) setStatsError(true)
      } finally {
        if (!cancelled) setStatsLoading(false)
      }
    }

    loadStats()
    return () => { cancelled = true }
  }, [isAuthenticated, accessToken])

  // Fetch "Discover" — real API tracks (always runs, no auth needed)
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

  // ── Visitor view (not authenticated) ────────────────────
  if (!isAuthenticated) {
    return (
      <AppShell>
        <div className="space-y-6">
          <h1 className="font-display text-3xl tracking-widest uppercase">{t('library')}</h1>

          {/* Stats placeholders */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: Music, color: 'text-clark-accent', bg: 'bg-clark-accent/20', value: '\u2014', label: t('totalTracks') },
              { icon: Heart, color: 'text-clark-accent', bg: 'bg-clark-accent/20', value: '\u2014', label: t('favorites') },
              { icon: Clock, color: 'text-clark-gold', bg: 'bg-clark-gold/20', value: '\u2014', label: t('totalDuration') },
            ].map((card) => (
              <div key={card.label} className="bg-clark-bg-secondary rounded-xl border border-clark-steel/20 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center`}>
                    <card.icon className={`w-5 h-5 ${card.color}`} />
                  </div>
                  <span className="font-display text-2xl text-clark-text-muted/40">{card.value}</span>
                </div>
                <p className="font-body text-sm text-clark-text-muted">{card.label}</p>
              </div>
            ))}
          </div>

          {/* Login CTA */}
          <div className="flex flex-col items-center justify-center py-12 px-6 rounded-2xl bg-gradient-to-b from-clark-bg-secondary to-clark-bg-card border border-clark-steel/20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-clark-accent/10 flex items-center justify-center mb-4">
              <LogIn className="w-8 h-8 text-clark-accent" />
            </div>
            <h2 className="font-display text-xl tracking-wider text-clark-text-primary mb-2">
              {t('signInToViewLibrary')}
            </h2>
            <p className="font-body text-sm text-clark-text-muted max-w-md mb-6">
              {t('signInToViewLibraryDesc')}
            </p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-clark-accent hover:bg-clark-accent-hover font-body font-semibold text-white rounded-lg transition-all hover:-translate-y-0.5 shadow-glow-hero"
            >
              <LogIn className="w-4 h-4" />
              {t('signIn')}
            </button>
          </div>

          {/* Discover — still available for visitors */}
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
                      <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-clark-steel to-clark-bg-card shadow-md">
                        {coverUrl ? (
                          <img src={coverUrl} alt={track.title} className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Music className="w-8 h-8 text-white/20" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="w-10 h-10 rounded-full bg-clark-accent flex items-center justify-center shadow-lg">
                            <Play className="w-4 h-4 text-white ml-0.5" />
                          </div>
                        </div>
                      </div>
                      <p className="font-body font-semibold text-sm text-clark-text-primary mt-3 truncate">{track.title}</p>
                      <p className="font-body text-xs text-clark-text-muted truncate">{artist?.name ?? 'Unknown'}</p>
                      {result.popularity > 0 && (
                        <div className="mt-2 h-1 bg-clark-bg-primary rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-clark-gold to-clark-accent" style={{ width: `${result.popularity}%` }} />
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

  // ── Authenticated view ──────────────────────────────────
  const totalTracks = stats?.totalTracks ?? 0
  const favoritesCount = stats?.favoritesCount ?? 0
  const totalDurationHr = stats ? Math.floor(stats.totalDurationSec / 3600) : 0
  const totalDurationMin = stats ? Math.floor((stats.totalDurationSec % 3600) / 60) : 0

  return (
    <AppShell>
      <div className="space-y-6">
        <h1 className="font-display text-3xl tracking-widest uppercase">{t('library')}</h1>

        {/* Stats cards — real data */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Total tracks */}
          <div className="bg-clark-bg-secondary rounded-xl border border-clark-steel/20 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-clark-accent/20 flex items-center justify-center">
                <Music className="w-5 h-5 text-clark-accent" />
              </div>
              {statsLoading ? (
                <Loader2 className="w-6 h-6 text-clark-text-muted animate-spin" />
              ) : statsError ? (
                <span className="font-display text-2xl text-clark-danger">{'\u2014'}</span>
              ) : (
                <span className="font-display text-2xl">{totalTracks}</span>
              )}
            </div>
            <p className="font-body text-sm text-clark-text-muted">{t('totalTracks')}</p>
          </div>

          {/* Favorites */}
          <div className="bg-clark-bg-secondary rounded-xl border border-clark-steel/20 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-clark-accent/20 flex items-center justify-center">
                <Heart className="w-5 h-5 text-clark-accent" />
              </div>
              {statsLoading ? (
                <Loader2 className="w-6 h-6 text-clark-text-muted animate-spin" />
              ) : statsError ? (
                <span className="font-display text-2xl text-clark-danger">{'\u2014'}</span>
              ) : (
                <span className="font-display text-2xl">{favoritesCount}</span>
              )}
            </div>
            <p className="font-body text-sm text-clark-text-muted">{t('favorites')}</p>
          </div>

          {/* Total duration */}
          <div className="bg-clark-bg-secondary rounded-xl border border-clark-steel/20 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-clark-gold/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-clark-gold" />
              </div>
              {statsLoading ? (
                <Loader2 className="w-6 h-6 text-clark-text-muted animate-spin" />
              ) : statsError ? (
                <span className="font-display text-2xl text-clark-danger">{'\u2014'}</span>
              ) : (
                <span className="font-display text-2xl">
                  {totalDurationHr > 0 ? `${totalDurationHr}h` : `${totalDurationMin}m`}
                </span>
              )}
            </div>
            <p className="font-body text-sm text-clark-text-muted">{t('totalDuration')}</p>
          </div>
        </div>

        {/* Zero-state hint when no tracks yet */}
        {!statsLoading && totalTracks === 0 && (
          <div className="flex flex-col items-center justify-center py-10 px-6 rounded-2xl bg-clark-bg-secondary border border-clark-steel/20 text-center">
            <Music className="w-10 h-10 text-clark-text-muted/30 mb-3" />
            <p className="font-display text-lg tracking-wider text-clark-text-primary mb-1">{t('noTracksYet')}</p>
            <p className="font-body text-sm text-clark-text-muted max-w-sm">{t('startUploading')}</p>
          </div>
        )}

        {/* Links to browse / playlists */}
        <p className="font-body text-sm text-clark-text-muted text-center py-4">
          {t('libraryOverview')}{' '}
          <Link href="/audios" className="text-clark-gold hover:underline font-medium">{t('libraryOverviewBrowse')} {t('allTracks')}</Link>
          {' '}{t('libraryOverviewOr')}{' '}
          <Link href="/playlists" className="text-clark-gold hover:underline font-medium">{t('playlists')}</Link>.
        </p>

        {/* Discover — Real API tracks in Spotify-style card grid */}
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
                    <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-clark-steel to-clark-bg-card shadow-md">
                      {coverUrl ? (
                        <img src={coverUrl} alt={track.title} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Music className="w-8 h-8 text-white/20" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-clark-accent flex items-center justify-center shadow-lg">
                          <Play className="w-4 h-4 text-white ml-0.5" />
                        </div>
                      </div>
                    </div>
                    <p className="font-body font-semibold text-sm text-clark-text-primary mt-3 truncate">{track.title}</p>
                    <p className="font-body text-xs text-clark-text-muted truncate">{artist?.name ?? 'Unknown'}</p>
                    {result.popularity > 0 && (
                      <div className="mt-2 h-1 bg-clark-bg-primary rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-clark-gold to-clark-accent" style={{ width: `${result.popularity}%` }} />
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
