import type { Metadata } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://clark-player.vercel.app'

interface Props {
  params: Promise<{ mbid: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { mbid } = await params

  const title = 'Track Details — ClarkPlayer'
  const description =
    'View detailed track information on ClarkPlayer. Explore audio features, lyrics, similar tracks, and related artists.'

  const url = `${SITE_URL}/music/track/${mbid}`

  return {
    title: 'Track Details',
    description,
    keywords: ['track details', 'music track', 'audio features', 'lyrics', 'song information', 'ClarkPlayer'],
    openGraph: {
      title,
      description,
      url,
      type: 'music.song',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    alternates: {
      canonical: url,
    },
  }
}

export default function TrackDetailLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
