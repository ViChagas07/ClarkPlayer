import type { Metadata } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://clark-player.vercel.app'

export const metadata: Metadata = {
  title: 'Browse by Genre',
  description:
    'Browse music by genre on ClarkPlayer. Discover Rock, Jazz, Classical, R&B, Hip-Hop, Electronic, Samba, Latin, Gospel and more. Explore tracks organized by genre.',
  keywords: [
    'music genres',
    'browse by genre',
    'rock music',
    'jazz music',
    'electronic music',
    'hip hop music',
    'samba music',
    'latin music',
    'ClarkPlayer genres',
  ],
  openGraph: {
    title: 'Browse by Genre — ClarkPlayer',
    description:
      'Browse music by genre on ClarkPlayer. Discover Rock, Jazz, Classical, R&B, Hip-Hop, Electronic, Samba, Latin, and more.',
    url: `${SITE_URL}/genres`,
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Browse by Genre — ClarkPlayer',
    description:
      'Browse music by genre on ClarkPlayer. Discover Rock, Jazz, Classical, R&B, Hip-Hop, Electronic, and more.',
  },
  alternates: {
    canonical: `${SITE_URL}/genres`,
  },
}

export default function GenresLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
