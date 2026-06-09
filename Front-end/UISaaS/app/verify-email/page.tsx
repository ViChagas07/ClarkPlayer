/**
 * Email verification page — /verify-email?token=...
 * Consumes the one-time token from the verification email.
 */

'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { api } from '@/lib/api'
import { useTranslation } from '@/hooks/useTranslation'

function VerifyEmailContent() {
  const { t } = useTranslation()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage(t('verificationTokenMissing'))
      return
    }

    async function verify() {
      if (!token) return
      try {
        await api.verifyEmail(token)
        setStatus('success')
        setMessage(t('emailVerifiedMessage'))
      } catch (err) {
        setStatus('error')
        setMessage(
          err instanceof Error
            ? err.message
            : t('verificationFailedMessage'),
        )
      }
    }

    verify()
  }, [token, t])

  const isSuccess = status === 'success'

  return (
    <div className="min-h-screen bg-clark-bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-clark-bg-secondary rounded-2xl p-8 text-center shadow-xl">
        {/* Icon */}
        <div
          className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full ${
            isSuccess ? 'bg-emerald-500/20' : 'bg-clark-danger/20'
          }`}
        >
          {status === 'loading' ? (
            <Loader2 className="h-8 w-8 animate-spin text-clark-accent" />
          ) : isSuccess ? (
            <CheckCircle className="h-8 w-8 text-emerald-400" />
          ) : (
            <XCircle className="h-8 w-8 text-clark-danger" />
          )}
        </div>

        {/* Heading */}
        <h1 className={`font-display text-4xl tracking-widest uppercase mb-2 ${
          isSuccess ? 'text-clark-gold' : 'text-clark-danger'
        }`}>
          {status === 'loading'
            ? t('verifying')
            : isSuccess
            ? t('emailVerified')
            : t('verificationFailed')}
        </h1>

        {/* Message */}
        <p className="font-body text-clark-text-muted mb-8">{message}</p>

        {/* Action */}
        {isSuccess && (
          <a
            href="/"
            className="inline-block w-full py-3 px-6 bg-clark-accent hover:bg-clark-accent-hover font-body font-semibold text-white rounded-lg transition-colors"
          >
            {t('goToSignIn')}
          </a>
        )}
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-clark-bg-primary flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-clark-bg-secondary rounded-2xl p-8 text-center shadow-xl">
          <Loader2 className="h-8 w-8 animate-spin text-clark-accent mx-auto" />
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}
