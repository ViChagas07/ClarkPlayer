'use client'

import { Suspense, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'
import { useTranslation } from '@/hooks/useTranslation'

function GoogleCallbackHandler() {
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const hasProcessed = useRef(false)

  useEffect(() => {
    if (hasProcessed.current) return
    hasProcessed.current = true

    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
      router.push(`/login?error=${encodeURIComponent(error)}`)
      return
    }

    if (!code) {
      router.push('/login?error=missing_code')
      return
    }

    const redirectUri = `${window.location.origin}/auth/callback`

    api.googleCallback({
      code,
      redirect_uri: redirectUri,
    })
      .then((response) => {
        useAuthStore.getState().setSession(
          response.access_token,
          response.refresh_token,
          response.user,
        )
        router.replace('/')
      })
      .catch((err) => {
        const detail = err instanceof Error ? err.message : String(err)
        console.error('[ClarkPlayer] Google callback failed:', detail)
        // If it looks like a network error, suggest checking the backend
        const isNetworkError = detail.includes('Network error') || detail.includes('Failed to fetch')
        const hint = isNetworkError ? ' (Backend may be sleeping — Render cold start)' : ''
        router.push(
          `/login?error=auth_failed&detail=${encodeURIComponent(detail + hint)}`,
        )
      })
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-clark-bg-primary flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block w-10 h-10 border-4 border-clark-accent border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-clark-text-muted text-lg">{t('signingInGoogle')}</p>
      </div>
    </div>
  )
}

export default function GoogleCallbackPage() {
  return (
    <Suspense>
      <GoogleCallbackHandler />
    </Suspense>
  )
}
