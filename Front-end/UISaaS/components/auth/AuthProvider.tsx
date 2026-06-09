'use client'

import { createContext, useContext, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'

import type { UserResponse } from '@/types'

interface AuthContextValue {
  user: UserResponse | null
  isAuthenticated: boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, isAuthenticated, clearSession, accessToken } = useAuthStore()
  const initialized = useRef(false)

  // On mount, validate the stored token by fetching /me
  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    if (!accessToken) {
      // No token — user is unauthenticated, but we do NOT auto-show the auth modal.
      // The modal only opens when the user clicks the "Login account" button.
      return
    }

    // Validate token with backend
    api.me(accessToken)
      .then((fetchedUser) => {
        // Token is valid — user data is already in store from persist
        // Just ensure it's fresh
        useAuthStore.getState().updateUser(fetchedUser)
      })
      .catch(() => {
        // Token is invalid or expired — clear session (no auto-modal)
        clearSession()
        router.push('/')
      })
  }, [accessToken, clearSession, router])

  const logout = async () => {
    // Get the current refresh token before clearing session
    const { refreshToken, accessToken } = useAuthStore.getState()

    // Try to notify backend about logout (invalidate refresh token)
    // We do this before clearing the session so we have the token
    if (refreshToken) {
      try {
        await api.logout({ refresh_token: refreshToken }, accessToken || undefined)
      } catch {
        // Even if the backend call fails, we still want to clear the session
        // This ensures the user is logged out locally regardless of network issues
      }
    }

    // Clear the local session
    clearSession()
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
