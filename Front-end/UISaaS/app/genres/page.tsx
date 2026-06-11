'use client'

import Link from 'next/link'
import { AppShell } from '@/components/layout/AppShell'
import { useTranslation } from '@/hooks/useTranslation'
import { mockGenres } from '@/lib/mockData'
import { cn } from '@/lib/utils'

// Mosaic grid layout: some cards span 2 columns
const mosaicLayout = [
  'col-span-2 row-span-2', // Rock (large feature)
  'col-span-1 row-span-2', // Jazz (tall)
  'col-span-1 row-span-1', // Classical
  'col-span-1 row-span-1', // R&B
  'col-span-2 row-span-1', // Hip-Hop (wide)
  'col-span-1 row-span-1', // Ambient
  'col-span-2 row-span-1', // Electronic (wide)
  'col-span-1 row-span-1', // Reggae
  'col-span-1 row-span-1', // Samba
  'col-span-1 row-span-2', // Latin (tall)
  'col-span-1 row-span-1', // Gospel
  'col-span-1 row-span-1', // Pagode
  'col-span-1 row-span-1', // Heavy Metal
  'col-span-1 row-span-1', // Rap
  'col-span-1 row-span-1', // Forró
  'col-span-1 row-span-1', // Funk
  'col-span-1 row-span-1', // Sertanejo
  'col-span-1 row-span-1', // Romantic
  'col-span-1 row-span-1', // Trap
]

// Superman palette gradients per genre
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

export default function GenresPage() {
  const { t } = useTranslation()

  return (
    <AppShell>
      <div className="space-y-6">
        <h1 className="font-display text-3xl tracking-widest uppercase">{t('browseByGenre')}</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[120px]">
          {mockGenres.map((genre, i) => {
            const gradients = genreGradients[genre.name] ?? { from: 'from-clark-steel', to: 'to-clark-bg-secondary' }
            return (
              <Link
                key={genre.slug}
                href={`/genres/${genre.slug}`}
                className={cn(
                  'relative rounded-xl overflow-hidden group transition-transform hover:scale-[1.02]',
                  mosaicLayout[i],
                  // On mobile all cards are single-column; col-span-2 only works for sm+
                  i < 3 ? 'sm:col-span-2 sm:row-span-2' : '',
                )}
              >
                {/* Genre cover image as background */}
                {genre.coverUrl && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={genre.coverUrl}
                    alt={genre.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                )}
                {/* Gradient overlay for readability */}
                <div className={cn('absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent', gradients.from, gradients.to, 'opacity-80')} />

                <div className="relative z-10 p-5 flex flex-col justify-end h-full">
                  <h2 className="font-display text-2xl tracking-widest uppercase text-white drop-shadow-lg">{genre.name}</h2>
                  <p className="font-condensed text-xs uppercase tracking-wider text-white/70 mt-1">{genre.trackCount.toLocaleString()} {t('tracks')}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </AppShell>
  )
}
