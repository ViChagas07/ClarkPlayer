import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Build the Google OAuth 2.0 authorization URL.
 *
 * Uses `window.location.origin` so the redirect always goes back to the
 * same origin the user is on — works correctly in local dev, Vercel
 * previews, and production with zero environment-variable configuration.
 *
 * Falls back to `NEXT_PUBLIC_GOOGLE_REDIRECT_URI` only when explicitly set
 * (e.g. for custom callback domains).
 */
export function getGoogleAuthUrl(): string {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ''

  // Prefer the window origin so the redirect always lands on the correct
  // deployment.  If for some reason this runs on the server (it shouldn't)
  // we fall back to the env variable or an empty string.
  const redirectUri =
    (typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined) ??
    process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI ??
    ''

  if (!clientId) {
    console.error('[ClarkPlayer] NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set — Google OAuth will fail.')
  }
  if (!redirectUri) {
    console.error('[ClarkPlayer] Google redirect URI is empty — auth will fail.')
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
  })

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}
