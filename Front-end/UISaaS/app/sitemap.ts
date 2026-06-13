import type { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://clark-player.vercel.app'

/**
 * Dynamic sitemap generation for ClarkPlayer.
 * Covers all static and dynamic content routes.
 *
 * Next.js serves this automatically at /sitemap.xml
 */
export default function sitemap(): MetadataRoute.Sitemap {
  // ── Static pages ──────────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/library`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/artists`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/genres`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/playlists`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/search`,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/audios`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/settings`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/account`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ]

  // ── Genre pages ──────────────────────────────────────────────
  const genreSlugs = [
    'rock', 'jazz', 'classical', 'rnb', 'hip-hop', 'ambient',
    'electronic', 'reggae', 'samba', 'latin', 'gospel', 'pagode',
    'heavy-metal', 'rap', 'forro', 'funk', 'sertanejo', 'romantic', 'trap',
  ]

  const genrePages: MetadataRoute.Sitemap = genreSlugs.map((slug) => ({
    url: `${SITE_URL}/genres/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.75,
  }))

  // ── High-value artist pages (popular artists for discoverability) ──
  const featuredArtists = [
    { mbid: '4f81b6f9-3ab4-4d26-9b6a-5067044ad61b', name: 'Coldplay' },
    { mbid: 'cc197bad-dc9c-440d-a5b5-d52ba2e14234', name: 'The-Weeknd' },
    { mbid: '8bfac288-ccc5-448d-9573-c33ea2aa5c30', name: 'Drake' },
    { mbid: '5b11f4ce-a62d-471e-81fc-a69a8278c7da', name: 'Kendrick-Lamar' },
    { mbid: '6be462b8-4e7a-4392-8478-cc9e412f2bee', name: 'Taylor-Swift' },
  ]

  const artistPages: MetadataRoute.Sitemap = featuredArtists.map((artist) => ({
    url: `${SITE_URL}/artists/${artist.mbid}?name=${encodeURIComponent(artist.name)}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.85,
  }))

  // ── High-value track pages ──────────────────────────────────
  const featuredTracks = [
    '7f0baca-7dad-4ba8-a159-4f8c3889b4db', // Yellow - Coldplay
    '29cbc1ae-6f94-4c46-ad51-1a9e54f37a44', // Blinding Lights
  ]

  const trackPages: MetadataRoute.Sitemap = featuredTracks.map((mbid) => ({
    url: `${SITE_URL}/music/track/${mbid}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  return [...staticPages, ...genrePages, ...artistPages, ...trackPages]
}
