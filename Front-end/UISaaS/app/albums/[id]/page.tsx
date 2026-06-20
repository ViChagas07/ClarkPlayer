'use client'

import React, { Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { AppShell } from '@/components/layout/AppShell'
import { usePlayerStore } from '@/store/playerStore'
import { useAlbum } from '@/hooks/useCatalog'
import { useTranslation } from '@/hooks/useTranslation'
import type { CatalogTrackItem, CatalogAlbumItem, Track } from '@/types'
import {
  Play,
  ArrowLeft,
  Music,
  Disc3,
  Clock,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import { TrackLine } from '@/components/track/TrackLine'

// ── Track to player Track mapper ────────────────────────────
function toPlayerTrack(item: CatalogTrackItem, idx: number, artistName: string): Track {
  return {
    id: item.id,
    title: item.title,
    artist: item.artist_name || artistName,
    album: item.album_title ?? '',
    duration: item.duration_ms ? Math.round(item.duration_ms / 1000) : 200,
    format: 'MP3',
    coverUrl: item.album_cover ?? undefined,
    previewUrl: item.preview_url ?? null,
  }
}

// ── Inner client component ─────────────────────────────────
function AlbumDetailInner({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params)
  const { t } = useTranslation()
  const { setQueue } = usePlayerStore()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const albumId = resolvedParams.id

  const {
    data: albumData,
    isLoading,
    isError,
    refetch,
  } = useAlbum(mounted ? albumId : '')

  // ── Extract data ──────────────────────────────────────────
  // Backend returns flat CatalogAlbumDetailResponse (no wrapper).
  // We construct the album + artist objects here for backward compat with
  // the rest of the page.
  const album: CatalogAlbumItem | undefined = albumData
    ? {
        id: albumData.id,
        title: albumData.title,
        artist_name: albumData.artist_name,
        cover_url: albumData.cover_url,
        release_date: albumData.release_date,
        track_count: albumData.track_count,
        genres: [],
      }
    : undefined

  const tracks: CatalogTrackItem[] = albumData?.tracks ?? []

  const artist: { id: string; name: string } | null = albumData
    ? { id: albumData.artist_id, name: albumData.artist_name }
    : null

  // ── Play helpers ──────────────────────────────────────────
  const { playPreview } = usePlayerStore()

  function handlePlayAll() {
    if (tracks.length > 0) {
      const queue = tracks.map((tr, i) =>
        toPlayerTrack(tr, i, album?.artist_name ?? artist?.name ?? 'Unknown Artist'),
      )
      setQueue(queue)
    }
  }

  function handlePlayTrack(item: CatalogTrackItem, idx: number) {
    if (!item.preview_url) return

    const artistName = album?.artist_name ?? artist?.name ?? 'Unknown Artist'

    // 1. Play this track immediately (synchronous, no async race)
    const track = toPlayerTrack(item, idx, artistName)
    playPreview(item.preview_url, track)

    // 2. Populate queue with all album tracks (already in memory)
    const queue = tracks
      .filter((t) => t.preview_url)
      .map((t, i) => toPlayerTrack(t, i, artistName))
    if (queue.length > 0) {
      const currentIndex = queue.findIndex((t) => t.id === item.id)
      setQueue(queue, currentIndex >= 0 ? currentIndex : 0)
    }
  }

  // ── Pre-mount / SSR skeleton ──────────────────────────────
  if (!mounted) {
    return (
      <AppShell>
        <div className="space-y-8 animate-pulse">
          <div className="h-8 bg-clark-bg-secondary/50 rounded w-32" />
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-end">
            <div className="w-56 h-56 rounded-xl bg-clark-bg-secondary" />
            <div className="space-y-3 flex-1">
              <div className="h-8 bg-clark-bg-secondary/50 rounded w-3/4" />
              <div className="h-4 bg-clark-bg-secondary/30 rounded w-1/3" />
              <div className="h-4 bg-clark-bg-secondary/30 rounded w-1/4" />
            </div>
          </div>
        </div>
      </AppShell>
    )
  }

  // ── Loading ───────────────────────────────────────────────
  if (isLoading && !album) {
    return (
      <AppShell>
        <div className="space-y-8 animate-pulse">
          <div className="h-8 bg-clark-bg-secondary/50 rounded w-32" />
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-end">
            <div className="w-56 h-56 rounded-xl bg-clark-bg-secondary" />
            <div className="space-y-3 flex-1">
              <div className="h-8 bg-clark-bg-secondary/50 rounded w-3/4" />
              <div className="h-4 bg-clark-bg-secondary/30 rounded w-1/3" />
              <div className="h-4 bg-clark-bg-secondary/30 rounded w-1/4" />
            </div>
          </div>
        </div>
      </AppShell>
    )
  }

  // ── Error ─────────────────────────────────────────────────
  if (isError && !album) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertCircle className="w-12 h-12 text-clark-gold/60 mb-4" />
          <h2 className="font-display text-xl text-clark-text-primary mb-2">
            {t('couldNotLoadAlbum')}
          </h2>
          <p className="font-body text-sm text-clark-text-muted mb-4 max-w-md">
            {t('unexpectedErrorAlbum')}
          </p>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2 bg-clark-accent hover:bg-clark-accent-hover text-white rounded-full font-body text-sm transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> {t('retry')}
          </button>
        </div>
      </AppShell>
    )
  }

  // ── Not found ─────────────────────────────────────────────
  if (!album) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Disc3 className="w-12 h-12 text-clark-text-muted/30 mb-4" />
          <h2 className="font-display text-xl text-clark-text-primary mb-2">
            Album not found
          </h2>
          <Link
            href="/artists"
            className="mt-4 text-clark-gold font-body text-sm hover:underline"
          >
            Back to Artists
          </Link>
        </div>
      </AppShell>
    )
  }

  const artistName = album.artist_name ?? artist?.name ?? 'Unknown Artist'

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Back button */}
        <Link
          href={artist ? `/artists/${artist.id}?name=${encodeURIComponent(artist.name)}` : '/artists'}
          className="inline-flex items-center gap-1.5 font-body text-sm text-clark-text-muted hover:text-clark-text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {artist ? artist.name : 'Back to Artists'}
        </Link>

        {/* Album hero */}
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-end">
          <div className="relative w-56 h-56 rounded-xl overflow-hidden bg-gradient-to-br from-clark-steel to-clark-bg-card shadow-xl flex-shrink-0">
            {album.cover_url ? (
              <Image
                src={album.cover_url}
                alt={album.title}
                fill
                sizes="14rem"
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Disc3 className="w-16 h-16 text-white/20" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 text-center md:text-left">
            <h1 className="font-display text-3xl md:text-5xl tracking-widest uppercase text-clark-text-primary truncate">
              {album.title}
            </h1>
            <Link
              href={artist ? `/artists/${artist.id}?name=${encodeURIComponent(artist.name)}` : '#'}
              className="font-body text-base text-clark-gold hover:underline mt-1 inline-block"
            >
              {artistName}
            </Link>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-3">
              {album.release_date && (
                <span className="flex items-center gap-1.5 font-body text-sm text-clark-text-muted">
                  <Clock className="w-4 h-4" />
                  {album.release_date.slice(0, 4)}
                </span>
              )}
              {tracks.length > 0 && (
                <span className="flex items-center gap-1.5 font-body text-sm text-clark-text-muted">
                  <Music className="w-4 h-4" />
                  {tracks.length} track{tracks.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {tracks.length > 0 && (
              <button
                onClick={handlePlayAll}
                className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-clark-accent hover:bg-clark-accent-hover text-white rounded-full font-body font-medium text-sm transition-colors"
              >
                <Play className="w-4 h-4 ml-0.5" />
                Play All
              </button>
            )}
          </div>
        </div>

        {/* Track list */}
        <section>
          {tracks.length > 0 ? (
            <div className="space-y-0.5">
              {/* Header */}
              <div className="flex items-center gap-4 px-4 py-2 text-xs font-condensed tracking-widest text-clark-text-muted/50 uppercase">
                <span className="w-8 text-center">#</span>
                <span className="flex-1">Title</span>
                <span className="w-16 hidden sm:block text-right">
                  <Clock className="w-3.5 h-3.5 inline" />
                </span>
              </div>

              {tracks.map((track, idx) => (
                <TrackLine
                  key={track.id ?? idx}
                  data={{
                    id: track.id,
                    title: track.title,
                    artistName: track.artist_name || artistName,
                    coverUrl: track.album_cover,
                    previewUrl: track.preview_url,
                    durationMs: track.duration_ms,
                    popularity: track.popularity,
                  }}
                  variant="row"
                  index={idx}
                  onPlay={() => handlePlayTrack(track, idx)}
                  showPopularity={true}
                  showDuration={true}
                  showPreviewIndicator={true}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Music className="w-12 h-12 text-clark-text-muted/30 mb-4" />
              <p className="font-body text-clark-text-muted">
                {t('noTracksFoundForAlbum')}
              </p>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  )
}

export default function AlbumDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense>
      <AlbumDetailInner params={params} />
    </Suspense>
  )
}
