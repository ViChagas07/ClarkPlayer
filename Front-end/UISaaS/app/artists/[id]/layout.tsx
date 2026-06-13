import type { Metadata } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://clark-player.vercel.app'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ name?: string }>
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { id: mbid } = await params
  const { name } = await searchParams
  const artistName = name ? decodeURIComponent(name) : 'Artist'

  const title = `${artistName} — Artist Profile | ClarkPlayer`
  const description =
    name
      ? `Explore ${artistName}'s complete artist profile on ClarkPlayer. View top tracks, biography, similar artists, and discography.`
      : 'Artist profile on ClarkPlayer. View top tracks, biography, and similar artists.'

  const url = `${SITE_URL}/artists/${mbid}${name ? `?name=${encodeURIComponent(artistName)}` : ''}`

  return {
    title,
    description,
    keywords: [artistName, `${artistName} music`, `${artistName} songs`, `${artistName} artist`, `${artistName} top tracks`, 'ClarkPlayer'],
    openGraph: {
      title,
      description,
      url,
      type: 'profile',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    alternates: {
      canonical: url,
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default function ArtistDetailLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
