import type { Metadata, Viewport } from 'next'
import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { Bebas_Neue, Barlow, Barlow_Condensed } from 'next/font/google'
import './globals.css'
import { ToastProvider } from '@/components/ui/Toast'
import { AuthProvider } from '@/components/auth/AuthProvider'
import { AuthModalWrapper } from '@/components/auth/AuthModalWrapper'
import { SleepTimerRestore } from '@/components/SleepTimerRestore'
import { ThemeRestore } from '@/components/ThemeRestore'
import { PersistentShell } from '@/components/layout/PersistentShell'
import { QueryProvider } from '@/components/providers/QueryProvider'
import { WebSiteStructuredData } from '@/components/seo/WebSite'
import { OrganizationStructuredData } from '@/components/seo/Organization'

const ReactQueryDevtoolsProduction = dynamic(() =>
  import('@tanstack/react-query-devtools').then((mod) => ({
    default: mod.ReactQueryDevtools,
  }))
)

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://clark-player.vercel.app'

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  preload: true,
})

const barlow = Barlow({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
  preload: true,
})

const barlowCondensed = Barlow_Condensed({
  weight: ['600'],
  subsets: ['latin'],
  variable: '--font-condensed',
  display: 'swap',
  preload: true,
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'ClarkPlayer — Your Personal Fortress of Sound',
    template: '%s — ClarkPlayer',
  },
  description:
    'Your personal Fortress of Sound. Upload, organize, and stream your music collection with heroic style. Discover artists, albums, and tracks powered by Superman-grade performance.',
  keywords: [
    'music player',
    'music streaming',
    'music library',
    'ClarkPlayer',
    'audio player',
    'music collection',
    'discover music',
    'upload music',
    'organize music',
    'stream music',
  ],
  authors: [{ name: 'ClarkPlayer' }],
  creator: 'ClarkPlayer',
  publisher: 'ClarkPlayer',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'ClarkPlayer',
    title: 'ClarkPlayer — Your Personal Fortress of Sound',
    description:
      'Your personal Fortress of Sound. Upload, organize, and stream your music collection with heroic style.',
    url: SITE_URL,
    images: [
      {
        url: '/ClarkPlayer_Transparent.png',
        width: 512,
        height: 512,
        alt: 'ClarkPlayer Logo',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary',
    site: '@ClarkPlayer',
    creator: '@ClarkPlayer',
    title: 'ClarkPlayer — Your Personal Fortress of Sound',
    description:
      'Your personal Fortress of Sound. Upload, organize, and stream your music collection with heroic style.',
    images: ['/ClarkPlayer_Transparent.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  icons: {
    icon: '/ClarkPlayer_Favicon.png',
    shortcut: '/ClarkPlayer_Favicon.png',
    apple: '/ClarkPlayer_Favicon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'ClarkPlayer',
  },
  manifest: '/manifest.json',
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'theme-color': '#0A1628',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0A1628' },
    { media: '(prefers-color-scheme: light)', color: '#EEF2FF' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning className={`${bebasNeue.variable} ${barlow.variable} ${barlowCondensed.variable}`}>
      <body className="antialiased font-body">
        <noscript>
          <div style={{ padding: '1rem', background: '#E02020', color: 'white', textAlign: 'center' }}>
            ClarkPlayer requires JavaScript to play music and manage your library. Please enable JavaScript in your browser settings.
          </div>
        </noscript>
        {/* Skip to main content — accessibility for keyboard users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-clark-gold focus:text-black focus:rounded-lg focus:font-semibold focus:outline-none focus:ring-2 focus:ring-clark-gold/50"
        >
          Skip to main content
        </a>
        <WebSiteStructuredData />
        <OrganizationStructuredData />
        <QueryProvider>
          <ToastProvider>
            <AuthProvider>
              <ThemeRestore />
              <SleepTimerRestore />
              <Suspense>
                <AuthModalWrapper />
              </Suspense>
              <PersistentShell>{children}</PersistentShell>
            </AuthProvider>
          </ToastProvider>
          <ReactQueryDevtoolsProduction initialIsOpen={false} />
        </QueryProvider>
      </body>
    </html>
  )
}