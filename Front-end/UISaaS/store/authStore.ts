/**
 * Authentication state store — manages session tokens and user info.
 *
 * Persisted to `localStorage` so the user stays logged in across page reloads.
 * Tokens are stored under the `clark_auth` key.
 *
 * A companion `auth_token` cookie is also set so that the Next.js edge
 * middleware can detect authenticated users (middleware cannot read localStorage).
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserResponse } from '@/types'

/** Set a short-lived cookie so the edge middleware can detect auth state */
function setAuthCookie(token: string | null) {
  if (typeof document === 'undefined') return
  if (token) {
    document.cookie = `auth_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
  } else {
    document.cookie = 'auth_token=; path=/; max-age=0; SameSite=Lax'
  }
}

/** Zustand store interface for authentication state, which means it defines the structure of the authentication state */
interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  user: UserResponse | null
  isAuthenticated: boolean
  showAuthModal: boolean

  // Actions
  setSession: (accessToken: string, refreshToken: string | undefined, user: UserResponse) => void
  clearSession: () => void
  updateUser: (user: UserResponse) => void
  setShowAuthModal: (v: boolean) => void
}

/** Create the authentication store using Zustand with persistence even if the page reloads */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      showAuthModal: false,

      setSession: (accessToken, refreshToken, user) => {
        setAuthCookie(accessToken)
        set({
          accessToken,
          refreshToken: refreshToken ?? null,
          user,
          isAuthenticated: true,
        })
      },

      clearSession: () => {
        setAuthCookie(null)
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
        })
      },

      updateUser: (user) => set({ user }),

      setShowAuthModal: (showAuthModal) => set({ showAuthModal }),
    }),
    {
      name: 'clark_auth',
      // Only persist tokens and user — not the derived flag
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)
