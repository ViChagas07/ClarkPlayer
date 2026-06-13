import type { Metadata } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://clark-player.vercel.app'

export const metadata: Metadata = {
  title: 'Tracks',
  description:
    'Browse all tracks on ClarkPlayer. Search, filter, and sort your music tracks collection with advanced sorting options.',
  keywords: ['all tracks', 'music tracks', 'track list', 'audio files', 'music catalog', 'ClarkPlayer'],
  openGraph: {
    title: 'Tracks — ClarkPlayer',
    description:
      'Browse all tracks on ClarkPlayer. Search, filter, and sort your music tracks collection.',
    url: `${SITE_URL}/audios`,
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Tracks — ClarkPlayer',
    description: 'Browse all tracks on ClarkPlayer with advanced search, filter, and sort options.',
  },
  alternates: {
    canonical: `${SITE_URL}/audios`,
  },
}

export default function AudiosLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
