/**
 * ClarkPlayer Seed Catalog — discovery seed lists for the iTunes Search API.
 *
 * These are NOT mock data — they are search queries fed into the real
 * iTunes Search API. Every result is real, dynamic, and fetched live.
 *
 * The smart picker rotates selections so the catalog feels fresh every visit.
 */

// ── Smart picker — returns N random items from a list ──────────────
function cryptoRandom(): number {
  const arr = new Uint32Array(1)
  crypto.getRandomValues(arr)
  return arr[0] / 0xFFFFFFFF
}

/** Partial Fisher-Yates — shuffles only first `count` elements, O(k) instead of O(n) */
export function pickRandom<T>(arr: readonly T[], count: number): T[] {
  if (count <= 0 || arr.length === 0) return []
  const n = Math.min(count, arr.length)
  const copy = arr.slice(0, n) // take first N as seed
  for (let i = 0; i < n; i++) {
    const j = i + Math.floor(cryptoRandom() * (arr.length - i))
    copy[i] = arr[j] ?? arr[i]!
  }
  return copy
}

// ═══════════════════════════════════════════════════════════════════
// 🇧🇷 BRAZILIAN ARTISTS — by genre
// ═══════════════════════════════════════════════════════════════════

export const BRAZILIAN_ARTISTS: Record<string, readonly string[]> = {
  sertanejo: [
    'Jorge e Mateus', 'Henrique e Juliano', 'Marilia Mendonca',
    'Luan Santana', 'Gusttavo Lima', 'Zé Neto e Cristiano',
    'Maiara e Maraisa', 'Simone e Simaria',
  ],
  mpb: [
    'Djavan', 'Gilberto Gil', 'Caetano Veloso', 'Seu Jorge',
    'Marisa Monte', 'Chico Buarque', 'Milton Nascimento',
    'Gal Costa', 'Tim Maia', 'Jorge Ben Jor',
  ],
  pop_br: [
    'Anitta', 'Luisa Sonza', 'IZA', 'Jão', 'Melim',
    'Gloria Groove', 'Pabllo Vittar', 'Ludmilla',
    'Priscilla Alcantara', 'Duda Beat',
  ],
  rock_br: [
    'Legiao Urbana', 'Titas', 'Skank', 'Charlie Brown Jr',
    'Pitty', 'NX Zero', 'Fresno', 'Capital Inicial',
    'Os Paralamas do Sucesso', 'Engenheiros do Hawaii',
  ],
  rap_trap_br: [
    'Emicida', 'Criolo', 'Matue', 'Teto', 'Veigh',
    'MC Cabelinho', 'MC Ryan SP', 'Projota', 'Racionais MC',
    'Filipe Ret', 'Hungria', 'Wiu',
  ],
  samba_pagode: [
    'Zeca Pagodinho', 'Beth Carvalho', 'Alcione', 'Fundo de Quintal',
    'Grupo Revelacao', 'Exaltasamba', 'Só Pra Contrariar',
    'Turma do Pagode', 'Ferrugem', 'Dilsinho',
  ],
  forro: [
    'Elba Ramalho', 'Alceu Valenca', 'Dominguinhos',
    'Wesley Safadao', 'Xand Avião',
  ],
  bossa_nova: [
    'Joao Gilberto', 'Tom Jobim', 'Vinicius de Moraes',
    'Astrud Gilberto', 'Elis Regina',
  ],
  gospel_br: [
    'Aline Barros', 'Fernandinho', 'Gabriela Rocha',
    'Isaias Saad', 'Preto no Branco',
  ],
  indie_br: [
    'Rubel', 'Liniker', 'Terno Rei', 'O Terno',
    'Boogarins', 'Ana Frango Eletrico',
  ],
}

// All Brazilian artists flattened
export const ALL_BRAZILIAN: readonly string[] = Object.values(BRAZILIAN_ARTISTS).flat()

// ═══════════════════════════════════════════════════════════════════
// 🌍 INTERNATIONAL ARTISTS — by genre
// ═══════════════════════════════════════════════════════════════════

export const INTERNATIONAL_ARTISTS: Record<string, readonly string[]> = {
  pop: [
    'Taylor Swift', 'Ed Sheeran', 'Bruno Mars', 'Ariana Grande',
    'Olivia Rodrigo', 'Dua Lipa', 'Harry Styles', 'Billie Eilish',
    'Justin Bieber', 'Shawn Mendes', 'Miley Cyrus', 'Lady Gaga',
    'Katy Perry', 'Rihanna', 'Sam Smith', 'Sia',
  ],
  rock: [
    'Coldplay', 'Imagine Dragons', 'Linkin Park', 'Queen',
    'Muse', 'Arctic Monkeys', 'Foo Fighters', 'Red Hot Chili Peppers',
    'The Killers', 'Green Day', 'Nirvana', 'Radiohead',
    'U2', 'The Beatles', 'Led Zeppelin', 'Pink Floyd',
  ],
  rap: [
    'Drake', 'Kendrick Lamar', 'Eminem', 'J Cole', 'Travis Scott',
    'Kanye West', 'Lil Wayne', 'Post Malone', '21 Savage',
    'Future', 'Migos', 'Nicki Minaj', 'Cardi B', 'Tyler The Creator',
    'A$AP Rocky', 'Mac Miller',
  ],
  electronic: [
    'Martin Garrix', 'Avicii', 'Kygo', 'Alan Walker',
    'Marshmello', 'David Guetta', 'Calvin Harris', 'The Chainsmokers',
    'Zedd', 'Skrillex', 'Deadmau5', 'Tiesto',
  ],
  rnb: [
    'The Weeknd', 'SZA', 'Frank Ocean', 'Chris Brown',
    'Beyoncé', 'Alicia Keys', 'Usher', 'Daniel Caesar',
    'H.E.R.', 'Summer Walker', 'Khalid', 'Miguel',
  ],
  indie: [
    'Tame Impala', 'Mac DeMarco', 'The Strokes', 'Vampire Weekend',
    'Bon Iver', 'Beach House', 'Fleet Foxes', 'Phoenix',
    'Glass Animals', 'MGMT', 'Alt-J', 'The Neighbourhood',
  ],
  latin: [
    'Bad Bunny', 'J Balvin', 'Karol G', 'Shakira', 'Maluma',
    'Rosalia', 'Ozuna', 'Daddy Yankee', 'Rauw Alejandro',
    'Feid', 'Nicky Jam', 'Anuel AA',
  ],
  kpop: [
    'BTS', 'Blackpink', 'Twice', 'Stray Kids', 'NewJeans',
    'Seventeen', 'EXO', 'Red Velvet',
  ],
  afrobeats: [
    'Burna Boy', 'Wizkid', 'Davido', 'Tems', 'Rema',
    'Ckay', 'Fireboy DML', 'Ayra Starr',
  ],
  classical: [
    'Ludovico Einaudi', 'Max Richter', 'Olafur Arnalds',
    'Yiruma', 'Nils Frahm', 'Hans Zimmer',
  ],
  jazz: [
    'Miles Davis', 'John Coltrane', 'Bill Evans',
    'Norah Jones', 'Gregory Porter', 'Kamasi Washington',
  ],
  country: [
    'Luke Combs', 'Morgan Wallen', 'Chris Stapleton',
    'Kacey Musgraves', 'Zach Bryan', 'Luke Bryan',
  ],
}

// All international artists flattened
export const ALL_INTERNATIONAL: readonly string[] = Object.values(INTERNATIONAL_ARTISTS).flat()

// ═══════════════════════════════════════════════════════════════════
// 🎵 POPULAR TRACK QUERIES — for preview discovery
// ═══════════════════════════════════════════════════════════════════

export const TRENDING_TRACKS: readonly string[] = [
  'Blinding Lights',
  'Bohemian Rhapsody',
  'Shape of You',
  'Billie Jean',
  'Hotel California',
  'Smells Like Teen Spirit',
  'Imagine',
  'Lose Yourself',
  'Stairway to Heaven',
  'Sweet Child O Mine',
  'Wonderwall',
  'Yesterday',
  'Hallelujah',
  'Rolling in the Deep',
  'Uptown Funk',
  'Despacito',
  'Shallow',
  'Someone Like You',
  'Thinking Out Loud',
  'Perfect',
]

// ═══════════════════════════════════════════════════════════════════
// 🎲 SESSION ROTATION — returns fresh picks each visit
// ═══════════════════════════════════════════════════════════════════

export function getSessionArtists(count: number = 15): string[] {
  // Mix Brazilian + International, pick randomly
  const pool = [...ALL_BRAZILIAN, ...ALL_INTERNATIONAL]
  return pickRandom(pool, count)
}

export function getSessionTracks(count: number = 8): string[] {
  return pickRandom(TRENDING_TRACKS, count)
}

export function getBrazilianHighlights(count: number = 8): string[] {
  return pickRandom(ALL_BRAZILIAN, count)
}

export function getArtistsByGenre(genre: string, count: number = 6): string[] {
  const artists = INTERNATIONAL_ARTISTS[genre] ?? BRAZILIAN_ARTISTS[genre] ?? []
  return pickRandom(artists, Math.min(count, artists.length))
}
