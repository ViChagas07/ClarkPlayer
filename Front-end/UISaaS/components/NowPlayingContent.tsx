'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Music, ListMusic } from 'lucide-react'
import { usePlayerStore } from '@/store/playerStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useTranslation } from '@/hooks/useTranslation'
import type { Track } from '@/types'

export function NowPlayingContent() {
  const { t } = useTranslation()
  const currentTrack = usePlayerStore((s) => s.currentTrack)
  const isPlaying = usePlayerStore((s) => s.isPlaying)
  const [recentTracks, setRecentTracks] = useState<Track[]>([])
  const setSleepTimer = useSettingsStore((s) => s.setSleepTimer)

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
            if (data.expires_at > now) {
              setSleepTimer(data.expires_at)
            } else {
              await fetch('/api/v1/player/sleep-timer', { method: 'DELETE' })
              setSleepTimer(null)
            }
          }
        }
      } catch {
        // Silently ignore
      }
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
            setRecentTracks(
              data.tracks.map((t) => ({
                id: t.id,
                title: t.title,
                artist: t.artist ?? 'Unknown Artist',
                album: t.album ?? 'Unknown Album',
                duration: t.duration ?? 0,
                format: 'MP3' as const,
              })) as Track[]
            )
          }
        }
      } catch {
        // Silently ignore
      }
    }
    fetchRecent()
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-96px)] px-6">
      <div className="text-center max-w-lg">

        {/* Hero art block — ClarkPlayer logo with Superman gold glow */}
        <div className="relative mx-auto mb-10 w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64">
          {/* Gold glow ring behind logo */}
          <div className="absolute inset-0 rounded-full bg-clark-gold/20 blur-3xl animate-gold-pulse" />

          {/* Main logo container */}
          <div className="relative w-full h-full rounded-2xl flex items-center justify-center overflow-hidden">
            {/* ClarkPlayer logo — fully visible */}
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-clark-gold/10 blur-2xl animate-pulse-slow" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="ClarkPlayer" className="relative w-48 h-48 object-contain drop-shadow-[0_0_30px_rgba(245,197,24,0.3)]" />
            </div>
          </div>

          {/* Gold ring decoration around logo */}
          <div className="absolute -inset-1 rounded-3xl border border-clark-gold/20 -z-10" />
        </div>

        {/* "NOW PLAYING" label */}
        <p className="font-condensed text-xs tracking-widest text-clark-gold uppercase mb-4">{t('nowPlaying')}</p>

        {/* Heading — "Clark" white, "Player" in Superman red */}
        <h1 className="font-display text-5xl md:text-7xl tracking-widest uppercase mb-3">
          <span className="text-clark-text-primary">
            {t('welcomeToClarkPlayer').replace('ClarkPlayer', '')}
            Clark<span className="text-clark-accent">Player</span>
          </span>
        </h1>

        {/* Tagline */}
        <p className="font-body font-medium text-xl text-clark-text-muted mb-8">
          {t('fortressOfSound')}
        </p>

        {/* CTA buttons — stack on mobile */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <Link
            href="/audios"
            className="px-6 py-3 bg-clark-accent hover:bg-clark-accent-hover text-white font-body font-semibold rounded-lg transition-all hover:-translate-y-0.5 shadow-glow-hero flex items-center gap-2"
          >
            <Music className="w-4 h-4 flex-shrink-0" />
            {t('browseTracks')}
          </Link>
          <Link
            href="/playlists"
            className="px-6 py-3 bg-clark-bg-card hover:bg-clark-bg-secondary text-clark-text-primary font-body font-semibold rounded-lg transition-all hover:-translate-y-0.5 border border-clark-steel/40 hover:border-clark-gold/40 flex items-center gap-2"
          >
            <ListMusic className="w-4 h-4 flex-shrink-0 text-clark-gold" />
            {t('playlists')}
          </Link>
        </div>
      </div>

      {/* Recently Played */}
      {recentTracks.length > 0 && (
        <div className="w-full max-w-5xl mt-14">
          {/* Section header with gold accent */}
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-clark-steel/40 to-transparent" />
            <h2 className="font-condensed text-xs tracking-widest text-clark-text-muted uppercase">
              {t('recentlyPlayed')}
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-clark-steel/40 to-transparent" />
          </div>

          <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide">
            {recentTracks.map((track) => (
              <div
                key={track.id}
                className="flex-shrink-0 w-48 group hover:-translate-y-1 transition-all duration-200"
              >
                {/* Track card */}
                <div className="relative w-full h-36 rounded-xl bg-gradient-to-br from-clark-bg-secondary to-clark-bg-primary border border-clark-steel/20 overflow-hidden">
                  {/* Gold shimmer on hover */}
                  <div className="absolute inset-0 bg-clark-gold/0 group-hover:bg-clark-gold/5 transition-colors duration-300" />

                  {/* ClarkPlayer logo — subtle watermark at good visibility */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-[0.08]">
                    <img src="/logo.png" alt="" className="w-12 h-12 object-contain" />
                  </div>

                  {/* Gold bottom border on hover */}
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-clark-gold to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                </div>

                {/* Track info */}
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
