'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'

/**
 * Client-side auth guard.
 *
 * Wraps content and ensures the auth state has been checked before rendering.
 * Content is always shown regardless of authentication status — users can browse
 * freely. Authentication is only required when explicitly choosing to sign in
 * via the "Login account" button in the AppShell.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [isChecking, setIsChecking] = useState(true)
  useAuthStore() // subscribe to store so persisted auth state hydrates

  useEffect(() => {
    // Brief check to allow persisted auth state to hydrate
    const timer = setTimeout(() => {
      setIsChecking(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [])

  // Show loading state while checking
  if (isChecking) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-surface-400 text-sm">Loading…</p>
        </div>
      </div>
    )
  }

  // Render children freely — no auth overlay or blur for unauthenticated users
  return <>{children}</>
}
