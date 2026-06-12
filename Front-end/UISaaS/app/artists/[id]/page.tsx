'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { AppShell } from '@/components/layout/AppShell'
import { useTranslation } from '@/hooks/useTranslation'
import { usePlayerStore } from '@/store/playerStore'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import type { UnifiedArtistResponse, Track } from '@/types'
import {
  Play,
  Check,
  Music,
  Loader2,
  AlertCircle,
  Activity,
  Users,
  Disc3,
  Headphones,
} from 'lucide-react'

export default function ArtistDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { t } = useTranslation()
  const resolvedParams = React.use(params)
  const { setQueue, currentTrack, isPlaying } = usePlayerStore()
  const [artist, setArtist] = useState<UnifiedArtistResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const mbid = resolvedParams.id

  useEffect(() => {
    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await api.musicArtist(mbid)
        setArtist(data)
      } catch {
        setError('Failed to load artist profile.')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [mbid])

  function toTrack(t: Record<string, unknown>, idx: number): Track {
    const name = (t as { name?: string }).name ?? 'Unknown'
    const artists = (t as { artists?: Array<{ name: string }> }).artists
    const duration = (t as { duration_ms?: number }).duration_ms
    return {
      id: ((t as { id?: string }).id) ?? `top-${idx}`,
      title: name,
      artist: artists?.[0]?.name ?? artist?.name ?? '',
      album: ((t as { album?: { name: string; images?: Array<{ url: string }> } }).album)?.name ?? '',
      duration: duration ? Math.round(duration / 1000) : 200,
      format: 'MP3',
      coverUrl: ((t as { album?: { images?: Array<{ url: string }> } }).album)?.images?.[0]?.url ?? artist?.image_url ?? undefined,
      previewUrl: ((t as { preview_url?: string }).preview_url) ?? null,
    }
  }

  function handlePlayAll() {
    const topTracks = artist?.top_tracks ?? []
    if (topTracks.length > 0) {
      setQueue(topTracks.map((t, i) => toTrack(t as unknown as Record<string, unknown>, i)))
    }
  }

  function handlePlayTrack(t: Record<string, unknown>, idx: number) {
    const all = artist?.top_tracks ?? []
    setQueue(all.map((tr, i) => toTrack(tr as unknown as Record<string, unknown>, i)), idx)
  }

  // Loading state
  if (isLoading) {
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

  // Error state
  if (error || !artist) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertCircle className="w-12 h-12 text-clark-accent mb-4" />
          <h2 className="font-display text-xl text-clark-text-primary mb-2">
            {error ?? 'Artist not found'}
          </h2>
          <Link href="/artists" className="text-clark-gold font-body text-sm hover:underline">
            Back to Artists
          </Link>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Hero banner */}
        <div className="relative -mx-6 -mt-8 h-72 bg-gradient-to-b from-clark-bg-secondary to-clark-bg-primary overflow-hidden">
          <div className="absolute inset-0 opacity-30">
            {artist.image_url && (
              <img
                src={artist.image_url}
                alt=""
                className="w-full h-full object-cover blur-xl scale-110"
                aria-hidden="true"
              />
            )}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-clark-bg-primary via-transparent to-transparent" />
          <div className="relative z-10 flex items-end gap-6 h-full px-6 pb-6">
            {/* Artist image */}
            <div className="w-44 h-44 rounded-full overflow-hidden bg-gradient-to-br from-clark-steel to-clark-bg-card flex-shrink-0 border-4 border-clark-bg-primary shadow-2xl">
              {artist.image_url ? (
                <img src={artist.image_url} alt={artist.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="font-display text-6xl text-white/30">{artist.name.charAt(0)}</span>
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
                {artist.name}
              </h1>
              {/* Genre tags */}
              {artist.genres.length > 0 && (
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
              {/* Stats */}
              <div className="flex items-center gap-4 mt-3">
                {artist.playcount > 0 && (
                  <span className="flex items-center gap-1.5 font-body text-sm text-clark-text-muted">
                    <Users className="w-4 h-4" />
                    {artist.playcount.toLocaleString()} listeners
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

        {/* Top Tracks */}
        {artist.top_tracks.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-condensed text-xs tracking-widest text-clark-gold uppercase">
                {t('topTracks')}
              </h2>
              <button
                onClick={handlePlayAll}
                className="flex items-center gap-2 px-4 py-2 bg-clark-accent hover:bg-clark-accent-hover text-white rounded-full font-body font-medium text-sm transition-colors"
              >
                <Play className="w-4 h-4 ml-0.5" />
                {t('playAction')}
              </button>
            </div>
            <div className="space-y-0.5">
              {artist.top_tracks.map((track, idx) => {
                const tr = track as unknown as Record<string, unknown>
                const name = (tr as { name?: string }).name ?? 'Unknown'
                const artistNames = (tr as { artists?: Array<{ name: string }> }).artists?.map(a => a.name).join(', ') ?? ''
                const album = (tr as { album?: { name: string; images?: Array<{ url: string }> } }).album
                const duration = (tr as { duration_ms?: number }).duration_ms
                const popularity = (tr as { popularity?: number }).popularity ?? 0
                const previewUrl = (tr as { preview_url?: string }).preview_url

                return (
                  <div
                    key={tr.id as string ?? idx}
                    className="group flex items-center gap-4 px-4 py-2.5 rounded-xl hover:bg-clark-bg-secondary/60 transition-all duration-200 cursor-pointer border border-transparent hover:border-clark-steel/20"
                    onDoubleClick={() => handlePlayTrack(tr as Record<string, unknown>, idx)}
                  >
                    {/* Index */}
                    <span className="w-6 text-right font-condensed text-xs text-clark-text-muted/50 flex-shrink-0">
                      {idx + 1}
                    </span>

                    {/* Cover */}
                    <div className="relative w-10 h-10 rounded overflow-hidden flex-shrink-0 bg-clark-bg-card">
                      {album?.images?.[0]?.url ? (
                        <img src={album.images[0].url} alt="" className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Music className="w-4 h-4 text-white/20" />
                        </div>
                      )}
                      <button
                        className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handlePlayTrack(tr as Record<string, unknown>, idx)}
                        aria-label={`Play ${name}`}
                      >
                        <Play className="w-5 h-5 text-white ml-0.5" />
                      </button>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-body font-medium text-sm text-clark-text-primary truncate">
                        {name}
                      </p>
                      <p className="font-body text-xs text-clark-text-muted/70 truncate">
                        {artistNames || artist.name}
                      </p>
                    </div>

                    {/* Popularity */}
                    {popularity > 0 && (
                      <div className="hidden sm:block w-16">
                        <div className="h-1 bg-clark-bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-clark-gold to-clark-accent"
                            style={{ width: `${popularity}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {previewUrl && (
                      <button
                        className="flex items-center gap-1 p-1.5 rounded-lg hover:bg-clark-gold/10 text-clark-gold transition-colors group/preview"
                        onClick={(e) => {
                          e.stopPropagation()
                          usePlayerStore.getState().playPreview(previewUrl, toTrack(tr as Record<string, unknown>, idx))
                        }}
                        aria-label={`Preview ${name}`}
                        title={t('previewLabel')}
                      >
                        <Headphones className="w-4 h-4" />
                        <span className="hidden group-hover/preview:inline font-condensed text-[10px] tracking-wider uppercase">
                          {t('previewLabel')}
                        </span>
                      </button>
                    )}

                    {/* Duration */}
                    {duration && (
                      <span className="font-condensed text-xs text-clark-text-muted flex-shrink-0">
                        {Math.floor(Number(duration) / 60000)}:{(Math.floor(Number(duration) / 1000) % 60).toString().padStart(2, '0')}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Tags */}
        {artist.tags.length > 0 && (
          <section>
            <h2 className="font-condensed text-xs tracking-widest text-clark-gold uppercase mb-3">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {artist.tags.slice(0, 15).map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1.5 rounded-full bg-clark-bg-secondary text-xs font-body text-clark-text-muted border border-clark-steel/10"
                >
                  {tag}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Similar Artists */}
        {artist.similar_artists.length > 0 && (
          <section>
            <h2 className="font-condensed text-xs tracking-widest text-clark-gold uppercase mb-4">
              {t('similarArtists')}
            </h2>
            <div className="flex gap-6 overflow-x-auto pb-2">
              {artist.similar_artists.slice(0, 8).map((sa, idx) => {
                const name = sa.name ?? 'Unknown'
                const saMbid = sa.id ?? sa.mbid
                const imgUrl = sa.images?.[0]?.url
                return (
                  <Link
                    key={saMbid ?? idx}
                    href={saMbid ? `/artists/${saMbid}` : '#'}
                    className="flex flex-col items-center text-center flex-shrink-0 group"
                  >
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-clark-steel to-clark-bg-card group-hover:scale-105 transition-transform">
                      {imgUrl ? (
                        <img src={imgUrl} alt={name} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="font-display text-2xl text-white/30">{name.charAt(0)}</span>
                        </div>
                      )}
                    </div>
                    <p className="font-body font-medium text-xs mt-2 text-clark-text-primary w-20 truncate">
                      {name}
                    </p>
                  </Link>
                )
              })}
            </div>
          </section>
        )}
      </div>
    </AppShell>
  )
}
