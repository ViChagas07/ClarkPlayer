'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Music, ListMusic, TrendingUp, Headphones, Globe, Mic2, Disc3, Radio, Zap, Heart } from 'lucide-react'
import { usePlayerStore } from '@/store/playerStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useTranslation } from '@/hooks/useTranslation'
import { useDiscovery } from '@/hooks/useCatalog'
import type { Track, CatalogTrackItem, CatalogArtistItem, CatalogDiscoverySection } from '@/types'

// ── Section icon/color config ─────────────────────────────────────
const GENRE_META: Record<string, { icon: typeof TrendingUp; color: string; label: string }> = {
  pop: { icon: Mic2, color: 'text-clark-sky', label: 'Pop Hits' },
  rock: { icon: Disc3, color: 'text-red-400', label: 'Rock' },
  rap: { icon: Radio, color: 'text-amber-400', label: 'Rap / Hip-Hop' },
  'hip-hop': { icon: Radio, color: 'text-amber-400', label: 'Rap / Hip-Hop' },
  electronic: { icon: Zap, color: 'text-violet-400', label: 'Electronic' },
  rnb: { icon: Heart, color: 'text-pink-400', label: 'R&B' },
  brazilian: { icon: Globe, color: 'text-emerald-400', label: 'Brazilian Highlights' },
}

export function NowPlayingContent() {
  const { t } = useTranslation()
  const currentTrack = usePlayerStore((s) => s.currentTrack)
  const isPlaying = usePlayerStore((s) => s.isPlaying)
  const [recentTracks, setRecentTracks] = useState<Track[]>([])
  const setSleepTimer = useSettingsStore((s) => s.setSleepTimer)

  const { data: discovery, isLoading, isError } = useDiscovery()

  // ── Track played event ─────────────────────────────────────
  useEffect(() => {
    if (!currentTrack || !isPlaying) return
    const timer = setTimeout(() => {
      fetch(`/api/v1/player/played/${currentTrack.id}`, { method: 'POST' })
    }, 30_000)
    return () => clearTimeout(timer)
  }, [currentTrack?.id, isPlaying])

  // ── Sleep timer restore ────────────────────────────────────
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

  // ── Recently played ────────────────────────────────────────
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

  // ── Preview play ───────────────────────────────────────────
  function handlePreviewPlay(item: CatalogTrackItem, idx: number) {
    if (!item.preview_url) return
    const trackObj: Track = {
      id: item.id ?? `preview-${idx}`,
      title: item.title,
      artist: item.artist_name,
      album: item.album_name ?? '',
      duration: item.duration ? Math.round(item.duration / 1000) : 30,
      format: 'MP3',
      coverUrl: item.cover_url ?? undefined,
      previewUrl: item.preview_url,
      isPreview: true,
    }
    usePlayerStore.getState().playPreview(item.preview_url, trackObj)
  }

  // ── Track card grid ────────────────────────────────────────
  function renderTrackGrid(items: CatalogTrackItem[], sectionKey: string) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {items.map((item, idx) => {
          const hasPreview = !!item.preview_url
          return (
            <div
              key={item.id ?? `${sectionKey}-${idx}`}
              className="group p-3 rounded-xl bg-clark-bg-secondary hover:bg-clark-bg-card transition-all duration-200 border border-transparent hover:border-clark-steel/20"
            >
              <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-clark-steel to-clark-bg-card shadow-md">
                {item.cover_url ? (
                  <Image
                    src={item.cover_url}
                    alt={`${item.title} album art`}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                    className="object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Music className="w-8 h-8 text-white/20" />
                  </div>
                )}
                {hasPreview && (
                  <button
                    onClick={() => handlePreviewPlay(item, idx)}
                    className="absolute bottom-2 right-2 w-9 h-9 rounded-full bg-clark-accent hover:bg-clark-accent-hover flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                    aria-label={t('playPreview')}
                  >
                    <Headphones className="w-4 h-4 text-white" />
                  </button>
                )}
              </div>
              <p className="font-body font-semibold text-sm text-clark-text-primary mt-2 truncate">{item.title}</p>
              <p className="font-body text-xs text-clark-text-muted truncate">{item.artist_name}</p>
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

  // ── Artist card grid ───────────────────────────────────────
  function renderArtistGrid(items: CatalogArtistItem[]) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {items.map((artist) => (
          <Link
            key={artist.id}
            href={`/artists/${artist.id}`}
            className="group p-3 rounded-xl bg-clark-bg-secondary hover:bg-clark-bg-card transition-all duration-200 border border-transparent hover:border-clark-steel/20 text-center"
          >
            <div className="relative w-full aspect-square rounded-full overflow-hidden bg-gradient-to-br from-clark-steel to-clark-bg-card shadow-md mx-auto max-w-[120px]">
              {artist.image_url ? (
                <Image
                  src={artist.image_url}
                  alt={artist.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  className="object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Music className="w-8 h-8 text-white/20" />
                </div>
              )}
            </div>
            <p className="font-body font-semibold text-sm text-clark-text-primary mt-2 truncate">{artist.name}</p>
            <p className="font-body text-xs text-clark-text-muted truncate">
              {artist.track_count > 0 ? `${artist.track_count} tracks` : `${artist.genres.slice(0, 2).join(', ')}`}
            </p>
          </Link>
        ))}
      </div>
    )
  }

  // ── Render a section with header ───────────────────────────
  function renderSection(
    label: string,
    Icon: typeof TrendingUp,
    colorClass: string,
    tracks: CatalogTrackItem[] | null,
    artists: CatalogArtistItem[] | null,
    sectionKey: string,
  ) {
    const hasData = (tracks && tracks.length > 0) || (artists && artists.length > 0)
    if (!hasData) return null

    return (
      <section className="w-full max-w-6xl mt-10">
        <div className="flex items-center gap-2 mb-4">
          <Icon className={`w-5 h-5 ${colorClass}`} />
          <h2 className={`font-condensed text-xs tracking-widest uppercase ${colorClass}`}>{label}</h2>
        </div>
        {tracks && tracks.length > 0
          ? renderTrackGrid(tracks, sectionKey)
          : artists && artists.length > 0
            ? renderArtistGrid(artists)
            : null}
      </section>
    )
  }

  // ── Skeleton loader ────────────────────────────────────────
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

  // ── Render genre sections from discovery ───────────────────
  function renderGenreSections(sections: CatalogDiscoverySection[]) {
    return sections.map((section) => {
      const meta = GENRE_META[section.genre]
      if (!meta) return null
      return renderSection(meta.label, meta.icon, meta.color, section.items, null, section.genre)
    })
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
              <div className="relative w-48 h-48">
                <Image
                  src="/logo.png"
                  alt="ClarkPlayer Logo — Fortress of Sound"
                  fill
                  priority
                  sizes="12rem"
                  className="object-contain drop-shadow-[0_0_30px_rgba(245,197,24,0.3)]"
                />
              </div>
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

      {/* ── Loading / Error states ────────────────────────── */}
      {isLoading && (
        <>
          <section className="w-full max-w-6xl mt-14">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-clark-gold" />
              <h2 className="font-condensed text-xs tracking-widest text-clark-gold uppercase">{t('discoverNewMusic')}</h2>
            </div>
            {renderSkeleton(6)}
          </section>
          {['Pop Hits', 'Rock', 'Rap / Hip-Hop', 'Electronic', 'R&B'].map((label) => (
            <section key={label} className="w-full max-w-6xl mt-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-5 h-5 rounded bg-clark-bg-secondary animate-pulse" />
                <div className="h-3 w-20 bg-clark-bg-secondary rounded animate-pulse" />
              </div>
              {renderSkeleton(6)}
            </section>
          ))}
        </>
      )}

      {isError && (
        <section className="w-full max-w-6xl mt-14 text-center py-12">
          <p className="font-body text-clark-text-muted">
            Could not load discovery data. The catalog may still be populating.
          </p>
        </section>
      )}

      {/* ── Discovery sections ────────────────────────────── */}
      {discovery && (
        <>
          {/* Trending Now */}
          {renderSection(
            t('discoverNewMusic'),
            TrendingUp,
            'text-clark-gold',
            discovery.trending_tracks,
            null,
            'trending',
          )}

          {/* Genre sections */}
          {renderGenreSections(discovery.sections)}

          {/* Brazilian Highlights */}
          {renderSection(
            'Brazilian Highlights',
            Globe,
            'text-emerald-400',
            null,
            discovery.brazilian_artists,
            'brazil',
          )}
        </>
      )}

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
                    <Image src="/logo.png" alt="" width={48} height={48} className="object-contain" aria-hidden="true" />
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
