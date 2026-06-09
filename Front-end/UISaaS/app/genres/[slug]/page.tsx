'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { AppShell } from '@/components/layout/AppShell'
import { useTranslation } from '@/hooks/useTranslation'
import { usePlayerStore } from '@/store/playerStore'
import { api } from '@/lib/api'
import type { UnifiedSearchResult, Track } from '@/types'
import { Play, Music, Loader2, TrendingUp, ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Map genre slug → display name & API search queries that return good results */
const GENRE_QUERIES: Record<string, { name: string; queries: string[] }> = {
  rock:           { name: 'Rock',            queries: ['Queen Bohemian Rhapsody', 'Nirvana Smells Like Teen Spirit', 'Led Zeppelin Stairway', 'ACDC Back in Black', 'Pink Floyd Comfortably Numb', 'Foo Fighters Everlong'] },
  jazz:           { name: 'Jazz',            queries: ['Miles Davis So What', 'John Coltrane Giant Steps', 'Louis Armstrong Wonderful World', 'Dave Brubeck Take Five', 'Billie Holiday Strange Fruit', 'Duke Ellington Mood Indigo'] },
  classical:      { name: 'Classical',       queries: ['Beethoven Symphony 5', 'Mozart Requiem', 'Bach Cello Suite', 'Vivaldi Four Seasons', 'Chopin Nocturne', 'Tchaikovsky Swan Lake'] },
  rnb:            { name: 'R&B',             queries: ['Blinding Lights The Weeknd', 'SZA Kill Bill', 'Frank Ocean Thinkin Bout You', 'Usher Yeah', 'Alicia Keys Fallin', 'Beyonce Halo'] },
  'hip-hop':      { name: 'Hip-Hop',         queries: ['Kendrick Lamar Humble', 'Drake Gods Plan', 'Travis Scott Sicko Mode', 'J Cole No Role Modelz', 'Eminem Lose Yourself', 'Kanye West Stronger'] },
  ambient:        { name: 'Ambient',         queries: ['Brian Eno Music for Airports', 'Aphex Twin Selected Ambient', 'Stars of the Lid', 'Hammock ambient', 'Tycho Dive'] },
  electronic:     { name: 'Electronic',      queries: ['Daft Punk Get Lucky', 'Calvin Harris Summer', 'Avicii Wake Me Up', 'Skrillex Scary Monsters', 'Deadmau5 Strobe', 'Disclosure Latch'] },
  reggae:         { name: 'Reggae',          queries: ['Bob Marley One Love', 'Peter Tosh Legalize It', 'Jimmy Cliff Harder They Come', 'Toots and the Maytals Pressure Drop', 'Damian Marley Welcome to Jamrock'] },
  samba:          { name: 'Samba',           queries: ['Jorge Ben Mas que Nada', 'Cartola Preciso Me Encontrar', 'Beth Carvalho Vou Festejar', 'Paulinho da Viola Coração Leviano', 'Martinho da Vila Canta Canta'] },
  latin:          { name: 'Latin',           queries: ['Despacito Luis Fonsi', 'Shakira Hips Don\'t Lie', 'Bad Bunny Tití Me Preguntó', 'J Balvin Mi Gente', 'Daddy Yankee Gasolina', 'Karol G Provenza'] },
  gospel:         { name: 'Gospel',          queries: ['Amazing Grace', 'Kirk Franklin Stomp', 'CeCe Winans Alabaster Box', 'Tasha Cobbs Break Every Chain', 'Donnie McClurkey Stand', 'Marvin Sapp Never Would Have Made It'] },
  pagode:         { name: 'Pagode',          queries: ['Grupo Revelação Deixa Acontecer', 'Exaltasamba Me Apaixonei', 'Sorriso Maroto Sinais', 'Fundo de Quintal O Show Tem Que Continuar', 'Raça Negra Cheia de Manias'] },
  'heavy-metal':  { name: 'Heavy Metal',     queries: ['Metallica Enter Sandman', 'Iron Maiden The Trooper', 'Black Sabbath Paranoid', 'Slayer Raining Blood', 'Megadeth Symphony of Destruction', 'Judas Priest Breaking the Law'] },
  rap:            { name: 'Rap',             queries: ['Eminem Rap God', 'Jay-Z Empire State of Mind', 'Nas NY State of Mind', '2Pac California Love', 'Notorious BIG Juicy', 'Lil Wayne A Milli'] },
  forro:          { name: 'Forró',           queries: ['Luiz Gonzaga Asa Branca', 'Dominguinhos Eu Só Quero Um Xodó', 'Elba Ramalho De Volta Pro Aconchego', 'Alceu Valença Anunciação', 'Falamansa Xote dos Milagres'] },
  funk:           { name: 'Funk',            queries: ['Anitta Envolver', 'MC Kevinho Olha a Explosão', 'Ludmilla Cheguei', 'MC Don Juan', 'Kevin O Chris Tipo Gin'] },
  sertanejo:      { name: 'Sertanejo',       queries: ['Jorge e Mateus Sosseguei', 'Marília Mendonça Infiel', 'Henrique e Juliano Não Tô Valendo Nada', 'Zé Neto e Cristiano Largado as Traças', 'Gusttavo Lima Apelido Carinhoso'] },
  romantic:       { name: 'Romantic',         queries: ['Ed Sheeran Perfect', 'Adele Someone Like You', 'John Legend All of Me', 'Sam Smith Stay With Me', 'Whitney Houston I Will Always Love You', 'Celine Dion My Heart Will Go On'] },
  trap:           { name: 'Trap',            queries: ['Travis Scott Goosebumps', 'Future Mask Off', 'Migos Bad and Boujee', 'Lil Baby Drip Too Hard', '21 Savage Bank Account', 'Post Malone Rockstar'] },
}

export default function GenreDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { t } = useTranslation()
  const resolvedParams = React.use(params)
  const { setQueue } = usePlayerStore()
  const [tracks, setTracks] = useState<UnifiedSearchResult[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const slug = resolvedParams.slug
  const genre = GENRE_QUERIES[slug]
  const displayName = genre?.name ?? slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  const queries = genre?.queries ?? [displayName]

  useEffect(() => {
    let cancelled = false
    async function load() {
      setIsLoading(true)
      const results: UnifiedSearchResult[] = []
      for (const q of queries) {
        if (cancelled) return
        try {
          const data = await api.musicSearch(q, 1)
          const track = data.tracks[0]
          if (track && track.track && track.track.title) results.push(track)
        } catch { /* skip */ }
      }
      if (!cancelled) setTracks(results)
      if (!cancelled) setIsLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [slug])

  function handlePlay(result: UnifiedSearchResult, idx: number) {
    const all: Track[] = tracks
      .filter((r) => r.track)
      .map((r, i) => ({
        id: r.track?.mbid ?? `genre-${slug}-${i}`,
        title: r.track?.title ?? '',
        artist: r.artist?.name ?? '',
        album: r.album?.title ?? '',
        duration: r.track?.duration ? Math.round(r.track.duration / 1000) : 200,
        format: 'MP3' as const,
        coverUrl: r.cover_url ?? r.album?.cover_url ?? undefined,
      }))
    setQueue(all, idx)
  }

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/genres" className="p-2 rounded-lg hover:bg-clark-bg-secondary text-clark-text-muted hover:text-clark-gold transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-display text-3xl tracking-widest uppercase text-clark-text-primary">{displayName}</h1>
            <p className="font-body text-sm text-clark-text-muted mt-1">
              {isLoading ? 'Loading...' : `${tracks.length} tracks`}
            </p>
          </div>
        </div>

        {/* Track grid — Spotify-style cards */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-3 rounded-xl bg-clark-bg-secondary animate-pulse">
                <div className="aspect-square rounded-lg bg-clark-bg-card" />
                <div className="h-4 bg-clark-bg-card rounded mt-3 w-3/4" />
                <div className="h-3 bg-clark-bg-card rounded mt-1 w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {tracks.map((result, idx) => {
              const track = result.track
              const artist = result.artist
              const coverUrl = result.cover_url ?? result.album?.cover_url ?? null
              if (!track) return null

              return (
                <div
                  key={track.mbid ?? `${slug}-${idx}`}
                  onClick={() => handlePlay(result, idx)}
                  className="group p-3 rounded-xl bg-clark-bg-secondary hover:bg-clark-bg-card transition-all duration-200 cursor-pointer hover:scale-[1.02] border border-transparent hover:border-clark-steel/20"
                >
                  {/* Album art with play overlay */}
                  <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-clark-steel to-clark-bg-card shadow-md">
                    {coverUrl ? (
                      <img
                        src={coverUrl}
                        alt={track.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music className="w-8 h-8 text-white/20" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-clark-accent flex items-center justify-center shadow-lg">
                        <Play className="w-4 h-4 text-white ml-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* Track info */}
                  <p className="font-body font-semibold text-sm text-clark-text-primary mt-3 truncate">
                    {track.title}
                  </p>
                  <p className="font-body text-xs text-clark-text-muted truncate">
                    {artist?.name ?? 'Unknown'}
                  </p>

                  {/* Popularity bar */}
                  {result.popularity > 0 && (
                    <div className="mt-2 h-1 bg-clark-bg-primary rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-clark-gold to-clark-accent"
                        style={{ width: `${result.popularity}%` }}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && tracks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Music className="w-12 h-12 text-clark-text-muted/30 mb-4" />
            <p className="font-body text-clark-text-muted">No tracks found for {displayName}. Try searching instead.</p>
            <Link href="/search" className="mt-3 text-clark-gold font-body text-sm hover:underline">
              Go to Search
            </Link>
          </div>
        )}
      </div>
    </AppShell>
  )
}
