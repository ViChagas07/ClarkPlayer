import { Metadata } from 'next'
import { AppShell } from '@/components/layout/AppShell'
import { NowPlayingContent } from '@/components/NowPlayingContent'

export const metadata: Metadata = {
  title: 'Now Playing',
  description: 'Your current listening session on ClarkPlayer.',
}

export default function HomePage() {
  return (
    <AppShell>
      <NowPlayingContent />
    </AppShell>
  )
}
