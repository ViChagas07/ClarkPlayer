'use client'

import React, { Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { useTranslation } from '@/hooks/useTranslation'
import { usePlayerStore } from '@/store/playerStore'
import { playWithAlbumQueue } from '@/lib/albumQueue'
import { useArtist, useArtistTracks, useArtistAlbums } from '@/hooks/useCatalog'
import { cn } from '@/lib/utils'
import type { CatalogTrackItem, CatalogArtistItem, Track } from '@/types'
import {
  Play,
  Check,
  Music,
  Disc3,
  Headphones,
  Activity,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'

// ── Track to player Track mapper ────────────────────────────
function toPlayerTrack(item: CatalogTrackItem, idx: number, artistName: string): Track {
  return {
    id: item.id ?? `artist-track-${idx}`,
    title: item.title,
    artist: item.artist_name || artistName,
    album: item.album_title ?? '',
    duration: item.duration_ms ? Math.round(item.duration_ms / 1000) : 200,
    format: 'MP3',
    coverUrl: item.album_cover ?? undefined,
    previewUrl: item.preview_url ?? null,
  }
}

function formatDuration(ms: number | null): string {
  if (!ms) return ''
  const m = Math.floor(ms / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  return `${m}:${s.toString().padStart(2, '0')}`
}

// ── Inner client component — receives plain string, not Promise ──
function ArtistDetailInner({ params }: { params: Promise<{ id: string }> }) {
  const { t } = useTranslation()
  const resolvedParams = React.use(params)
  const searchParams = useSearchParams()
  const { setQueue } = usePlayerStore()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const artistId = resolvedParams.id
  const artistNameFromQuery = searchParams.get('name') ?? undefined

  // ── Skip queries during SSR to avoid backend cold‑start timeouts ──
  const {
    data: artistData,
    isLoading: artistLoading,
    isError: artistError,
    refetch: refetchArtist,
  } = useArtist(mounted ? artistId : '')

  const {
    data: tracksData,
    isLoading: tracksLoading,
    isError: tracksError,
  } = useArtistTracks(mounted ? artistId : '', 30, 0)

  const {
    data: albumsData,
    isLoading: albumsLoading,
    isError: albumsError,
  } = useArtistAlbums(mounted ? artistId : '')

  // ── Extract and validate data ──────────────────────────────
  // Backend returns flat CatalogArtistDetailResponse (no wrapper).
  // We construct the artist object here for backward compat.
  const artist: CatalogArtistItem | undefined = artistData
    ? {
        id: artistData.id,
        name: artistData.name,
        image_url: artistData.image_url,
        genres: artistData.genres,
        bio: artistData.bio,
        popularity: artistData.popularity,
        track_count: artistData.track_count,
        album_count: 0,
      }
    : undefined
  const topTracks: CatalogTrackItem[] = tracksData?.items ?? []
  const albums = albumsData ?? []

  // Safe artist name fallback chain
  const artistDisplayName = artistNameFromQuery ?? artist?.name ?? 'Unknown Artist'

  // ── DEBUG: Log page-level data ─────────────────────────────
  console.log('[ArtistPage] artistLoading:', artistLoading, 'artistError:', artistError)
  console.log('[ArtistPage] artistData present:', !!artistData)
  console.log('[ArtistPage] artistData type:', typeof artistData)
  if (artistData) {
    console.log('[ArtistPage] artistData keys:', Object.keys(artistData))
  }
  console.log('[ArtistPage] artist resolved:', !!artist)
  if (artist) {
    console.log('[ArtistPage] artist.name:', artist.name)
    console.log('[ArtistPage] artist.image_url:', artist.image_url)
    console.log('[ArtistPage] artist.genres:', artist.genres)
  }
  console.log('[ArtistPage] albums count:', albums?.length ?? 0)
  console.log('[ArtistPage] topTracks count:', topTracks?.length ?? 0)

  // ── Pre‑mount / SSR — show skeleton immediately ──────────
  if (!mounted) {
    return (
      <AppShell>
        <div className="space-y-8 animate-pulse">
          <div className="relative -mx-6 -mt-8 h-72 bg-gradient-to-b from-clark-bg-secondary/30 to-clark-bg-primary" />
          <div className="h-8 bg-clark-bg-secondary/50 rounded w-48" />
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 bg-clark-bg-secondary/30 rounded-xl" />
            ))}
          </div>
        </div>
      </AppShell>
    )
  }

  // ── Loading — only when NO data at all ─────────────────────
  if (artistLoading && !artist) {
    return (
      <AppShell>
        <div className="space-y-8 animate-pulse">
          <div className="relative -mx-6 -mt-8 h-64 bg-gradient-to-b from-clark-bg-secondary/30 to-clark-bg-primary" />
          <div className="h-8 bg-clark-bg-secondary/50 rounded w-48" />
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 bg-clark-bg-secondary/30 rounded-xl" />
            ))}
          </div>
        </div>
      </AppShell>
    )
  }

  // ── Error — artist API failed ────────────────────────────
  // Show degraded page with name from URL + retry
  if (artistError && !artist) {
    return (
      <AppShell>
        <div className="space-y-8">
          {/* Degraded hero — shows artist name from URL */}
          <div className="relative -mx-6 -mt-8 h-64 bg-gradient-to-b from-clark-bg-secondary to-clark-bg-primary overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-clark-bg-primary via-transparent to-transparent" />
            <div className="relative z-10 flex items-end h-full px-6 pb-6">
              <div className="flex-1 min-w-0">
                <h1 className="font-display text-4xl md:text-7xl tracking-widest uppercase text-clark-text-primary truncate">
                  {artistDisplayName}
                </h1>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center py-16 text-center">
            <AlertCircle className="w-12 h-12 text-clark-gold/60 mb-4" />
            <h2 className="font-display text-xl text-clark-text-primary mb-2">{t('couldNotLoadArtist')}</h2>
            <p className="font-body text-sm text-clark-text-muted mb-4 max-w-md">
              {t('unexpectedErrorArtist')}
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => refetchArtist()}
                className="flex items-center gap-2 px-4 py-2 bg-clark-accent hover:bg-clark-accent-hover text-white rounded-full font-body text-sm transition-colors"
              >
                <RefreshCw className="w-4 h-4" /> {t('retry')}
              </button>
              <Link href="/artists" className="text-clark-gold font-body text-sm hover:underline">
                {t('backToArtists')}
              </Link>
            </div>
          </div>
        </div>
      </AppShell>
    )
  }

  // ── Fallback — no artist data but no explicit error ──────
  if (!artist) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Music className="w-12 h-12 text-clark-text-muted/30 mb-4" />
          <h2 className="font-display text-xl text-clark-text-primary mb-2">
            {artistDisplayName}
          </h2>
          <button
            onClick={() => refetchArtist()}
            className="flex items-center gap-2 px-4 py-2 bg-clark-accent hover:bg-clark-accent-hover text-white rounded-full font-body text-sm transition-colors mt-4"
          >
            <RefreshCw className="w-4 h-4" /> Load Artist
          </button>
        </div>
      </AppShell>
    )
  }

  // ── Play helpers ────────────────────────────────────────────
  function handlePlayAll() {
    if (topTracks.length > 0) {
      setQueue(topTracks.map((tr, i) => toPlayerTrack(tr, i, artist?.name ?? artistDisplayName)))
    }
  }

  function handlePlayTrack(item: CatalogTrackItem, idx: number) {
    playWithAlbumQueue(item, idx)
  }

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Hero banner */}
        <div className="relative -mx-6 -mt-8 h-72 bg-gradient-to-b from-clark-bg-secondary to-clark-bg-primary overflow-hidden">
          <div className="absolute inset-0 opacity-30">
            {artist.image_url && (
              <Image
                src={artist.image_url}
                alt=""
                fill
                sizes="100vw"
                className="object-cover blur-xl scale-110"
                aria-hidden="true"
                priority
              />
            )}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-clark-bg-primary via-transparent to-transparent" />
          <div className="relative z-10 flex items-end gap-6 h-full px-6 pb-6">
            <div className="relative w-44 h-44 rounded-full overflow-hidden bg-gradient-to-br from-clark-steel to-clark-bg-card flex-shrink-0 border-4 border-clark-bg-primary shadow-2xl">
              {artist.image_url ? (
                <Image
                  src={artist.image_url}
                  alt={`${artistDisplayName} artist photo`}
                  fill
                  sizes="11rem"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="font-display text-6xl text-white/30">
                    {artistDisplayName.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {artist.popularity > 50 && (
                  <span className="flex items-center gap-1 font-body font-medium text-xs text-clark-gold">
                    <Check className="w-4 h-4" /> Verified
                  </span>
                )}
              </div>
              <h1 className="font-display text-4xl md:text-7xl tracking-widest uppercase text-clark-text-primary truncate">
                {artistDisplayName}
              </h1>
              {artist.genres && artist.genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {artist.genres.slice(0, 5).map((g) => (
                    <span
                      key={g}
                      className="px-3 py-1 rounded-full bg-clark-bg-card/80 text-xs font-body text-clark-text-muted border border-clark-steel/20"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-4 mt-3">
                {artist.track_count > 0 && (
                  <span className="flex items-center gap-1.5 font-body text-sm text-clark-text-muted">
                    <Music className="w-4 h-4" />
                    {artist.track_count.toLocaleString()} tracks
                  </span>
                )}
                {artist.popularity > 0 && (
                  <span className="flex items-center gap-1.5 font-body text-sm text-clark-text-muted">
                    <Activity className="w-4 h-4" />
                    {artist.popularity} popularity
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        {artist.bio && (
          <section>
            <h2 className="font-condensed text-xs tracking-widest text-clark-gold uppercase mb-3">About</h2>
            <p className="font-body text-sm text-clark-text-muted leading-relaxed line-clamp-4">
              {artist.bio}
            </p>
          </section>
        )}

        {/* Top Tracks — independent section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-condensed text-xs tracking-widest text-clark-gold uppercase">
              {t('topTracks')}
            </h2>
            {topTracks.length > 0 && (
              <button
                onClick={handlePlayAll}
                className="flex items-center gap-2 px-4 py-2 bg-clark-accent hover:bg-clark-accent-hover text-white rounded-full font-body font-medium text-sm transition-colors"
              >
                <Play className="w-4 h-4 ml-0.5" />
                {t('playAction')}
              </button>
            )}
          </div>

          {tracksLoading && topTracks.length === 0 ? (
            <div className="space-y-2 animate-pulse">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-14 bg-clark-bg-secondary/30 rounded-xl" />
              ))}
            </div>
          ) : tracksError && topTracks.length === 0 ? (
            <p className="font-body text-sm text-clark-text-muted/60 py-4">
              Tracks temporarily unavailable
            </p>
          ) : topTracks.length > 0 ? (
            <div className="space-y-0.5">
              {topTracks.map((track, idx) => {
                const hasPreview = !!track.preview_url
                return (
                  <div
                    key={track.id ?? idx}
                    role="button"
                    tabIndex={0}
                    aria-label={`Play ${track.title} by ${track.artist_name || artistDisplayName}`}
                    className="group flex items-center gap-4 px-4 py-2.5 rounded-xl hover:bg-clark-bg-secondary/60 transition-all duration-200 cursor-pointer border border-transparent hover:border-clark-steel/20"
                    onClick={() => handlePlayTrack(track, idx)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handlePlayTrack(track, idx) } }}
                  >
                    <span className="w-6 text-right font-condensed text-xs text-clark-text-muted/50 flex-shrink-0">
                      {idx + 1}
                    </span>
                    <div className="relative w-10 h-10 rounded overflow-hidden flex-shrink-0 bg-clark-bg-card">
                      {track.album_cover ? (
                        <Image
                          src={track.album_cover}
                          alt={`${track.title} cover`}
                          fill
                          sizes="2.5rem"
                          className="object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Music className="w-4 h-4 text-white/20" />
                        </div>
                      )}
                      <button
                        className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handlePlayTrack(track, idx)}
                        aria-label={`Play ${track.title}`}
                      >
                        <Play className="w-5 h-5 text-white ml-0.5" />
                      </button>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-body font-medium text-sm text-clark-text-primary truncate">
                        {track.title}
                      </p>
                      <p className="font-body text-xs text-clark-text-muted/70 truncate">
                        {track.artist_name || artistDisplayName}
                      </p>
                    </div>
                    {track.popularity > 0 && (
                      <div className="hidden sm:block w-16">
                        <div className="h-1 bg-clark-bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-clark-gold to-clark-accent"
                            style={{ width: `${Math.min(track.popularity, 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                    {hasPreview && (
                      <button
                        className="flex items-center gap-1 p-1.5 rounded-lg hover:bg-clark-gold/10 text-clark-gold transition-colors group/preview cursor-default"
                        aria-label={`Preview ${track.title}`}
                        title={t('previewLabel')}
                      >
                        <Headphones className="w-4 h-4" />
                        <span className="hidden group-hover/preview:inline font-condensed text-[10px] tracking-wider uppercase">
                          {t('previewLabel')}
                        </span>
                      </button>
                    )}
                    {track.duration_ms && (
                      <span className="font-condensed text-xs text-clark-text-muted flex-shrink-0 w-10 text-right">
                        {formatDuration(track.duration_ms)}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          ) : null}
        </section>

        {/* Albums — independent section */}
        <section>
          <h2 className="font-condensed text-xs tracking-widest text-clark-gold uppercase mb-4">
            Albums
          </h2>

          {albumsLoading && albums.length === 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 animate-pulse">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-3 rounded-xl bg-clark-bg-secondary">
                  <div className="aspect-square rounded-lg bg-clark-bg-card" />
                  <div className="h-4 bg-clark-bg-card rounded mt-3 w-3/4" />
                </div>
              ))}
            </div>
          ) : albumsError && albums.length === 0 ? (
            <p className="font-body text-sm text-clark-text-muted/60 py-4">
              Albums temporarily unavailable
            </p>
          ) : albums.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {albums.slice(0, 10).map((album) => (
                <Link
                  key={album.id}
                  href={`/albums/${album.id}`}
                  className="group block p-3 rounded-xl bg-clark-bg-secondary hover:bg-clark-bg-card transition-all duration-200 border border-transparent hover:border-clark-steel/20"
                >
                  <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-clark-steel to-clark-bg-card shadow-md">
                    {album.cover_url ? (
                      <Image
                        src={album.cover_url}
                        alt={album.title}
                        fill
                        sizes="(max-width: 640px) 50vw, 20vw"
                        className="object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Disc3 className="w-8 h-8 text-white/20" />
                      </div>
                    )}
                  </div>
                  <p className="font-body font-semibold text-sm text-clark-text-primary mt-2 truncate">
                    {album.title}
                  </p>
                  <p className="font-body text-xs text-clark-text-muted truncate">
                    {album.track_count > 0 ? `${album.track_count} tracks` : album.release_date ?? ''}
                  </p>
                </Link>
              ))}
            </div>
          ) : null}
        </section>

        {/* Empty state — no tracks, no albums */}
        {topTracks.length === 0 && albums.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Music className="w-12 h-12 text-clark-text-muted/30 mb-4" />
            <p className="font-body text-clark-text-muted">
              {t('noTracksOrAlbums')}
            </p>
          </div>
        )}
      </div>
    </AppShell>
  )
}

export default function ArtistDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense>
      <ArtistDetailInner params={params} />
    </Suspense>
  )
}
