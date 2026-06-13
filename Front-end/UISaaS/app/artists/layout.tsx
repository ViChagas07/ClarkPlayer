import type { Metadata } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://clark-player.vercel.app'

export const metadata: Metadata = {
  title: 'Artist Discovery',
  description:
    'Discover artists across 16 genres. Explore Brazilian and international music artists with ClarkPlayer. Browse pop, rock, rap, sertanejo, MPB, R&B, electronic, and more.',
  keywords: [
    'artists',
    'music artists',
    'discover artists',
    'Brazilian artists',
    'international artists',
    'pop artists',
    'rock artists',
    'hip hop artists',
    'ClarkPlayer artists',
  ],
  openGraph: {
    title: 'Artist Discovery — ClarkPlayer',
    description:
      'Discover artists across 16 genres. Explore Brazilian and international music artists with ClarkPlayer.',
    url: `${SITE_URL}/artists`,
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Artist Discovery — ClarkPlayer',
    description:
      'Discover artists across 16 genres. Explore Brazilian and international music artists with ClarkPlayer.',
  },
  alternates: {
    canonical: `${SITE_URL}/artists`,
  },
}

export default function ArtistsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
