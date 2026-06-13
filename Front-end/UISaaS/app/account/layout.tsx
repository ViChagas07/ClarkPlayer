import type { Metadata } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://clark-player.vercel.app'

export const metadata: Metadata = {
  title: 'My Account',
  description: 'Manage your ClarkPlayer account. Update profile, avatar, linked accounts, and account settings.',
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: `${SITE_URL}/account`,
  },
}

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
