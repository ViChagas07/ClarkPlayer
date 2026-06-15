'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useQuery } from '@tanstack/react-query'
import { Music, ListMusic, TrendingUp, Headphones, Globe, Mic2, Disc3, Radio, Zap, Heart } from 'lucide-react'
import { usePlayerStore } from '@/store/playerStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useAuthStore } from '@/store/authStore'
import { useTranslation } from '@/hooks/useTranslation'
import { api } from '@/lib/api'
import type {
  Track,
  CatalogTrackItem,
  CatalogArtistItem,
  CatalogDiscoveryResponse,
} from '@/types'

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

const DISCOVERY_KEY = ['catalog', 'discovery']

// ── Shared discovery data hook (one API call, many consumers) ─────
function useDiscoverySection<T>(
  select: (data: CatalogDiscoveryResponse) => T,
  _sectionLabel: string,
) {
  return useQuery<CatalogDiscoveryResponse, Error, T>({
    queryKey: DISCOVERY_KEY,
    queryFn: () => api.catalogDiscovery(),
    staleTime: 5 * 60 * 1000,
    select,
  })
}

// ── Track card grid ──────────────────────────────────────────────
function TrackGrid({ items, sectionKey }: { items: CatalogTrackItem[]; sectionKey: string }) {
  const { t } = useTranslation()

  function handlePreviewPlay(item: CatalogTrackItem, idx: number) {
    if (!item.preview_url) return
    const trackObj: Track = {
      id: item.id ?? `preview-${idx}`,
      title: item.title,
      artist: item.artist_name,
      album: item.album_title ?? '',
      duration: item.duration_ms ? Math.round(item.duration_ms / 1000) : 30,
      format: 'MP3',
      coverUrl: item.album_cover ?? undefined,
      previewUrl: item.preview_url,
      isPreview: true,
    }
    usePlayerStore.getState().playPreview(item.preview_url, trackObj)
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {items.map((item, idx) => {
        const hasPreview = !!item.preview_url
        return (
          <div
            key={item.id ?? `${sectionKey}-${idx}`}
            onClick={() => hasPreview && handlePreviewPlay(item, idx)}
            onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && hasPreview) { e.preventDefault(); handlePreviewPlay(item, idx) } }}
            role="button"
            tabIndex={0}
            aria-label={`Play ${item.title} by ${item.artist_name}`}
            className="group p-3 rounded-xl bg-clark-bg-secondary hover:bg-clark-bg-card transition-all duration-200 border border-transparent hover:border-clark-steel/20 cursor-pointer hover:scale-[1.02]"
          >
            <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-clark-steel to-clark-bg-card shadow-md">
              {item.album_cover ? (
                <Image
                  src={item.album_cover}
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
                  onClick={(e) => { e.stopPropagation(); handlePreviewPlay(item, idx) }}
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

// ── Artist card grid ─────────────────────────────────────────────
function ArtistGrid({ items }: { items: CatalogArtistItem[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {items.map((artist) => (
        <Link
          key={artist.id}
          href={`/artists/${artist.id}?name=${encodeURIComponent(artist.name)}`}
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

// ── Skeleton (shared) ────────────────────────────────────────────
function CardSkeleton({ count }: { count: number }) {
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

// ── Section wrapper ──────────────────────────────────────────────
function SectionHeader({
  label,
  Icon,
  colorClass,
}: {
  label: string
  Icon: typeof TrendingUp
  colorClass: string
}) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon className={`w-5 h-5 ${colorClass}`} />
      <h2 className={`font-condensed text-xs tracking-widest uppercase ${colorClass}`}>{label}</h2>
    </div>
  )
}

// ── Individual Section Components ─────────────────────────────────

function TrendingSection() {
  const { t } = useTranslation()
  const { data, isLoading } = useDiscoverySection(
    (d) => d.trending_tracks,
    'trending',
  )

  if (isLoading && !data) {
    return (
      <section className="w-full max-w-6xl mt-10">
        <SectionHeader label={t('discoverNewMusic')} Icon={TrendingUp} colorClass="text-clark-gold" />
        <CardSkeleton count={6} />
      </section>
    )
  }

  if (!data || data.length === 0) return null

  return (
    <section className="w-full max-w-6xl mt-10">
      <SectionHeader label={t('discoverNewMusic')} Icon={TrendingUp} colorClass="text-clark-gold" />
      <TrackGrid items={data} sectionKey="trending" />
    </section>
  )
}

function GenreSection({ slug }: { slug: string }) {
  const meta = GENRE_META[slug]
  const { data, isLoading } = useDiscoverySection(
    (d) => {
      const section = d.sections.find((s) => s.genre === slug)
      return section?.items ?? []
    },
    `genre-${slug}`,
  )

  if (!meta) return null
  if (isLoading && !data) {
    return (
      <section className="w-full max-w-6xl mt-10">
        <SectionHeader label={meta.label} Icon={meta.icon} colorClass={meta.color} />
        <CardSkeleton count={6} />
      </section>
    )
  }

  if (!data || data.length === 0) return null

  return (
    <section className="w-full max-w-6xl mt-10">
      <SectionHeader label={meta.label} Icon={meta.icon} colorClass={meta.color} />
      <TrackGrid items={data} sectionKey={slug} />
    </section>
  )
}

function BrazilianSection() {
  const { data, isLoading } = useDiscoverySection(
    (d) => d.brazilian_artists,
    'brazilian',
  )

  if (isLoading && !data) {
    return (
      <section className="w-full max-w-6xl mt-10">
        <SectionHeader label="Brazilian Highlights" Icon={Globe} colorClass="text-emerald-400" />
        <CardSkeleton count={6} />
      </section>
    )
  }

  if (!data || data.length === 0) return null

  return (
    <section className="w-full max-w-6xl mt-10">
      <SectionHeader label="Brazilian Highlights" Icon={Globe} colorClass="text-emerald-400" />
      <ArtistGrid items={data} />
    </section>
  )
}

// ── Hero (no data dependency — renders instantly) ─────────────────
function Hero({ t }: { t: ReturnType<typeof useTranslation>['t'] }) {
  return (
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
  )
}

// ── Main Component ───────────────────────────────────────────────
export function NowPlayingContent() {
  // Force Vercel rebuild — hotfix
  const { t } = useTranslation()
  const currentTrack = usePlayerStore((s) => s.currentTrack)
  const isPlaying = usePlayerStore((s) => s.isPlaying)
  const [recentTracks, setRecentTracks] = useState<Track[]>([])
  const setSleepTimer = useSettingsStore((s) => s.setSleepTimer)

  // ── Background prefetches (non-blocking) ───────────────────────
  useQuery({
    queryKey: ['catalog', 'artists', 30, 0, 'popularity'],
    queryFn: () => api.catalogArtists(30, 0, 'popularity'),
    staleTime: 6 * 60 * 60 * 1000,
    enabled: true,
  })
  useQuery({
    queryKey: ['catalog', 'genres'],
    queryFn: () => api.catalogGenres(),
    staleTime: 12 * 60 * 60 * 1000,
    enabled: true,
  })
  useQuery({
    queryKey: ['catalog', 'brazilian', 20, 0],
    queryFn: () => api.catalogBrazilian(20, 0),
    staleTime: 6 * 60 * 60 * 1000,
    enabled: true,
  })

  // ── Track played event ─────────────────────────────────────────
  useEffect(() => {
    if (!currentTrack || !isPlaying) return
    const timer = setTimeout(() => {
      fetch(`/api/v1/player/played/${currentTrack.id}`, { method: 'POST' })
    }, 30_000)
    return () => clearTimeout(timer)
  }, [currentTrack?.id, isPlaying])

  // ── Sleep timer restore ────────────────────────────────────────
  useEffect(() => {
    const token = useAuthStore.getState().accessToken
    if (!token) return

    async function restore() {
      try {
        const res = await fetch('/api/v1/player/sleep-timer', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          if (data.expires_at != null) {
            const now = Date.now()
            if (data.expires_at > now) setSleepTimer(data.expires_at)
            else {
              await fetch('/api/v1/player/sleep-timer', {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
              })
              setSleepTimer(null)
            }
          }
        }
      } catch { /* silent */ }
    }
    restore()
  }, [setSleepTimer])

  // ── Recently played ────────────────────────────────────────────
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

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-96px)] px-6">
      {/* ── Hero — renders INSTANTLY (zero data dependency) ───── */}
      <Hero t={t} />

      {/* ── Discovery sections — each renders independently as data arrives ── */}
      <TrendingSection />
      <GenreSection slug="pop" />
      <GenreSection slug="rock" />
      <GenreSection slug="rap" />
      <GenreSection slug="electronic" />
      <GenreSection slug="rnb" />
      <BrazilianSection />

      {/* ── Recently Played ──────────────────────────────────────── */}
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
