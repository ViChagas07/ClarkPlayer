'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { Music, ListMusic, TrendingUp, Headphones, Loader2, Globe, Mic2 } from 'lucide-react'
import { usePlayerStore } from '@/store/playerStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useTranslation } from '@/hooks/useTranslation'
import { api } from '@/lib/api'
import { getSessionTracks, getBrazilianHighlights, getArtistsByGenre } from '@/lib/seedCatalog'
import type { Track, UnifiedSearchResult } from '@/types'

// ── Shared fetcher — loads tracks for a list of queries ─────────
async function fetchSectionTracks(queries: string[], onlyPreview: boolean): Promise<UnifiedSearchResult[]> {
  const results: UnifiedSearchResult[] = []
  for (const q of queries) {
    try {
      const data = await api.musicSearch(q, 1)
      const track = data.tracks[0]
      if (track?.track?.title && (!onlyPreview || track.track.preview_url)) {
        results.push(track)
      }
    } catch { /* skip */ }
  }
  return results
}

export function NowPlayingContent() {
  const { t } = useTranslation()
  const currentTrack = usePlayerStore((s) => s.currentTrack)
  const isPlaying = usePlayerStore((s) => s.isPlaying)
  const [recentTracks, setRecentTracks] = useState<Track[]>([])
  const setSleepTimer = useSettingsStore((s) => s.setSleepTimer)

  // ── Seed queries — rotated per session ─────────────────
  const discoverQueries = useMemo(() => getSessionTracks(8), [])
  const brazilianQueries = useMemo(() => getBrazilianHighlights(6), [])
  const popQueries = useMemo(() => getArtistsByGenre('pop', 6), [])

  // ── Discovery state ────────────────────────────────────
  const [discoverTracks, setDiscoverTracks] = useState<UnifiedSearchResult[]>([])
  const [discoverLoading, setDiscoverLoading] = useState(true)
  const [brazilianTracks, setBrazilianTracks] = useState<UnifiedSearchResult[]>([])
  const [brazilianLoading, setBrazilianLoading] = useState(true)
  const [popTracks, setPopTracks] = useState<UnifiedSearchResult[]>([])
  const [popLoading, setPopLoading] = useState(true)

  useEffect(() => {
    if (!currentTrack || !isPlaying) return
    const timer = setTimeout(() => {
      fetch(`/api/v1/player/played/${currentTrack.id}`, { method: 'POST' })
    }, 30_000)
    return () => clearTimeout(timer)
  }, [currentTrack?.id, isPlaying])

  useEffect(() => {
    async function restore() {
      try {
        const res = await fetch('/api/v1/player/sleep-timer')
        if (res.ok) {
          const data = await res.json()
          if (data.expires_at != null) {
            const now = Date.now()
            if (data.expires_at > now) setSleepTimer(data.expires_at)
            else {
              await fetch('/api/v1/player/sleep-timer', { method: 'DELETE' })
              setSleepTimer(null)
            }
          }
        }
      } catch { /* silent */ }
    }
    restore()
  }, [setSleepTimer])

  useEffect(() => {
    async function fetchRecent() {
      try {
        const res = await fetch('/api/v1/player/recently-played?limit=20')
        if (res.ok) {
          const data = await res.json() as { tracks?: { id: string; title: string; artist?: string; album?: string; duration?: number }[] }
          if (data.tracks) {
            setRecentTracks(data.tracks.map((tr) => ({
              id: tr.id, title: tr.title,
              artist: tr.artist ?? 'Unknown Artist',
              album: tr.album ?? 'Unknown Album',
              duration: tr.duration ?? 0,
              format: 'MP3' as const,
            })) as Track[])
          }
        }
      } catch { /* silent */ }
    }
    fetchRecent()
  }, [])

  // ── Fetch all discovery sections ───────────────────────
  useEffect(() => {
    let cancelled = false
    async function loadAll() {
      const [discover, brazilian, pop] = await Promise.all([
        fetchSectionTracks(discoverQueries, true),
        fetchSectionTracks(brazilianQueries, false),
        fetchSectionTracks(popQueries, true),
      ])
      if (cancelled) return
      setDiscoverTracks(discover)
      setDiscoverLoading(false)
      setBrazilianTracks(brazilian)
      setBrazilianLoading(false)
      setPopTracks(pop)
      setPopLoading(false)
    }
    loadAll()
    return () => { cancelled = true }
  }, [discoverQueries, brazilianQueries, popQueries])

  function handlePreviewPlay(result: UnifiedSearchResult, idx: number) {
    const track = result.track
    if (!track?.preview_url) return
    const trackObj: Track = {
      id: track.mbid ?? `preview-${idx}`,
      title: track.title ?? 'Unknown',
      artist: result.artist?.name ?? 'Unknown',
      album: result.album?.title ?? '',
      duration: track.duration ? Math.round(track.duration / 1000) : 30,
      format: 'MP3',
      coverUrl: result.cover_url ?? result.album?.cover_url ?? undefined,
      previewUrl: track.preview_url,
      isPreview: true,
    }
    usePlayerStore.getState().playPreview(track.preview_url, trackObj)
  }

  function renderCardGrid(items: UnifiedSearchResult[], section: string) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {items.map((result, idx) => {
          const track = result.track
          if (!track) return null
          const coverUrl = result.cover_url ?? result.album?.cover_url ?? null
          const hasPreview = !!track.preview_url
          return (
            <div
              key={track.mbid ?? `${section}-${idx}`}
              className="group p-3 rounded-xl bg-clark-bg-secondary hover:bg-clark-bg-card transition-all duration-200 border border-transparent hover:border-clark-steel/20"
            >
              <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-clark-steel to-clark-bg-card shadow-md">
                {coverUrl ? (
                  <img src={coverUrl} alt={track.title} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Music className="w-8 h-8 text-white/20" />
                  </div>
                )}
                {hasPreview && (
                  <button
                    onClick={() => handlePreviewPlay(result, idx)}
                    className="absolute bottom-2 right-2 w-9 h-9 rounded-full bg-clark-accent hover:bg-clark-accent-hover flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                    aria-label={t('playPreview')}
                  >
                    <Headphones className="w-4 h-4 text-white" />
                  </button>
                )}
              </div>
              <p className="font-body font-semibold text-sm text-clark-text-primary mt-2 truncate">{track.title}</p>
              <p className="font-body text-xs text-clark-text-muted truncate">{result.artist?.name ?? 'Unknown'}</p>
              {hasPreview && (
                <span className="inline-flex items-center gap-1 mt-1.5 px-1.5 py-0.5 rounded bg-clark-gold/10 text-clark-gold font-condensed text-[10px] uppercase tracking-wider">
                  <Headphones className="w-3 h-3" /> {t('previewLabel')}
                </span>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  function renderSkeleton(count: number) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="animate-pulse p-3">
            <div className="aspect-square rounded-xl bg-clark-bg-secondary" />
            <div className="h-4 bg-clark-bg-secondary rounded mt-3 w-3/4" />
            <div className="h-3 bg-clark-bg-secondary rounded mt-1 w-1/2" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-96px)] px-6">
      {/* ── Hero ──────────────────────────────────────────── */}
      <div className="text-center max-w-lg">
        <div className="relative mx-auto mb-10 w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64">
          <div className="absolute inset-0 rounded-full bg-clark-gold/20 blur-3xl animate-gold-pulse" />
          <div className="relative w-full h-full rounded-2xl flex items-center justify-center overflow-hidden">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-clark-gold/10 blur-2xl animate-pulse-slow" />
              <img src="/logo.png" alt="ClarkPlayer" className="relative w-48 h-48 object-contain drop-shadow-[0_0_30px_rgba(245,197,24,0.3)]" />
            </div>
          </div>
          <div className="absolute -inset-1 rounded-3xl border border-clark-gold/20 -z-10" />
        </div>
        <p className="font-condensed text-xs tracking-widest text-clark-gold uppercase mb-4">{t('nowPlaying')}</p>
        <h1 className="font-display text-5xl md:text-7xl tracking-widest uppercase mb-3">
          <span className="text-clark-text-primary">
            {t('welcomeToClarkPlayer').replace('ClarkPlayer', '')}
            Clark<span className="text-clark-accent">Player</span>
          </span>
        </h1>
        <p className="font-body font-medium text-xl text-clark-text-muted mb-8">{t('fortressOfSound')}</p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <Link href="/audios" className="px-6 py-3 bg-clark-accent hover:bg-clark-accent-hover text-white font-body font-semibold rounded-lg transition-all hover:-translate-y-0.5 shadow-glow-hero flex items-center gap-2">
            <Music className="w-4 h-4 flex-shrink-0" /> {t('browseTracks')}
          </Link>
          <Link href="/playlists" className="px-6 py-3 bg-clark-bg-card hover:bg-clark-bg-secondary text-clark-text-primary font-body font-semibold rounded-lg transition-all hover:-translate-y-0.5 border border-clark-steel/40 hover:border-clark-gold/40 flex items-center gap-2">
            <ListMusic className="w-4 h-4 flex-shrink-0 text-clark-gold" /> {t('playlists')}
          </Link>
        </div>
      </div>

      {/* ── Trending Now ───────────────────────────────────── */}
      <section className="w-full max-w-6xl mt-14">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-clark-gold" />
          <h2 className="font-condensed text-xs tracking-widest text-clark-gold uppercase">{t('discoverNewMusic')}</h2>
        </div>
        {discoverLoading ? renderSkeleton(6) : renderCardGrid(discoverTracks, 'discover')}
      </section>

      {/* ── Brazilian Highlights ───────────────────────────── */}
      <section className="w-full max-w-6xl mt-10">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5 text-emerald-400" />
          <h2 className="font-condensed text-xs tracking-widest text-emerald-400 uppercase">Brazilian Highlights</h2>
        </div>
        {brazilianLoading ? renderSkeleton(6) : renderCardGrid(brazilianTracks, 'brazil')}
      </section>

      {/* ── Pop Hits ───────────────────────────────────────── */}
      <section className="w-full max-w-6xl mt-10">
        <div className="flex items-center gap-2 mb-4">
          <Mic2 className="w-5 h-5 text-clark-sky" />
          <h2 className="font-condensed text-xs tracking-widest text-clark-sky uppercase">Pop Hits</h2>
        </div>
        {popLoading ? renderSkeleton(6) : renderCardGrid(popTracks, 'pop')}
      </section>

      {/* ── Recently Played ────────────────────────────────── */}
      {recentTracks.length > 0 && (
        <div className="w-full max-w-5xl mt-14">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-clark-steel/40 to-transparent" />
            <h2 className="font-condensed text-xs tracking-widest text-clark-text-muted uppercase">{t('recentlyPlayed')}</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-clark-steel/40 to-transparent" />
          </div>
          <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide">
            {recentTracks.map((track) => (
              <div key={track.id} className="flex-shrink-0 w-48 group hover:-translate-y-1 transition-all duration-200">
                <div className="relative w-full h-36 rounded-xl bg-gradient-to-br from-clark-bg-secondary to-clark-bg-primary border border-clark-steel/20 overflow-hidden">
                  <div className="absolute inset-0 bg-clark-gold/0 group-hover:bg-clark-gold/5 transition-colors duration-300" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-[0.08]">
                    <img src="/logo.png" alt="" className="w-12 h-12 object-contain" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-clark-gold to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                </div>
                <div className="mt-2 px-1">
                  <p className="font-body font-medium text-sm text-clark-text-primary truncate group-hover:text-clark-gold transition-colors">{track.title}</p>
                  <p className="font-body text-xs text-clark-text-muted truncate">{track.artist ?? 'Unknown Artist'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
