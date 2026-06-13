'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { AppShell } from '@/components/layout/AppShell'
import { useTranslation } from '@/hooks/useTranslation'
import { usePlayerStore } from '@/store/playerStore'
import { api } from '@/lib/api'
import type { UnifiedSearchResult, Track } from '@/types'
import { Play, Music, ChevronLeft, Headphones, Mic2 } from 'lucide-react'
import Image from 'next/image'

// Genre name → image filename
const genreImages: Record<string, string> = {
  Rock: '/genres/Rock_Guitar.png', Jazz: '/genres/Jazz.png', Classical: '/genres/Classical.png',
  'R&B': '/genres/RnB.png', 'Hip-Hop': '/genres/HipHop.png', Ambient: '/genres/Ambient.png',
  Electronic: '/genres/Electronic.png', Reggae: '/genres/Reggae.png', Samba: '/genres/Samba.png',
  Latin: '/genres/Latin.png', Gospel: '/genres/Gospel.png', Pagode: '/genres/Pagode.png',
  'Heavy Metal': '/genres/HeavyMetal.png', Rap: '/genres/Rap.png', 'Forró': '/genres/Forro.png',
  Funk: '/genres/Funk.png', Sertanejo: '/genres/Sertanejo.png', Romantic: '/genres/Romantic.png',
  Trap: '/genres/Trap.png',
  // Mapped to nearest visual match for genres without dedicated images
  Pop: '/genres/Romantic.png', Soul: '/genres/RnB.png', Blues: '/genres/Jazz.png',
  MPB: '/genres/Samba.png', House: '/genres/Electronic.png', Techno: '/genres/Electronic.png',
  'Lo-fi': '/genres/Ambient.png', Indie: '/genres/Ambient.png',
}

// ── Curated artist catalog per genre (local data, no API required) ──────
const GENRE_ARTISTS: Record<string, string[]> = {
  rock: ['Queen', 'Nirvana', 'Led Zeppelin', 'AC/DC', 'Pink Floyd', 'Foo Fighters', 'The Rolling Stones', 'Guns N\' Roses', 'The Beatles', 'Red Hot Chili Peppers', 'U2', 'Pearl Jam', 'Green Day', 'Linkin Park', 'Eagles', 'Bon Jovi', 'The Killers', 'Jimi Hendrix', 'The Doors', 'Fleetwood Mac', 'Aerosmith', 'Van Halen', 'Journey', 'Bruce Springsteen', 'Radiohead', 'Weezer', 'Oasis', 'Arctic Monkeys', 'The Strokes', 'Muse', 'Kings of Leon', 'Coldplay', 'David Bowie', 'The Police', 'The White Stripes', 'Black Sabbath'],
  pop: ['Taylor Swift', 'Ed Sheeran', 'Bruno Mars', 'Ariana Grande', 'Olivia Rodrigo', 'Dua Lipa', 'Harry Styles', 'Billie Eilish', 'Justin Bieber', 'Shawn Mendes', 'Miley Cyrus', 'Lady Gaga', 'Katy Perry', 'Rihanna', 'Sam Smith', 'Sia', 'Charlie Puth', 'Selena Gomez', 'Camila Cabello', 'Demi Lovato', 'Halsey', 'Lizzo', 'Doja Cat', 'Sabrina Carpenter', 'Chappell Roan', 'Troye Sivan', 'Lorde', 'Carly Rae Jepsen', 'Ava Max', 'Bebe Rexha'],
  jazz: ['Miles Davis', 'John Coltrane', 'Louis Armstrong', 'Dave Brubeck', 'Billie Holiday', 'Duke Ellington', 'Ella Fitzgerald', 'Thelonious Monk', 'Charles Mingus', 'Chet Baker', 'Charlie Parker', 'Herbie Hancock', 'Nina Simone', 'Oscar Peterson', 'Count Basie', 'Art Blakey', 'Stan Getz', 'Pat Metheny', 'Chick Corea', 'Ray Charles', 'Etta James', 'Diana Krall', 'Norah Jones', 'Gregory Porter', 'Kamasi Washington'],
  classical: ['Ludovico Einaudi', 'Max Richter', 'Olafur Arnalds', 'Yiruma', 'Hans Zimmer', 'Nils Frahm', 'John Williams', 'Alexis Ffrench', 'Yo-Yo Ma', 'Lang Lang'],
  rnb: ['The Weeknd', 'SZA', 'Frank Ocean', 'Usher', 'Alicia Keys', 'Beyoncé', 'Rihanna', 'Chris Brown', 'Bruno Mars', 'Mary J Blige', 'Lauryn Hill', 'D\'Angelo', 'Erykah Badu', 'Janet Jackson', 'Toni Braxton', 'Boyz II Men', 'Mariah Carey', 'Whitney Houston', 'Michael Jackson', 'Stevie Wonder', 'Prince', 'Khalid', 'Daniel Caesar', 'H.E.R.', 'Summer Walker', 'Jazmine Sullivan', 'Giveon', 'Ari Lennox', 'Jhene Aiko', 'Miguel'],
  soul: ['Aretha Franklin', 'Stevie Wonder', 'Marvin Gaye', 'Ray Charles', 'James Brown', 'Otis Redding', 'Sam Cooke', 'Al Green', 'Smokey Robinson', 'Etta James', 'Nina Simone', 'Bill Withers', 'Curtis Mayfield', 'Donny Hathaway', 'Luther Vandross', 'Anita Baker', 'Whitney Houston', 'Prince', 'Michael Jackson', 'Alicia Keys', 'Amy Winehouse', 'Adele', 'Leon Bridges', 'Jorja Smith'],
  blues: ['B.B. King', 'Muddy Waters', 'Robert Johnson', 'Howlin\' Wolf', 'John Lee Hooker', 'Buddy Guy', 'Stevie Ray Vaughan', 'Eric Clapton', 'Albert King', 'Etta James', 'Taj Mahal', 'Gary Clark Jr', 'Joe Bonamassa', 'Bonnie Raitt'],
  'hip-hop': ['Kendrick Lamar', 'Drake', 'Travis Scott', 'J Cole', 'Eminem', 'Kanye West', 'Lil Wayne', 'Jay Z', 'Nas', '50 Cent', 'Outkast', 'Snoop Dogg', 'Tupac', 'Notorious BIG', 'Ice Cube', 'Cardi B', 'Megan Thee Stallion', 'Nicki Minaj', 'ASAP Rocky', 'Tyler the Creator', 'Denzel Curry', 'JID', 'Big Sean', 'Future', 'Mac Miller', 'Chance the Rapper', 'Kid Cudi', 'Wu Tang Clan'],
  ambient: ['Brian Eno', 'Aphex Twin', 'Tycho', 'Sigur Ros', 'Moby', 'Boards of Canada', 'Explosions in the Sky', 'Jon Hopkins', 'Nils Frahm', 'Olafur Arnalds', 'Max Richter', 'Helios', 'Hiroshi Yoshimura', 'Harold Budd', 'Eluvium', 'Grouper', 'Julianna Barwick', 'Tim Hecker', 'Ryuichi Sakamoto'],
  electronic: ['Daft Punk', 'Calvin Harris', 'Avicii', 'Skrillex', 'Deadmau5', 'Disclosure', 'Zedd', 'Major Lazer', 'Flume', 'ODESZA', 'Porter Robinson', 'Marshmello', 'Kygo', 'David Guetta', 'Tiesto', 'Martin Garrix', 'Swedish House Mafia', 'Illenium', 'Armin van Buuren', 'The Chainsmokers', 'Rufus Du Sol', 'Bonobo', 'Four Tet', 'Caribou', 'The Chemical Brothers', 'Fatboy Slim', 'The Prodigy', 'Jungle', 'Kaytranada', 'Jamie xx', 'Peggy Gou', 'Bicep', 'Overmono'],
  house: ['Daft Punk', 'Disclosure', 'Calvin Harris', 'David Guetta', 'Swedish House Mafia', 'Tiesto', 'Deadmau5', 'Eric Prydz', 'Gorgon City', 'Duke Dumont', 'Fisher', 'Chris Lake', 'Dom Dolla', 'John Summit', 'Vintage Culture'],
  techno: ['Carl Cox', 'Adam Beyer', 'Charlotte de Witte', 'Amelie Lens', 'Richie Hawtin', 'Nina Kraviz', 'Boris Brejcha', 'Tale Of Us', 'Jeff Mills', 'Stephan Bodzin', 'Chris Liebing', 'Maceo Plex', 'Solomun', 'Marco Carola'],
  'lo-fi': ['Nujabes', 'J Dilla', 'Tycho', 'Bonobo', 'Boards of Canada', 'Aphex Twin', 'Four Tet', 'Flamingosis', 'Jinsang', 'Tomppabeats', 'Idealism', 'Elijah Who', 'Wun Two', 'Saib', 'Aso', 'Shlohmo', 'Tokimonsta', 'Knxwledge'],
  indie: ['Tame Impala', 'Mac DeMarco', 'The Strokes', 'Vampire Weekend', 'Bon Iver', 'Beach House', 'Fleet Foxes', 'Phoenix', 'Glass Animals', 'MGMT', 'Alt-J', 'The Neighbourhood', 'Arcade Fire', 'Arctic Monkeys', 'Modest Mouse', 'Death Cab for Cutie', 'Sufjan Stevens', 'Mitski', 'Phoebe Bridgers', 'Snail Mail'],
  reggae: ['Bob Marley', 'Peter Tosh', 'Jimmy Cliff', 'Toots and the Maytals', 'Damian Marley', 'Steel Pulse', 'UB40', 'Burning Spear', 'Gregory Isaacs', 'Dennis Brown', 'Sean Paul', 'Shaggy', 'Ziggy Marley', 'Alpha Blondy', 'Chronixx', 'Protoje', 'Koffee'],
  samba: ['Jorge Ben', 'Cartola', 'Beth Carvalho', 'Paulinho da Viola', 'Martinho da Vila', 'Alcione', 'Zeca Pagodinho', 'Clara Nunes', 'Arlindo Cruz', 'Diogo Nogueira', 'Maria Rita', 'Teresa Cristina', 'Adoniran Barbosa', 'Noel Rosa', 'Elza Soares', 'Elis Regina', 'Gal Costa', 'Caetano Veloso', 'Gilberto Gil', 'Chico Buarque', 'Tom Jobim', 'Djavan', 'Seu Jorge', 'Criolo', 'Emicida'],
  mpb: ['Djavan', 'Gilberto Gil', 'Caetano Veloso', 'Seu Jorge', 'Marisa Monte', 'Chico Buarque', 'Milton Nascimento', 'Gal Costa', 'Tim Maia', 'Jorge Ben Jor', 'Ana Carolina', 'Elis Regina', 'Tom Jobim', 'Vinícius de Moraes', 'Ney Matogrosso', 'Zé Ramalho', 'Alceu Valença', 'Belchior', 'Ivan Lins', 'Simone'],
  latin: ['Bad Bunny', 'Shakira', 'J Balvin', 'Daddy Yankee', 'Karol G', 'Rauw Alejandro', 'Ozuna', 'Nicky Jam', 'Becky G', 'Maluma', 'Rosalia', 'Romeo Santos', 'Aventura', 'Marc Anthony', 'Enrique Iglesias', 'Ricky Martin', 'Jennifer Lopez', 'Gloria Estefan', 'Celia Cruz', 'Carlos Vives', 'Soda Stereo', 'Natalia Lafourcade', 'Mon Laferte', 'Luis Miguel'],
  gospel: ['Kirk Franklin', 'CeCe Winans', 'Tasha Cobbs', 'Marvin Sapp', 'Fred Hammond', 'Yolanda Adams', 'Elevation Worship', 'Hillsong Worship', 'Casting Crowns', 'MercyMe', 'Chris Tomlin', 'Lauren Daigle', 'Bethel Music', 'Phil Wickham', 'Brandon Lake', 'Maverick City Music', 'Matt Redman', 'Hillsong United', 'Aretha Franklin', 'Elvis Presley', 'Carrie Underwood', 'Michael W Smith', 'Amy Grant'],
  pagode: ['Grupo Revelação', 'Exaltasamba', 'Sorriso Maroto', 'Fundo de Quintal', 'Raça Negra', 'Turma do Pagode', 'Molejo', 'Só Pra Contrariar', 'Art Popular', 'Soweto', 'Jeito Moleque', 'Péricles', 'Ferrugem', 'Dilsinho', 'Thiaguinho', 'Mumuzinho', 'Belo', 'Alexandre Pires', 'Os Travessos', 'Inimigos da HP'],
  'heavy-metal': ['Metallica', 'Iron Maiden', 'Black Sabbath', 'Slayer', 'Megadeth', 'Judas Priest', 'Pantera', 'System of a Down', 'Tool', 'Ozzy Osbourne', 'Motorhead', 'Slipknot', 'Avenged Sevenfold', 'Disturbed', 'Rammstein', 'Korn', 'Lamb of God', 'Mastodon', 'Gojira', 'Opeth', 'Trivium', 'Bring Me the Horizon', 'Dio', 'Nightwish', 'Evanescence'],
  rap: ['Eminem', 'Jay Z', 'Nas', '2Pac', 'Notorious BIG', 'Lil Wayne', 'Kendrick Lamar', 'Drake', 'J Cole', 'Travis Scott', 'Future', '21 Savage', 'Migos', 'Lil Baby', 'Post Malone', 'NF', 'Logic', 'Denzel Curry', 'Juice WRLD', 'Lil Uzi Vert', 'A Boogie', 'NBA YoungBoy', 'Tyler the Creator', 'ASAP Rocky', 'Pusha T', 'Lauryn Hill', 'Fugees', 'Nelly', 'Ludacris', 'TI'],
  forro: ['Luiz Gonzaga', 'Dominguinhos', 'Elba Ramalho', 'Alceu Valença', 'Falamansa', 'Geraldo Azevedo', 'Zé Ramalho', 'Mastruz com Leite', 'Wesley Safadão', 'Xand Avião', 'Calcinha Preta', 'Daniela Mercury', 'Ivete Sangalo', 'Claudia Leitte', 'Léo Santana'],
  funk: ['Anitta', 'Ludmilla', 'Kevin O Chris', 'MC Kevinho', 'MC Livinho', 'MC Zaac', 'MC Fioti', 'Pabllo Vittar', 'Gloria Groove', 'Lexa', 'Pedro Sampaio', 'Luisa Sonza', 'Pocah', 'MC Loma', 'Valesca Popozuda'],
  sertanejo: ['Jorge e Mateus', 'Marilia Mendonca', 'Henrique e Juliano', 'Zé Neto e Cristiano', 'Gusttavo Lima', 'Luan Santana', 'Maiara e Maraisa', 'Simone e Simaria', 'Matheus e Kauan', 'Michel Teló', 'Bruno e Marrone', 'Victor e Leo', 'Chitãozinho e Xororó', 'Leonardo', 'Zezé Di Camargo e Luciano', 'Daniel', 'Cristiano Araújo', 'Paula Fernandes', 'Naiara Azevedo'],
  romantic: ['Ed Sheeran', 'Adele', 'John Legend', 'Sam Smith', 'Whitney Houston', 'Celine Dion', 'Elton John', 'Lionel Richie', 'Mariah Carey', 'Bruno Mars', 'Alicia Keys', 'Beyoncé', 'James Arthur', 'Christina Perri', 'Jason Mraz', 'Leona Lewis', 'Coldplay', 'Bryan Adams', 'Richard Marx', 'Phil Collins', 'Eric Clapton', 'George Michael', 'Sade', 'Norah Jones', 'Michael Bublé', 'Josh Groban', 'Andrea Bocelli', 'Frank Sinatra', 'Dean Martin', 'Nat King Cole', 'Etta James', 'Louis Armstrong', 'Elvis Presley'],
  trap: ['Travis Scott', 'Future', 'Migos', 'Lil Baby', '21 Savage', 'Post Malone', 'Gunna', 'Young Thug', 'Playboi Carti', 'Metro Boomin', 'Pop Smoke', 'Juice WRLD', 'Roddy Ricch', 'DaBaby', 'Jack Harlow', 'Drake', 'Lil Uzi Vert', 'Cardi B', 'Lil Yachty', 'Rae Sremmurd', 'Kodak Black', 'Offset', 'Quavo', 'Don Toliver', 'Baby Keem', 'Yeat', 'NLE Choppa', 'Lil Tecca'],
}

const genreDisplayNames: Record<string, string> = {
  rock: 'Rock', pop: 'Pop', jazz: 'Jazz', classical: 'Classical', rnb: 'R&B',
  'hip-hop': 'Hip-Hop', soul: 'Soul', blues: 'Blues', ambient: 'Ambient',
  electronic: 'Electronic', house: 'House', techno: 'Techno', 'lo-fi': 'Lo-fi',
  indie: 'Indie', reggae: 'Reggae', samba: 'Samba', mpb: 'MPB', latin: 'Latin',
  gospel: 'Gospel', pagode: 'Pagode', 'heavy-metal': 'Heavy Metal', rap: 'Rap',
  forro: 'Forró', funk: 'Funk', sertanejo: 'Sertanejo', romantic: 'Romantic', trap: 'Trap',
}

export default function GenreDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { t } = useTranslation()
  const resolvedParams = React.use(params)
  const { setQueue } = usePlayerStore()
  const [tracks, setTracks] = useState<UnifiedSearchResult[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const slug = resolvedParams.slug
  const displayName = genreDisplayNames[slug] ?? slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  const artists = GENRE_ARTISTS[slug] ?? []

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      const results: UnifiedSearchResult[] = []
      const seenTrackIds = new Set<string>()

      // Search for top tracks from each artist (use public iTunes API via api.musicSearch)
      // This does NOT require authentication — falls back to iTunes directly
      const searchQueries = artists.slice(0, 15).map((artist) => `${artist} top`)

      for (const q of searchQueries) {
        if (cancelled) return
        try {
          const data = await api.musicSearch(q, 1)
          const track = data.tracks[0]
          if (track?.track?.title && track.track.preview_url) {
            // Only include tracks with preview_url
            const dedupKey = track.track.mbid ?? `${track.track.title}::${track.artist?.name ?? ''}`
            if (!seenTrackIds.has(dedupKey)) {
              seenTrackIds.add(dedupKey)
              results.push(track)
            }
          }
        } catch {
          // Skip individual query failures — iTunes API is public and free
        }
      }

      if (!cancelled) setTracks(results)
      if (!cancelled) setIsLoading(false)
    }

    load()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        previewUrl: r.track?.preview_url ?? null,
      }))
    setQueue(all, idx)
  }

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header with genre image banner */}
        <div className="relative h-48 sm:h-56 rounded-xl overflow-hidden">
          <Image
            src={genreImages[displayName] ?? '/genres/Rock_Guitar.png'}
            alt={displayName}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-clark-bg-primary via-clark-bg-primary/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 flex items-center gap-4">
            <Link href="/genres" className="p-2 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors shrink-0">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-display text-3xl tracking-widest uppercase text-white drop-shadow-lg">{displayName}</h1>
              <p className="font-body text-sm text-white/70 mt-1">
                {isLoading ? 'Searching...' : `${tracks.length} tracks with preview • ${artists.length} artists`}
              </p>
            </div>
          </div>
        </div>

        {/* Artists section — shows local catalog */}
        {artists.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Mic2 className="w-5 h-5 text-clark-gold" />
              <h2 className="font-display text-lg tracking-widest uppercase text-clark-text-primary">
                {displayName} Artists
              </h2>
              <span className="font-condensed text-xs text-clark-text-muted">({artists.length})</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {artists.map((artist) => (
                <span
                  key={artist}
                  className="px-3 py-1.5 rounded-full bg-clark-bg-card/60 border border-clark-steel/20 text-sm font-body text-clark-text-muted hover:text-clark-text-primary hover:border-clark-gold/40 transition-colors"
                >
                  {artist}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Track grid — Spotify-style cards, only tracks with preview_url */}
        {isLoading ? (
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
              {tracks.map((result, idx) => {
                const track = result.track
                const artist = result.artist
                const coverUrl = result.cover_url ?? result.album?.cover_url ?? null
                const previewUrl = track?.preview_url
                if (!track) return null

                const trackObj: Track = {
                  id: track.mbid ?? `genre-${slug}-${idx}`,
                  title: track.title,
                  artist: artist?.name ?? '',
                  album: result.album?.title ?? '',
                  duration: track.duration ? Math.round(track.duration / 1000) : 200,
                  format: 'MP3',
                  coverUrl: coverUrl ?? undefined,
                  previewUrl: previewUrl ?? null,
                }

                return (
                  <div
                    key={track.mbid ?? `${slug}-${idx}`}
                    onClick={() => handlePlay(result, idx)}
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
                        <button
                          className="flex-shrink-0 p-1 rounded-lg hover:bg-clark-gold/10 text-clark-gold transition-colors"
                          onClick={(e) => {
                            e.stopPropagation()
                            usePlayerStore.getState().playPreview(previewUrl, trackObj)
                          }}
                          aria-label={`Preview ${track.title}`}
                          title={t('previewLabel')}
                        >
                          <Headphones className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
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
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Music className="w-12 h-12 text-clark-text-muted/30 mb-4" />
            <p className="font-body text-clark-text-muted">No preview tracks found for {displayName}.</p>
            <Link href="/search" className="mt-3 text-clark-gold font-body text-sm hover:underline">
              Go to Search
            </Link>
          </div>
        )}
      </div>
    </AppShell>
  )
}
