import type { Metadata } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://clark-player.vercel.app'

export const metadata: Metadata = {
  title: 'Playlist',
  description: 'View and manage your playlist on ClarkPlayer. Browse tracks, search within playlist, and export.',
  alternates: {
    canonical: `${SITE_URL}/playlists`,
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default function PlaylistDetailLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
