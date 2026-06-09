import type { Metadata, Viewport } from 'next'
import { Suspense } from 'react'
import { Bebas_Neue, Barlow, Barlow_Condensed } from 'next/font/google'
import './globals.css'
import { ToastProvider } from '@/components/ui/Toast'
import { AuthProvider } from '@/components/auth/AuthProvider'
import { AuthModalWrapper } from '@/components/auth/AuthModalWrapper'
import { SleepTimerRestore } from '@/components/SleepTimerRestore'
import { ThemeRestore } from '@/components/ThemeRestore'

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const barlow = Barlow({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

const barlowCondensed = Barlow_Condensed({
  weight: ['600'],
  subsets: ['latin'],
  variable: '--font-condensed',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'ClarkPlayer',
    template: '%s — ClarkPlayer',
  },
  description: 'Your personal Fortress of Sound. Upload, organize, and stream your music collection with heroic style.',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#005BAD',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning className={`${bebasNeue.variable} ${barlow.variable} ${barlowCondensed.variable}`}>
      <body className="antialiased font-body">
        <ToastProvider>
          <AuthProvider>
            <ThemeRestore />
            <SleepTimerRestore />
            <Suspense>
              <AuthModalWrapper />
            </Suspense>
            {children}
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  )
}