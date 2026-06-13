import type { Metadata } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://clark-player.vercel.app'

export const metadata: Metadata = {
  title: 'Search Music',
  description:
    'Search for artists, tracks, and albums on ClarkPlayer. Find music across your library, iTunes, and external music databases.',
  keywords: ['search music', 'find music', 'search artists', 'search tracks', 'music search', 'ClarkPlayer'],
  openGraph: {
    title: 'Search Music — ClarkPlayer',
    description:
      'Search for artists, tracks, and albums on ClarkPlayer. Find music across your library and external databases.',
    url: `${SITE_URL}/search`,
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Search Music — ClarkPlayer',
    description: 'Search for artists, tracks, and albums on ClarkPlayer.',
  },
  alternates: {
    canonical: `${SITE_URL}/search`,
  },
}

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
