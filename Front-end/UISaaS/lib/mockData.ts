import type { Track, Playlist, Artist, Genre, LyricLine } from '@/types'

const FORMATS = ['FLAC', 'MP3', 'WAV', 'AAC', 'OGG', 'M4A', 'OPUS'] as const
const ARTISTS = [
  'Aurora Waves', 'Neon Drift', 'Silent Echo', 'Velvet Storm',
  'Crystal Haze', 'Midnight Pulse', 'Solar Flare', 'Deep Current',
  'Iron Bloom', 'Ghost Signal', 'Lunar Tide', 'Amber Sky',
]
const ALBUMS = [
  'Horizons', 'Frequency', 'Afterglow', 'Shadows', 'Prism',
  'Voltage', 'Cascade', 'Nebula', 'Ember', 'Phantom',
]
const GENRES = ['Pop', 'Rock', 'Electronic', 'Jazz', 'Classical', 'Hip-Hop', 'R&B', 'Metal']

function randomDuration(): number {
  return Math.floor(Math.random() * 300) + 120
}

function randomDate(): string {
  const d = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000)
  return d.toISOString()
}

export const mockTracks: Track[] = Array.from({ length: 50 }, (_, i) => ({
  id: `track-${i}`,
  title: [
    'Midnight Drive', 'Electric Dreams', 'Fading Light', 'Ocean Floor',
    'Neon Rain', 'Crystal Clear', 'Shadow Dance', 'Golden Hour',
    'Deep Blue', 'Starfall', 'Velvet Touch', 'Iron Will',
    'Ghost Town', 'Lunar Eclipse', 'Amber Glow', 'Silent Storm',
    'Pulse Wave', 'Crystal Maze', 'Neon Pulse', 'Dark Horizon',
  ][i % 20] + (i >= 20 ? ` (Remix ${Math.floor(i / 20)})` : ''),
  artist: ARTISTS[i % ARTISTS.length],
  album: ALBUMS[i % ALBUMS.length],
  duration: randomDuration(),
  format: FORMATS[i % FORMATS.length],
  year: 2020 + (i % 5),
  genre: GENRES[i % GENRES.length],
  playCount: Math.floor(Math.random() * 10000),
  isFavorite: Math.random() > 0.7,
  addedAt: randomDate(),
}))

export const mockPlaylists: Playlist[] = [
  {
    id: 'pl-1', name: 'Late Night Coding', description: 'Focus music for deep work sessions',
    isPrivate: false, isCollaborative: false, collaborators: [], tracks: mockTracks.slice(0, 8),
    createdAt: '2024-01-15T10:00:00Z', updatedAt: '2024-06-20T14:30:00Z',
    playCount: 342, totalDuration: mockTracks.slice(0, 8).reduce((a, t) => a + t.duration, 0),
  },
  {
    id: 'pl-2', name: 'Workout Energy', description: 'High BPM tracks for the gym',
    isPrivate: false, isCollaborative: true,
    collaborators: [
      { id: 'u1', displayName: 'Alex', email: 'alex@example.com', tier: 'free', createdAt: '2024-01-01T00:00:00Z' },
      { id: 'u2', displayName: 'Sam', email: 'sam@example.com', tier: 'pro', createdAt: '2024-02-01T00:00:00Z' },
    ],
    tracks: mockTracks.slice(8, 16),
    createdAt: '2024-03-10T08:00:00Z', updatedAt: '2024-07-01T09:15:00Z',
    playCount: 1205, totalDuration: mockTracks.slice(8, 16).reduce((a, t) => a + t.duration, 0),
  },
  {
    id: 'pl-3', name: 'Chill Vibes', description: '',
    isPrivate: true, isCollaborative: false, collaborators: [], tracks: mockTracks.slice(16, 24),
    createdAt: '2024-05-20T16:00:00Z', updatedAt: '2024-05-20T16:00:00Z',
    playCount: 89, totalDuration: mockTracks.slice(16, 24).reduce((a, t) => a + t.duration, 0),
  },
  {
    id: 'pl-4', name: 'Road Trip 2024', description: 'Summer highway anthems',
    isPrivate: false, isCollaborative: false, collaborators: [], tracks: mockTracks.slice(24, 32),
    createdAt: '2024-06-01T12:00:00Z', updatedAt: '2024-06-15T18:00:00Z',
    playCount: 567, totalDuration: mockTracks.slice(24, 32).reduce((a, t) => a + t.duration, 0),
  },
  {
    id: 'pl-5', name: 'Discover Weekly', description: 'Fresh picks from ClarkPlayer',
    isPrivate: false, isCollaborative: false, collaborators: [], tracks: mockTracks.slice(32, 40),
    createdAt: '2024-07-01T00:00:00Z', updatedAt: '2024-07-08T00:00:00Z',
    playCount: 2103, totalDuration: mockTracks.slice(32, 40).reduce((a, t) => a + t.duration, 0),
  },
  {
    id: 'pl-6', name: 'Focus Flow', description: 'Instrumental and ambient for concentration',
    isPrivate: false, isCollaborative: false, collaborators: [], tracks: mockTracks.slice(40, 50),
    createdAt: '2024-04-12T09:00:00Z', updatedAt: '2024-06-28T11:00:00Z',
    playCount: 890, totalDuration: mockTracks.slice(40, 50).reduce((a, t) => a + t.duration, 0),
  },
]

export const mockArtists: Artist[] = [
  { id: 'art-1', name: 'Aurora Waves', avatarUrl: '/placeholder/artist-1.jpg', bio: 'Electronic music producer from Reykjavik.', isVerified: true, albumCount: 4, genres: ['Electronic', 'Ambient'] },
  { id: 'art-2', name: 'Neon Drift', avatarUrl: '/placeholder/artist-2.jpg', bio: 'Synthwave duo blending retro and modern.', isVerified: true, albumCount: 3, genres: ['Electronic', 'Synthwave'] },
  { id: 'art-3', name: 'Silent Echo', avatarUrl: '/placeholder/artist-3.jpg', bio: 'Post-rock instrumental collective.', isVerified: false, albumCount: 2, genres: ['Rock', 'Post-Rock'] },
  { id: 'art-4', name: 'Velvet Storm', avatarUrl: '/placeholder/artist-4.jpg', bio: 'Alternative rock with electronic elements.', isVerified: true, albumCount: 5, genres: ['Rock', 'Alternative'] },
  { id: 'art-5', name: 'Crystal Haze', avatarUrl: '/placeholder/artist-5.jpg', bio: 'Dream pop and shoegaze artist.', isVerified: false, albumCount: 1, genres: ['Pop', 'Dream Pop'] },
  { id: 'art-6', name: 'Midnight Pulse', avatarUrl: '/placeholder/artist-6.jpg', bio: 'Deep house and techno producer.', isVerified: true, albumCount: 6, genres: ['Electronic', 'House'] },
  { id: 'art-7', name: 'Solar Flare', avatarUrl: '/placeholder/artist-7.jpg', bio: 'Progressive metal band.', isVerified: false, albumCount: 3, genres: ['Metal', 'Progressive'] },
  { id: 'art-8', name: 'Deep Current', avatarUrl: '/placeholder/artist-8.jpg', bio: 'Jazz fusion ensemble.', isVerified: true, albumCount: 4, genres: ['Jazz', 'Fusion'] },
  { id: 'art-9', name: 'Iron Bloom', avatarUrl: '/placeholder/artist-9.jpg', bio: 'Industrial rock project.', isVerified: false, albumCount: 2, genres: ['Rock', 'Industrial'] },
  { id: 'art-10', name: 'Ghost Signal', avatarUrl: '/placeholder/artist-10.jpg', bio: 'Ambient and drone artist.', isVerified: false, albumCount: 1, genres: ['Ambient', 'Drone'] },
]

export const mockGenres: Genre[] = [
  { slug: 'rock', name: 'Rock', trackCount: 987, gradientFrom: 'from-red-700', gradientTo: 'to-orange-500', coverUrl: '/genres/Rock_Guitar.png' },
  { slug: 'pop', name: 'Pop', trackCount: 1845, gradientFrom: 'from-pink-600', gradientTo: 'to-purple-400', coverUrl: '/genres/Romantic.png' },
  { slug: 'hip-hop', name: 'Hip-Hop', trackCount: 1567, gradientFrom: 'from-amber-600', gradientTo: 'to-yellow-400', coverUrl: '/genres/HipHop.png' },
  { slug: 'rap', name: 'Rap', trackCount: 876, gradientFrom: 'from-gray-900', gradientTo: 'to-amber-600', coverUrl: '/genres/Rap.png' },
  { slug: 'rnb', name: 'R&B', trackCount: 876, gradientFrom: 'from-purple-700', gradientTo: 'to-fuchsia-400', coverUrl: '/genres/RnB.png' },
  { slug: 'soul', name: 'Soul', trackCount: 543, gradientFrom: 'from-rose-600', gradientTo: 'to-amber-500', coverUrl: '/genres/RnB.png' },
  { slug: 'jazz', name: 'Jazz', trackCount: 654, gradientFrom: 'from-amber-800', gradientTo: 'to-amber-500', coverUrl: '/genres/Jazz.png' },
  { slug: 'blues', name: 'Blues', trackCount: 321, gradientFrom: 'from-blue-800', gradientTo: 'to-slate-600', coverUrl: '/genres/Jazz.png' },
  { slug: 'heavy-metal', name: 'Heavy Metal', trackCount: 543, gradientFrom: 'from-zinc-800', gradientTo: 'to-red-600', coverUrl: '/genres/HeavyMetal.png' },
  { slug: 'mpb', name: 'MPB', trackCount: 678, gradientFrom: 'from-emerald-600', gradientTo: 'to-yellow-500', coverUrl: '/genres/Samba.png' },
  { slug: 'samba', name: 'Samba', trackCount: 891, gradientFrom: 'from-green-600', gradientTo: 'to-yellow-400', coverUrl: '/genres/Samba.png' },
  { slug: 'pagode', name: 'Pagode', trackCount: 423, gradientFrom: 'from-orange-700', gradientTo: 'to-yellow-500', coverUrl: '/genres/Pagode.png' },
  { slug: 'forro', name: 'Forró', trackCount: 345, gradientFrom: 'from-blue-700', gradientTo: 'to-yellow-500', coverUrl: '/genres/Forro.png' },
  { slug: 'sertanejo', name: 'Sertanejo', trackCount: 654, gradientFrom: 'from-emerald-700', gradientTo: 'to-green-400', coverUrl: '/genres/Sertanejo.png' },
  { slug: 'funk', name: 'Funk', trackCount: 567, gradientFrom: 'from-pink-700', gradientTo: 'to-rose-400', coverUrl: '/genres/Funk.png' },
  { slug: 'electronic', name: 'Electronic', trackCount: 2103, gradientFrom: 'from-violet-700', gradientTo: 'to-indigo-400', coverUrl: '/genres/Electronic.png' },
  { slug: 'house', name: 'House', trackCount: 456, gradientFrom: 'from-cyan-600', gradientTo: 'to-blue-500', coverUrl: '/genres/Electronic.png' },
  { slug: 'techno', name: 'Techno', trackCount: 389, gradientFrom: 'from-slate-800', gradientTo: 'to-cyan-500', coverUrl: '/genres/Electronic.png' },
  { slug: 'lo-fi', name: 'Lo-fi', trackCount: 567, gradientFrom: 'from-amber-500', gradientTo: 'to-orange-400', coverUrl: '/genres/Ambient.png' },
  { slug: 'indie', name: 'Indie', trackCount: 765, gradientFrom: 'from-indigo-600', gradientTo: 'to-teal-400', coverUrl: '/genres/Ambient.png' },
  { slug: 'reggae', name: 'Reggae', trackCount: 234, gradientFrom: 'from-green-700', gradientTo: 'to-yellow-500', coverUrl: '/genres/Reggae.png' },
  { slug: 'gospel', name: 'Gospel', trackCount: 567, gradientFrom: 'from-yellow-700', gradientTo: 'to-amber-400', coverUrl: '/genres/Gospel.png' },
  { slug: 'classical', name: 'Classical', trackCount: 432, gradientFrom: 'from-slate-700', gradientTo: 'to-slate-400', coverUrl: '/genres/Classical.png' },
  { slug: 'latin', name: 'Latin', trackCount: 1098, gradientFrom: 'from-orange-600', gradientTo: 'to-red-400', coverUrl: '/genres/Latin.png' },
  { slug: 'ambient', name: 'Ambient', trackCount: 765, gradientFrom: 'from-sky-700', gradientTo: 'to-cyan-400', coverUrl: '/genres/Ambient.png' },
  { slug: 'romantic', name: 'Romantic', trackCount: 432, gradientFrom: 'from-rose-700', gradientTo: 'to-pink-400', coverUrl: '/genres/Romantic.png' },
  { slug: 'trap', name: 'Trap', trackCount: 789, gradientFrom: 'from-slate-900', gradientTo: 'to-violet-600', coverUrl: '/genres/Trap.png' },
]

export const mockLyrics: LyricLine[] = [
  { timestamp: 0, text: "Driving through the midnight haze" },
  { timestamp: 4, text: "Neon signs blur into the rain" },
  { timestamp: 8, text: "Every streetlight tells a story" },
  { timestamp: 12, text: "Of the ones who came before" },
  { timestamp: 16, text: "" },
  { timestamp: 18, text: "We're electric dreams in a analog world" },
  { timestamp: 22, text: "Fading signals, memories unfurled" },
  { timestamp: 26, text: "Hold on tight to what we know" },
  { timestamp: 30, text: "Before the current starts to slow" },
  { timestamp: 34, text: "" },
  { timestamp: 36, text: "Midnight drive, endless road" },
  { timestamp: 40, text: "Heartbeat syncs to the radio" },
  { timestamp: 44, text: "Every mile a memory" },
  { timestamp: 48, text: "Every turn a melody" },
  { timestamp: 52, text: "" },
  { timestamp: 54, text: "We're electric dreams in a analog world" },
  { timestamp: 58, text: "Fading signals, memories unfurled" },
  { timestamp: 62, text: "Hold on tight to what we know" },
  { timestamp: 66, text: "Before the current starts to slow" },
  { timestamp: 70, text: "" },
  { timestamp: 72, text: "Through the static, through the noise" },
  { timestamp: 76, text: "We find our signal, find our voice" },
  { timestamp: 80, text: "In the glow of dashboard light" },
  { timestamp: 84, text: "Everything feels right tonight" },
  { timestamp: 88, text: "" },
  { timestamp: 90, text: "We're electric dreams in a analog world" },
  { timestamp: 94, text: "Fading signals, memories unfurled" },
  { timestamp: 98, text: "Hold on tight to what we know" },
  { timestamp: 102, text: "Before the current starts to slow" },
  { timestamp: 106, text: "Before the current starts to slow..." },
]
