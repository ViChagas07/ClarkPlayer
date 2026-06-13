import type { Metadata } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://clark-player.vercel.app'

interface Props {
  params: Promise<{ slug: string }>
}

const genreDisplayNames: Record<string, string> = {
  rock: 'Rock',
  jazz: 'Jazz',
  classical: 'Classical',
  rnb: 'R&B',
  'hip-hop': 'Hip-Hop',
  ambient: 'Ambient',
  electronic: 'Electronic',
  reggae: 'Reggae',
  samba: 'Samba',
  latin: 'Latin',
  gospel: 'Gospel',
  pagode: 'Pagode',
  'heavy-metal': 'Heavy Metal',
  rap: 'Rap',
  forro: 'Forró',
  funk: 'Funk',
  sertanejo: 'Sertanejo',
  romantic: 'Romantic',
  trap: 'Trap',
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const displayName = genreDisplayNames[slug] ?? slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

  const title = `${displayName} Music — Genre | ClarkPlayer`
  const description = `Discover the best ${displayName} tracks on ClarkPlayer. Explore top ${displayName} songs, preview tracks, and dive into the ${displayName} music genre.`

  const url = `${SITE_URL}/genres/${slug}`

  return {
    title,
    description,
    keywords: [
      displayName,
      `${displayName} music`,
      `${displayName} tracks`,
      `${displayName} songs`,
      `${displayName} genre`,
      'ClarkPlayer',
    ],
    openGraph: {
      title,
      description,
      url,
      type: 'website',
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

export default function GenreDetailLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
