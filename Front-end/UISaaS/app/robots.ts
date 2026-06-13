import type { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://clark-player.vercel.app'

/**
 * Dynamic robots.txt generation for ClarkPlayer.
 * Next.js serves this automatically at /robots.txt
 *
 * Priority: app/robots.ts > public/robots.txt (Next.js convention)
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/artists',
          '/artists/*',
          '/genres',
          '/genres/*',
          '/playlists',
          '/playlists/*',
          '/music',
          '/music/*',
          '/search',
          '/library',
          '/audios',
          '/settings',
          '/account',
        ],
        disallow: [
          '/api/',
          '/auth/',
          '/reset-password',
          '/verify-email',
          '/login',
          '/forgot-password',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
