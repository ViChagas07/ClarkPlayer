'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { AppShell } from '@/components/layout/AppShell'
import { GenreMosaic } from '@/components/GenreMosaic'
import { useTranslation } from '@/hooks/useTranslation'
import { usePlayerStore } from '@/store/playerStore'
import { api } from '@/lib/api'
import { useGenre } from '@/hooks/useCatalog'
import { getGenreImage, getGenreGradient } from '@/lib/genre-image-map'
import type { CatalogTrackItem, Track } from '@/types'
import { Play, Music, ChevronLeft, Headphones } from 'lucide-react'
import Image from 'next/image'

const genreDisplayNames: Record<string, string> = {
  rock: 'Rock', pop: 'Pop', jazz: 'Jazz', classical: 'Classical', rnb: 'R&B',
  'hip-hop': 'Hip-Hop', soul: 'Soul', blues: 'Blues', ambient: 'Ambient',
  electronic: 'Electronic', house: 'House', techno: 'Techno', 'lo-fi': 'Lo-fi',
  indie: 'Indie', reggae: 'Reggae', samba: 'Samba', mpb: 'MPB', latin: 'Latin',
  gospel: 'Gospel', pagode: 'Pagode', 'heavy-metal': 'Heavy Metal', rap: 'Rap',
  forro: 'Forr\u00f3', funk: 'Funk', sertanejo: 'Sertanejo', romantic: 'Romantic', trap: 'Trap',
}

/** Convert a CatalogTrackItem to the UI Track type expected by the player store. */
function toTrack(t: CatalogTrackItem, fallbackSlug: string, idx: number): Track {
  return {
    id: t.id,
    title: t.title,
    artist: t.artist_name,
    album: t.album_title ?? '',
    duration: t.duration_ms ? Math.round(t.duration_ms / 1000) : 200,
    format: 'MP3' as const,
    coverUrl: t.album_cover ?? undefined,
    previewUrl: t.preview_url,
  }
}

export default function GenreDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { t } = useTranslation()
  const resolvedParams = React.use(params)
  const { setQueue } = usePlayerStore()
  const [tracks, setTracks] = useState<CatalogTrackItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const slug = resolvedParams.slug
  const displayName = genreDisplayNames[slug] ?? slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

  // ── Genre metadata (mosaic_images, gradient) ──────────────────────
  const { data: genreData } = useGenre(slug)
  const gradient = getGenreGradient(slug)
  const localImage = getGenreImage(slug)

  // ── Tracks ────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false

    async function loadGenreTracks() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await api.catalogGenreTracks(slug, 50, 0)
        if (!cancelled) {
          setTracks(data.items)
        }
      } catch (err) {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : 'Failed to load genre tracks'
          console.error('[GenreDetail]', msg)
          setError('N\u00e3o foi poss\u00edvel carregar as faixas deste g\u00eanero.')
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    loadGenreTracks()

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug])

  function handlePlay(track: CatalogTrackItem, idx: number) {
    if (!track.preview_url) return

    // 1. Play immediately via playPreview (usePreviewPlayer only fires when isPreview=true)
    const trackObj = toTrack(track, slug, idx)
    usePlayerStore.getState().playPreview(track.preview_url, trackObj)

    // 2. Set up queue for next/prev navigation
    const queue: Track[] = tracks.map((t, i) => toTrack(t, slug, i))
    const currentIndex = queue.findIndex((t) => t.id === track.id)
    setQueue(queue, currentIndex >= 0 ? currentIndex : idx)
  }

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header with genre image banner or gradient fallback (Spotify style) */}
        <div className={`relative h-48 sm:h-56 rounded-xl overflow-hidden bg-gradient-to-br ${gradient.from} ${gradient.to}`}>
          {/* Mosaic images — positioned at right */}
          {genreData?.mosaic_images && genreData.mosaic_images.length > 0 && (
            <div className="absolute top-0 right-0 h-full z-0" style={{ width: '45%' }}>
              <GenreMosaic
                images={genreData.mosaic_images}
                genreName={displayName}
                gradientFrom={gradient.from}
                gradientTo={gradient.to}
                size="100%"
              />
            </div>
          )}

          {/* Fallback: local static image (when no mosaic) */}
          {(!genreData?.mosaic_images || genreData.mosaic_images.length === 0) && localImage && (
            <Image
              src={localImage}
              alt={displayName}
              fill
              className="object-cover z-0"
              sizes="100vw"
              priority
            />
          )}

          {/* Subtle overlay for bottom text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-clark-bg-primary via-clark-bg-primary/40 to-transparent z-[1]" />

          {/* Title + back button */}
          <div className="absolute bottom-0 left-0 right-0 p-6 flex items-center gap-4 z-10">
            <Link href="/genres" className="p-2 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors shrink-0">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-display text-3xl tracking-widest uppercase text-white drop-shadow-lg">{displayName}</h1>
              <p className="font-body text-sm text-white/70 mt-1">
                {isLoading ? 'Searching...' : `${tracks.length} tracks with preview`}
              </p>
            </div>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Music className="w-12 h-12 text-clark-text-muted/30 mb-4" />
            <p className="font-body text-clark-text-muted">{error}</p>
            <Link href="/genres" className="mt-3 text-clark-gold font-body text-sm hover:underline">
              Back to Genres
            </Link>
          </div>
        )}

        {/* Track grid — Spotify-style cards, only tracks with preview_url */}
        {!error && (isLoading ? (
          <div role="status" aria-label="Loading tracks" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="p-3 rounded-xl bg-clark-bg-secondary animate-pulse">
                <div className="aspect-square rounded-lg bg-clark-bg-card" />
                <div className="h-4 bg-clark-bg-card rounded mt-3 w-3/4" />
                <div className="h-3 bg-clark-bg-card rounded mt-1 w-1/2" />
              </div>
            ))}
            <span className="sr-only">Loading tracks...</span>
          </div>
        ) : tracks.length > 0 ? (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Music className="w-5 h-5 text-clark-gold" />
              <h2 className="font-display text-lg tracking-widest uppercase text-clark-text-primary">
                Preview Tracks
              </h2>
              <span className="font-condensed text-xs text-clark-text-muted">({tracks.length})</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {tracks.map((track, idx) => {
                const coverUrl = track.album_cover
                const previewUrl = track.preview_url

                return (
                  <div
                    key={track.id}
                    onClick={() => handlePlay(track, idx)}
                    className="group p-3 rounded-xl bg-clark-bg-secondary hover:bg-clark-bg-card transition-all duration-200 cursor-pointer hover:scale-[1.02] border border-transparent hover:border-clark-steel/20"
                  >
                    {/* Album art with play overlay */}
                    <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-clark-steel to-clark-bg-card shadow-md">
                      {coverUrl ? (
                        <Image
                          src={coverUrl}
                          alt={`${track.title} album cover`}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Music className="w-8 h-8 text-white/20" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center" aria-label={`Play ${track.title}`}>
                        <div className="w-10 h-10 rounded-full bg-clark-accent flex items-center justify-center shadow-lg">
                          <Play className="w-4 h-4 text-white ml-0.5" />
                        </div>
                      </div>
                    </div>

                    {/* Track info */}
                    <div className="flex items-center gap-2 mt-3">
                      <p className="font-body font-semibold text-sm text-clark-text-primary truncate flex-1">
                        {track.title}
                      </p>
                      {previewUrl && (
                        <span
                          className="flex-shrink-0 p-1 rounded-lg text-clark-gold transition-colors"
                          aria-hidden="true"
                          title={t('previewLabel')}
                        >
                          <Headphones className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                    <p className="font-body text-xs text-clark-text-muted truncate">
                      {track.artist_name}
                    </p>

                    {/* Popularity bar */}
                    {track.popularity > 0 && (
                      <div className="mt-2 h-1 bg-clark-bg-primary rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-clark-gold to-clark-accent"
                          style={{ width: `${track.popularity}%` }}
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Music className="w-12 h-12 text-clark-text-muted/30 mb-4" />
            <p className="font-body text-clark-text-muted">No preview tracks found for {displayName}.</p>
            <Link href="/search" className="mt-3 text-clark-gold font-body text-sm hover:underline">
              Go to Search
            </Link>
          </div>
        ))}
      </div>
    </AppShell>
  )
}
