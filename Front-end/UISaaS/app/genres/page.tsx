'use client'

import Link from 'next/link'
import { useState, useEffect, useRef, useCallback } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { useTranslation } from '@/hooks/useTranslation'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import { Loader2, LogIn, Music, RefreshCw } from 'lucide-react'
import Image from 'next/image'

// Genre name → image filename in public/genres/
const genreImages: Record<string, string> = {
  Rock: '/genres/Rock_Guitar.png',
  Jazz: '/genres/Jazz.png',
  Classical: '/genres/Classical.png',
  'R&B': '/genres/RnB.png',
  'Hip-Hop': '/genres/HipHop.png',
  Ambient: '/genres/Ambient.png',
  Electronic: '/genres/Electronic.png',
  Reggae: '/genres/Reggae.png',
  Samba: '/genres/Samba.png',
  Latin: '/genres/Latin.png',
  Gospel: '/genres/Gospel.png',
  Pagode: '/genres/Pagode.png',
  'Heavy Metal': '/genres/HeavyMetal.png',
  Rap: '/genres/Rap.png',
  'Forró': '/genres/Forro.png',
  Funk: '/genres/Funk.png',
  Sertanejo: '/genres/Sertanejo.png',
  Romantic: '/genres/Romantic.png',
  Trap: '/genres/Trap.png',
}

const mosaicLayout = [
  'col-span-2 row-span-2',
  'col-span-1 row-span-2',
  'col-span-1 row-span-1',
  'col-span-1 row-span-1',
  'col-span-2 row-span-1',
  'col-span-1 row-span-1',
  'col-span-2 row-span-1',
  'col-span-1 row-span-1',
  'col-span-1 row-span-1',
  'col-span-1 row-span-2',
  'col-span-1 row-span-1',
  'col-span-1 row-span-1',
  'col-span-1 row-span-1',
  'col-span-1 row-span-1',
  'col-span-1 row-span-1',
  'col-span-1 row-span-1',
  'col-span-1 row-span-1',
  'col-span-1 row-span-1',
  'col-span-1 row-span-1',
]

const genreGradients: Record<string, { from: string; to: string }> = {
  Rock:     { from: 'from-clark-bg-secondary', to: 'to-clark-shadow' },
  Jazz:     { from: 'from-clark-steel', to: 'to-clark-sky' },
  Classical: { from: 'from-clark-bg-card', to: 'to-clark-steel' },
  'R&B':    { from: 'from-clark-danger', to: 'to-clark-bg-secondary' },
  'Hip-Hop': { from: 'from-amber-600', to: 'to-yellow-400' },
  Ambient:  { from: 'from-clark-bg-secondary', to: 'to-clark-sky' },
  Electronic: { from: 'from-violet-700', to: 'to-indigo-400' },
  Reggae:   { from: 'from-clark-steel', to: 'to-clark-gold' },
  Samba:    { from: 'from-green-600', to: 'to-yellow-400' },
  Latin:    { from: 'from-orange-600', to: 'to-red-400' },
  Gospel:   { from: 'from-yellow-700', to: 'to-amber-400' },
  Pagode:   { from: 'from-orange-700', to: 'to-yellow-500' },
  'Heavy Metal': { from: 'from-zinc-800', to: 'to-red-600' },
  Rap:      { from: 'from-gray-900', to: 'to-amber-600' },
  Forró:    { from: 'from-blue-700', to: 'to-yellow-500' },
  Funk:     { from: 'from-pink-700', to: 'to-rose-400' },
  Sertanejo: { from: 'from-emerald-700', to: 'to-green-400' },
  Romantic: { from: 'from-rose-700', to: 'to-pink-400' },
  Trap:     { from: 'from-slate-900', to: 'to-violet-600' },
}

interface GenreEntry {
  name: string
  slug: string
  trackCount: number
}

export default function GenresPage() {
  const { t } = useTranslation()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const accessToken = useAuthStore((s) => s.accessToken)
  const setShowAuthModal = useAuthStore((s) => s.setShowAuthModal)

  const [genres, setGenres] = useState<GenreEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef(false)

  const loadGenres = useCallback(() => {
    if (!accessToken) return
    abortRef.current = false
    setLoading(true)
    setError(null)

    async function fetchGenres() {
      try {
        const res = await api.listTracks(accessToken!, new URLSearchParams('limit=200'))
        if (abortRef.current) return
        const uniqueGenres = [...new Set(res.items.map((t) => t.genre).filter(Boolean) as string[])]
        const entries: GenreEntry[] = uniqueGenres.map((name) => ({
          name,
          slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
          trackCount: res.items.filter((t) => t.genre === name).length,
        }))
        entries.sort((a, b) => b.trackCount - a.trackCount)
        setGenres(entries)
      } catch (err) {
        if (abortRef.current) return
        const msg = err instanceof Error ? err.message : String(err)
        console.error('[ClarkPlayer] Failed to load genres:', msg)
        setError(msg)
      } finally {
        if (!abortRef.current) setLoading(false)
      }
    }

    fetchGenres()
  }, [accessToken])

  useEffect(() => {
    if (!isAuthenticated) {
      setGenres([])
      setLoading(false)
      setError(null)
      return
    }
    abortRef.current = false
    loadGenres()
    return () => { abortRef.current = true }
  }, [isAuthenticated, loadGenres])

  return (
    <AppShell>
      <div className="space-y-6">
        <h1 className="font-display text-3xl tracking-widest uppercase">{t('browseByGenre')}</h1>

        {!isAuthenticated ? (
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
        ) : loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[120px]">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl bg-clark-bg-secondary border border-clark-steel/20 animate-pulse flex items-end p-5"
              >
                <div className="space-y-2 w-full">
                  <div className="h-5 bg-clark-bg-card rounded w-2/3" />
                  <div className="h-3 bg-clark-bg-card rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 px-6 rounded-2xl bg-clark-bg-secondary border border-clark-steel/20 text-center">
            <div className="w-12 h-12 rounded-full bg-clark-danger/10 flex items-center justify-center mb-4">
              <RefreshCw className="w-6 h-6 text-clark-danger" />
            </div>
            <p className="font-body text-sm text-clark-text-muted mb-1">Failed to load genres</p>
            <p className="font-body text-xs text-clark-text-muted/50 mb-4 max-w-md break-all">{error}</p>
            <button
              onClick={loadGenres}
              className="flex items-center gap-2 px-4 py-2 bg-clark-bg-card hover:bg-clark-steel/20 font-body text-sm text-clark-text-primary rounded-lg transition-colors border border-clark-steel/30"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        ) : genres.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-6 rounded-2xl bg-clark-bg-secondary border border-clark-steel/20 text-center">
            <div className="w-12 h-12 rounded-full bg-clark-bg-card flex items-center justify-center mb-4">
              <Music className="w-6 h-6 text-clark-text-muted" />
            </div>
            <p className="font-display text-lg tracking-wider text-clark-text-primary mb-1">No genres yet</p>
            <p className="font-body text-sm text-clark-text-muted">Upload some tracks to see your genres here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[120px]">
            {genres.map((genre, i) => {
              const gradients = genreGradients[genre.name] ?? { from: 'from-clark-steel', to: 'to-clark-bg-secondary' }
              const imageSrc = genreImages[genre.name]
              const layoutIdx = i % mosaicLayout.length
              return (
                <Link
                  key={genre.slug}
                  href={`/genres/${genre.slug}`}
                  className={cn(
                    'relative rounded-xl overflow-hidden group transition-transform hover:scale-[1.02]',
                    mosaicLayout[layoutIdx],
                  )}
                >
                  {/* Genre cover image (falls back to gradient if no image) */}
                  {imageSrc ? (
                    <Image
                      src={imageSrc}
                      alt={genre.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  ) : (
                    <div className={cn('absolute inset-0', gradients.from, gradients.to)} />
                  )}
                  {/* Gradient overlay for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                  <div className="relative z-10 p-5 flex flex-col justify-end h-full">
                    <h2 className="font-display text-2xl tracking-widest uppercase text-white drop-shadow-lg">{genre.name}</h2>
                    <p className="font-condensed text-xs uppercase tracking-wider text-white/70 mt-1">{genre.trackCount.toLocaleString()} {t('tracks')}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </AppShell>
  )
}
