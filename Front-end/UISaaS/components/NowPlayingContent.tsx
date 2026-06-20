'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Music, Play, ListMusic } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { useDiscovery } from '@/hooks/useCatalog'
import { playWithAlbumQueue } from '@/lib/albumQueue'
import type { CatalogTrackItem, CatalogArtistItem } from '@/types'

function MusicCard({ item, index }: { item: CatalogTrackItem; index: number }) {
  const hasPreview = !!item.preview_url

  function handleClick() {
    if (hasPreview) {
      playWithAlbumQueue(item, index)
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick() } }}
      className="p-3 rounded-xl bg-clark-bg-secondary group cursor-pointer hover:scale-[1.02] transition-all border border-transparent hover:border-clark-steel/20"
    >
      <div className="relative aspect-square rounded-lg overflow-hidden bg-clark-bg-card mb-2">
        {item.album_cover ? (
          <img src={item.album_cover} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"><Music className="w-8 h-8 text-white/20" /></div>
        )}
        {hasPreview && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-10 h-10 rounded-full bg-clark-accent flex items-center justify-center">
              <Play className="w-5 h-5 text-white ml-0.5" />
            </div>
          </div>
        )}
      </div>
      <p className="text-sm font-semibold truncate">{item.title}</p>
      <p className="text-xs text-clark-text-muted truncate">{item.artist_name}</p>
    </div>
  )
}

export function NowPlayingContent() {
  const { t } = useTranslation()
  const { data, isLoading, error } = useDiscovery()

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <Music className="w-12 h-12 text-clark-text-muted/30 mb-4" />
        <p className="font-body text-clark-text-muted">{t('couldNotLoadDiscovery')}</p>
        <p className="font-body text-xs text-clark-text-muted/50 mt-1">{t('tryRefreshing')}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-96px)] px-6">
      {/* Hero */}
      <div className="text-center max-w-lg mb-10">
        <div className="relative mx-auto mb-8 w-32 h-32">
          <Image src="/logo.png" alt="ClarkPlayer" fill priority sizes="8rem" className="object-contain" />
        </div>
        <h1 className="font-display text-5xl md:text-7xl tracking-widest uppercase mb-3">
          Clark<span className="text-clark-accent">Player</span>
        </h1>
        <p className="font-body text-xl text-clark-text-muted mb-6">{t('fortressOfSound')}</p>
        <div className="flex gap-3 justify-center">
          <Link href="/audios" className="px-5 py-2.5 bg-clark-accent text-white rounded-lg font-semibold text-sm flex items-center gap-2"><Music className="w-4 h-4" />{t('browseTracks')}</Link>
          <Link href="/playlists" className="px-5 py-2.5 bg-clark-bg-card text-clark-text-primary rounded-lg font-semibold text-sm border border-clark-steel/40 flex items-center gap-2"><ListMusic className="w-4 h-4 text-clark-gold" />{t('playlists')}</Link>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 w-full max-w-6xl">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse p-3"><div className="aspect-square rounded-xl bg-clark-bg-secondary" /><div className="h-4 bg-clark-bg-secondary rounded mt-3 w-3/4" /><div className="h-3 bg-clark-bg-secondary rounded mt-1 w-1/2" /></div>
          ))}
        </div>
      )}

      {/* Trending */}
      {data?.trending_tracks && (data.trending_tracks as CatalogTrackItem[]).length > 0 && (
        <section className="w-full max-w-6xl mt-10">
          <h2 className="font-condensed text-xs tracking-widest text-clark-gold uppercase mb-4">{t('trendingNow')}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {(data.trending_tracks as CatalogTrackItem[]).slice(0, 12).map((item, i) => (
              <MusicCard key={item.id ?? i} item={item} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Artists */}
      {data?.top_artists && (data.top_artists as CatalogArtistItem[]).length > 0 && (
        <section className="w-full max-w-6xl mt-10">
          <h2 className="font-condensed text-xs tracking-widest text-clark-gold uppercase mb-4">{t('topArtists')}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {(data.top_artists as CatalogArtistItem[]).slice(0, 12).map((artist) => (
              <Link key={artist.id} href={`/artists/${artist.id}?name=${encodeURIComponent(artist.name)}`} className="p-3 rounded-xl bg-clark-bg-secondary text-center hover:scale-[1.02] transition-all">
                <div className="aspect-square rounded-full overflow-hidden bg-clark-bg-card mx-auto max-w-[100px] mb-2">
                  {artist.image_url ? <img src={artist.image_url} alt={artist.name} className="w-full h-full object-cover" loading="lazy" /> : <div className="w-full h-full flex items-center justify-center"><Music className="w-6 h-6 text-white/20" /></div>}
                </div>
                <p className="text-sm font-semibold truncate">{artist.name}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Brazilian */}
      {data?.brazilian_artists && (data.brazilian_artists as CatalogArtistItem[]).length > 0 && (
        <section className="w-full max-w-6xl mt-10">
          <h2 className="font-condensed text-xs tracking-widest text-emerald-400 uppercase mb-4">{t('brazilian')}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {(data.brazilian_artists as CatalogArtistItem[]).slice(0, 6).map((artist) => (
              <Link key={artist.id} href={`/artists/${artist.id}?name=${encodeURIComponent(artist.name)}`} className="p-3 rounded-xl bg-clark-bg-secondary text-center hover:scale-[1.02] transition-all">
                <div className="aspect-square rounded-full overflow-hidden bg-clark-bg-card mx-auto max-w-[100px] mb-2">
                  {artist.image_url ? <img src={artist.image_url} alt={artist.name} className="w-full h-full object-cover" loading="lazy" /> : <div className="w-full h-full flex items-center justify-center"><Music className="w-6 h-6 text-white/20" /></div>}
                </div>
                <p className="text-sm font-semibold truncate">{artist.name}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
