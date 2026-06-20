'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { AppShell } from '@/components/layout/AppShell'
import { useTranslation } from '@/hooks/useTranslation'
import { usePlayerStore } from '@/store/playerStore'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import type { UnifiedTrackResponse, Track } from '@/types'
import {
  Play,
  Loader2,
  AlertCircle,
  Clock,
  BarChart3,
  Activity,
  Heart,
  Music,
  Disc3,
  ChevronRight,
  Globe,
  Calendar,
} from 'lucide-react'
import { TrackLine } from '@/components/track/TrackLine'

const KEY_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

function AudioFeatureBar({
  label,
  value,
  max = 1,
  unit = '',
  color = 'from-clark-gold to-clark-accent',
}: {
  label: string
  value: number | null
  max?: number
  unit?: string
  color?: string
}) {
  if (value === null || value === undefined) return null
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div className="flex items-center gap-3">
      <span className="w-24 font-body text-xs text-clark-text-muted flex-shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-clark-bg-secondary rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full bg-gradient-to-r transition-all', color)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-16 text-right font-condensed text-xs text-clark-text-muted">
        {typeof value === 'number' ? value.toFixed(1) : value}{unit}
      </span>
    </div>
  )
}

export default function TrackDetailPage({ params }: { params: Promise<{ mbid: string }> }) {
  const { t } = useTranslation()
  const resolvedParams = React.use(params)
  const { setQueue, currentTrack, isPlaying } = usePlayerStore()
  const [trackData, setTrackData] = useState<UnifiedTrackResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showFullLyrics, setShowFullLyrics] = useState(false)

  const mbid = resolvedParams.mbid

  useEffect(() => {
    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await api.musicTrack(mbid)
        setTrackData(data)
      } catch {
        setError('Failed to load track information.')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [mbid])

  function toTrack(): Track {
    const t = trackData?.track
    return {
      id: t?.mbid ?? mbid,
      title: t?.title ?? 'Unknown',
      artist: trackData?.artist?.name ?? 'Unknown',
      album: trackData?.album?.title ?? '',
      duration: t?.duration ? Math.round(t.duration / 1000) : 200,
      format: 'MP3',
      coverUrl: trackData?.album?.cover_url ?? undefined,
    }
  }

  function handlePlay() {
    setQueue([toTrack()])
  }

  function formatDuration(ms: number | null): string {
    if (!ms) return '--:--'
    const totalSec = Math.round(ms / 1000)
    const m = Math.floor(totalSec / 60)
    const s = totalSec % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  // Loading
  if (isLoading) {
    return (
      <AppShell>
        <div className="space-y-8 animate-pulse" role="status" aria-label="Loading track details">
          <div className="flex items-end gap-6 -mx-6 -mt-8 h-72 bg-gradient-to-b from-clark-bg-secondary/30 to-clark-bg-primary p-6">
            <div className="w-52 h-52 rounded-xl bg-clark-bg-secondary flex-shrink-0 shadow-2xl" />
            <div className="flex-1 space-y-3 pb-4">
              <div className="h-3 bg-clark-bg-secondary/50 rounded w-20" />
              <div className="h-10 bg-clark-bg-secondary/50 rounded w-3/4" />
              <div className="h-4 bg-clark-bg-secondary/30 rounded w-1/2" />
            </div>
          </div>
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-6 bg-clark-bg-secondary/30 rounded" />
            ))}
          </div>
        </div>
      </AppShell>
    )
  }

  // Error
  if (error || !trackData) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertCircle className="w-12 h-12 text-clark-accent mb-4" />
          <h2 className="font-display text-xl text-clark-text-primary mb-2">
            {error ?? 'Track not found'}
          </h2>
          <Link href="/search" className="text-clark-gold font-body text-sm hover:underline">
            Back to Search
          </Link>
        </div>
      </AppShell>
    )
  }

  const { track, artist, album, audio_features: af, popularity, playcount, lyrics, genres, related_tracks } = trackData

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Hero section */}
        <div className="relative -mx-6 -mt-8 p-6 pb-8 bg-gradient-to-b from-clark-bg-secondary to-clark-bg-primary">
          <div className="flex items-end gap-6">
            {/* Album cover */}
            <div className="relative w-44 h-44 md:w-52 md:h-52 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-clark-steel to-clark-bg-card shadow-2xl ring-1 ring-clark-steel/20">
                {album?.cover_url ? (
                  <Image
                    src={album.cover_url}
                    alt={`${album.title} album cover art`}
                    fill
                    sizes="(max-width: 768px) 11rem, 13rem"
                    className="object-cover"
                    priority
                  />
                ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Disc3 className="w-16 h-16 text-white/20" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 pb-2">
              <p className="font-condensed text-xs tracking-widest text-clark-gold uppercase mb-1">
                {t('tracksTab')}
              </p>
              <h1 className="font-display text-3xl md:text-5xl tracking-widest uppercase text-clark-text-primary truncate">
                {track.title}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                {artist.mbid ? (
                  <Link
                    href={`/artists/${artist.mbid}`}
                    className="font-body font-medium text-sm text-clark-text-muted hover:text-clark-gold transition-colors"
                  >
                    {artist.name}
                  </Link>
                ) : (
                  <span className="font-body text-sm text-clark-text-muted">{artist.name}</span>
                )}
                {album.title && (
                  <>
                    <ChevronRight className="w-3 h-3 text-clark-text-muted/40" />
                    <span className="font-body text-sm text-clark-text-muted/70">{album.title}</span>
                  </>
                )}
              </div>

              {/* Meta info row */}
              <div className="flex flex-wrap items-center gap-3 mt-3">
                {track.duration && (
                  <span className="flex items-center gap-1.5 font-condensed text-sm text-clark-text-muted">
                    <Clock className="w-3.5 h-3.5" />
                    {formatDuration(track.duration)}
                  </span>
                )}
                {album.release_date && (
                  <span className="flex items-center gap-1.5 font-body text-xs text-clark-text-muted">
                    <Calendar className="w-3.5 h-3.5" />
                    {album.release_date}
                  </span>
                )}
                {album.country && (
                  <span className="flex items-center gap-1.5 font-body text-xs text-clark-text-muted">
                    <Globe className="w-3.5 h-3.5" />
                    {album.country}
                  </span>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3 mt-4">
                <button
                  onClick={handlePlay}
                  className="flex items-center gap-2 px-6 py-3 bg-clark-accent hover:bg-clark-accent-hover text-white rounded-full font-body font-semibold text-sm transition-colors shadow-lg shadow-clark-accent/20"
                >
                  <Play className="w-4 h-4 ml-0.5" />
                  {t('playBtn')}
                </button>
                <button
                  className="p-3 rounded-full border border-clark-steel/30 text-clark-text-muted hover:text-clark-gold hover:border-clark-gold/50 transition-colors"
                  aria-label="Like"
                >
                  <Heart className="w-4 h-4" />
                </button>
              </div>

              {/* Popularity / Playcount */}
              <div className="flex items-center gap-4 mt-4">
                {popularity > 0 && (
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-clark-text-muted" />
                    <span className="font-body text-xs text-clark-text-muted">
                      <span className="text-clark-text-primary font-medium">{popularity}</span> {t('popularityLabel').toLowerCase()}
                    </span>
                  </div>
                )}
                {playcount > 0 && (
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-clark-text-muted" />
                    <span className="font-body text-xs text-clark-text-muted">
                      <span className="text-clark-text-primary font-medium">{playcount.toLocaleString()}</span> {t('playcountLabel').toLowerCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Genre tags */}
              {genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {genres.map((g) => (
                    <span
                      key={g}
                      className="px-3 py-1 rounded-full bg-clark-bg-card/60 text-xs font-body text-clark-text-muted border border-clark-steel/20"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Audio Features */}
        {af && (af.bpm || af.energy || af.danceability || af.valence) && (
          <section>
            <h2 className="font-condensed text-xs tracking-widest text-clark-gold uppercase mb-4">
              {t('audioFeaturesLabel')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 p-5 rounded-xl bg-clark-bg-secondary/40 border border-clark-steel/10">
              {/* BPM */}
              {af.bpm && (
                <div className="flex items-center gap-3">
                  <span className="w-24 font-body text-xs text-clark-text-muted flex-shrink-0">{t('bpmLabel')}</span>
                  <div className="flex-1 h-2 bg-clark-bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-clark-sky to-clark-steel"
                      style={{ width: `${Math.min(100, ((af.bpm - 40) / 160) * 100)}%` }}
                    />
                  </div>
                  <span className="w-12 text-right font-condensed text-xs text-clark-text-muted">
                    {Math.round(af.bpm)}
                  </span>
                </div>
              )}

              {/* Key */}
              {af.key !== null && af.key !== undefined && (
                <div className="flex items-center gap-3">
                  <span className="w-24 font-body text-xs text-clark-text-muted">Key</span>
                  <span className="font-condensed text-sm text-clark-text-primary">
                    {KEY_NAMES[af.key] ?? '?'}
                  </span>
                </div>
              )}

              <AudioFeatureBar label={t('energyLabel')} value={af.energy} color="from-clark-accent to-clark-gold" />
              <AudioFeatureBar label={t('danceabilityLabel')} value={af.danceability} color="from-clark-gold to-clark-accent" />
              <AudioFeatureBar label="Valence" value={af.valence} color="from-clark-sky to-clark-gold" />
              <AudioFeatureBar label="Acousticness" value={af.acousticness} color="from-clark-steel to-clark-sky" />
              <AudioFeatureBar label="Instrumentalness" value={af.instrumentalness} color="from-clark-steel to-clark-sky" />
              <AudioFeatureBar label="Liveness" value={af.liveness} color="from-clark-accent to-clark-steel" />
              <AudioFeatureBar label="Speechiness" value={af.speechiness} color="from-clark-steel to-clark-accent" />
            </div>
          </section>
        )}

        {/* Lyrics */}
        {lyrics && (
          <section>
            <h2 className="font-condensed text-xs tracking-widest text-clark-gold uppercase mb-4">
              {t('lyricsLabel')}
            </h2>
            <div
              className={cn(
                'relative p-6 rounded-xl bg-clark-bg-secondary/40 border border-clark-steel/10',
                !showFullLyrics && 'max-h-80 overflow-hidden',
              )}
            >
              <pre className="font-body text-sm text-clark-text-muted whitespace-pre-wrap leading-relaxed font-sans">
                {lyrics}
              </pre>
              {!showFullLyrics && lyrics.length > 500 && (
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-clark-bg-secondary/60 to-transparent flex items-end justify-center pb-2">
                  <button
                    onClick={() => setShowFullLyrics(true)}
                    className="px-4 py-1.5 rounded-full bg-clark-bg-card text-clark-gold font-body text-xs hover:bg-clark-bg-secondary transition-colors border border-clark-steel/20"
                  >
                    Show full lyrics
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Related Tracks */}
        {related_tracks.length > 0 && (
          <section>
            <h2 className="font-condensed text-xs tracking-widest text-clark-gold uppercase mb-4">
              {t('similarTracksLabel')}
            </h2>
            <div className="space-y-0.5">
              {related_tracks.slice(0, 8).map((rt, idx) => {
                const name = (rt as Record<string, unknown>).name as string ?? 'Unknown'
                const rtArtist = (rt as Record<string, unknown>).artist as { name: string } | undefined
                const playcount = (rt as Record<string, unknown>).playcount as string | undefined
                return (
                  <TrackLine
                    key={idx}
                    data={{
                      id: `related-${idx}`,
                      title: name,
                      artistName: rtArtist?.name ?? 'Unknown',
                    }}
                    variant="row"
                    onPlay={() => {
                      // Related tracks from MusicBrainz have no playable preview
                    }}
                    showDuration={false}
                    showPreviewIndicator={false}
                  >
                    <span className="w-6 text-right font-condensed text-xs text-clark-text-muted/50 flex-shrink-0 pointer-events-none">
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0 pointer-events-none">
                      <p className="font-body text-sm text-clark-text-primary truncate group-hover:text-clark-gold transition-colors">
                        {name}
                      </p>
                      <p className="font-body text-xs text-clark-text-muted/70 truncate">
                        {rtArtist?.name ?? 'Unknown'}
                      </p>
                    </div>
                    {playcount && (
                      <span className="font-condensed text-xs text-clark-text-muted flex-shrink-0 pointer-events-none">
                        {Number(playcount).toLocaleString()} plays
                      </span>
                    )}
                  </TrackLine>
                )
              })}
            </div>
          </section>
        )}

        {/* Similar Artists */}
        {artist.similar.length > 0 && (
          <section>
            <h2 className="font-condensed text-xs tracking-widest text-clark-gold uppercase mb-4">
              {t('similarArtists')}
            </h2>
            <div className="flex gap-5 overflow-x-auto pb-2">
              {artist.similar.slice(0, 8).map((sa, idx) => (
                <Link
                  key={sa.mbid ?? idx}
                  href={sa.mbid ? `/artists/${sa.mbid}` : '#'}
                  className="flex flex-col items-center text-center flex-shrink-0 group"
                >
                  <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-clark-steel to-clark-bg-card group-hover:scale-105 transition-transform overflow-hidden">
                    {sa.image?.[2]?.['#text'] || sa.image?.[0]?.['#text'] ? (
                      <Image
                        src={sa.image?.[2]?.['#text'] ?? sa.image?.[0]?.['#text'] ?? ''}
                        alt={`${sa.name} artist photo`}
                        fill
                        sizes="4rem"
                        className="object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="font-display text-lg text-white/30">{sa.name?.charAt(0)}</span>
                      </div>
                    )}
                  </div>
                  <p className="font-body font-medium text-xs mt-2 text-clark-text-primary w-16 truncate">
                    {sa.name}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </AppShell>
  )
}
