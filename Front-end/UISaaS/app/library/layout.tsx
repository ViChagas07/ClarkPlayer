import type { Metadata } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://clark-player.vercel.app'

export const metadata: Metadata = {
  title: 'Music Library',
  description:
    'Your personal music library on ClarkPlayer. Browse, organize, and manage your uploaded tracks and music collection.',
  keywords: ['music library', 'my library', 'uploaded tracks', 'music collection', 'ClarkPlayer'],
  openGraph: {
    title: 'Music Library — ClarkPlayer',
    description:
      'Your personal music library on ClarkPlayer. Browse, organize, and manage your uploaded tracks and music collection.',
    url: `${SITE_URL}/library`,
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Music Library — ClarkPlayer',
    description:
      'Your personal music library on ClarkPlayer. Browse, organize, and manage your uploaded tracks.',
  },
  alternates: {
    canonical: `${SITE_URL}/library`,
  },
}

export default function LibraryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
