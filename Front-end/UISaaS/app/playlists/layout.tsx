import type { Metadata } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://clark-player.vercel.app'

export const metadata: Metadata = {
  title: 'Your Playlists',
  description:
    'Browse and manage your playlists on ClarkPlayer. Create, organize, and listen to your custom music playlists.',
  keywords: ['playlists', 'music playlists', 'custom playlists', 'playlist management', 'ClarkPlayer'],
  openGraph: {
    title: 'Your Playlists — ClarkPlayer',
    description:
      'Browse and manage your playlists on ClarkPlayer. Create, organize, and listen to your custom music playlists.',
    url: `${SITE_URL}/playlists`,
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Your Playlists — ClarkPlayer',
    description:
      'Browse and manage your playlists on ClarkPlayer. Create, organize, and listen to your custom music playlists.',
  },
  alternates: {
    canonical: `${SITE_URL}/playlists`,
  },
}

export default function PlaylistsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
