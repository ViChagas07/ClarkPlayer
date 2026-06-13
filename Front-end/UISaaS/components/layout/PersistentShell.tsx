'use client'

import { usePathname } from 'next/navigation'
import { AppShell } from './AppShell'

/** Auth pages get no shell; everything else shares the same AppShell instance */
const AUTH_PREFIXES = ['/login', '/forgot-password', '/reset-password', '/verify-email', '/auth/callback']

export function PersistentShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Auth pages render standalone (no player bar, no sidebar)
  if (AUTH_PREFIXES.some((p) => pathname.startsWith(p))) {
    return <>{children}</>
  }

  // All app pages share the same persistent AppShell
  return <AppShell>{children}</AppShell>
}
