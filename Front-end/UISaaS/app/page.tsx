import type { Metadata } from 'next'
import { AppShell } from '@/components/layout/AppShell'
import { NowPlayingContent } from '@/components/NowPlayingContent'
import { BreadcrumbStructuredData } from '@/components/seo/BreadcrumbList'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://clark-player.vercel.app'

export const metadata: Metadata = {
  title: 'Now Playing — Discover Music',
  description:
    'Your current listening session on ClarkPlayer. Discover trending tracks, Brazilian music, Pop, Rock, Rap, Electronic, R&B and more — powered by Superman-grade performance.',
  keywords: [
    'now playing',
    'trending music',
    'discover music',
    'Brazilian music',
    'pop music',
    'rock music',
    'electronic music',
    'R&B music',
    'rap music',
    'music discovery',
    'ClarkPlayer',
  ],
  openGraph: {
    title: 'ClarkPlayer — Discover Music Now',
    description:
      'Discover trending tracks, Brazilian artists, Pop, Rock, Rap, Electronic, and R&B music on ClarkPlayer.',
    url: SITE_URL,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ClarkPlayer — Discover Music Now',
    description:
      'Discover trending tracks, Brazilian artists, Pop, Rock, Rap, Electronic, and R&B music on ClarkPlayer.',
  },
  alternates: {
    canonical: SITE_URL,
  },
}

export default function HomePage() {
  return (
    <AppShell>
      <BreadcrumbStructuredData
        items={[{ name: 'Home', url: SITE_URL }]}
      />
      <NowPlayingContent />
    </AppShell>
  )
}
