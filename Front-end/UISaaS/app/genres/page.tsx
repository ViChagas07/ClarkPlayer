'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { useTranslation } from '@/hooks/useTranslation'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import { Loader2, LogIn, Music, RefreshCw } from 'lucide-react'

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
  const [error, setError] = useState(false)

  function loadGenres() {
    if (!accessToken) return
    let cancelled = false
    setLoading(true)
    setError(false)

    async function fetchGenres() {
      try {
        const res = await api.listTracks(accessToken!, new URLSearchParams('limit=200'))
        if (cancelled) return
        const uniqueGenres = [...new Set(res.items.map((t) => t.genre).filter(Boolean) as string[])]
        const entries: GenreEntry[] = uniqueGenres.map((name) => ({
          name,
          slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
          trackCount: res.items.filter((t) => t.genre === name).length,
        }))
        entries.sort((a, b) => b.trackCount - a.trackCount)
        setGenres(entries)
      } catch {
        if (!cancelled) setError(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchGenres()
    return () => { cancelled = true }
  }

  useEffect(() => {
    if (!isAuthenticated) {
      setGenres([])
      setLoading(false)
      setError(false)
      return
    }
    const cleanup = loadGenres()
    return cleanup
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, accessToken])

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
            <p className="font-body text-sm text-clark-text-muted mb-4">Failed to load genres</p>
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
                  <div className={cn('absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent', gradients.from, gradients.to, 'opacity-80')} />

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
