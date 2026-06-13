import type { Metadata } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://clark-player.vercel.app'

export const metadata: Metadata = {
  title: 'Settings',
  description:
    'Customize your ClarkPlayer experience. Adjust appearance, language, library settings, playback preferences, and more.',
  keywords: ['settings', 'preferences', 'appearance', 'language', 'playback settings', 'ClarkPlayer'],
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: `${SITE_URL}/settings`,
  },
}

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
