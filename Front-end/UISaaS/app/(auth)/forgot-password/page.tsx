'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, Loader2, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'
import { useTranslation } from '@/hooks/useTranslation'

export default function ForgotPasswordPage() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    try {
      await api.forgotPassword(email)
      setIsSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-clark-bg-primary flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-clark-bg-card flex items-center justify-center overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="ClarkPlayer" className="w-full h-full object-contain p-0.5" />
          </div>
          <span className="font-display text-xl tracking-wider">ClarkPlayer</span>
        </div>

        {isSubmitted ? (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-clark-accent/10 flex items-center justify-center">
              <Mail className="w-8 h-8 text-clark-accent" />
            </div>
            <h2 className="font-display text-3xl tracking-widest uppercase mb-3">{t('checkInbox')}</h2>
            <p className="font-body text-clark-text-muted mb-8">
              {t('resetLinkSent')} <strong className="font-body font-medium text-clark-text-primary">{email}</strong>.
              {' '}{t('clickLinkToReset')}
            </p>
            <Link href="/login" className="inline-flex items-center gap-2 font-body font-medium text-clark-sky hover:text-clark-sky/80 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              {t('backToLogin')}
            </Link>
          </div>
        ) : (
          <>
            <h2 className="font-display text-3xl tracking-widest uppercase mb-2">{t('forgotPasswordTitle')}</h2>
            <p className="font-body text-clark-text-muted mb-8">
              {t('forgotPasswordDesc')}
            </p>

            {error && (
              <div className="mb-6 p-3 rounded-lg bg-clark-danger/10 border border-clark-danger/20 font-body text-sm text-clark-danger" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="reset-email" className="block font-body font-medium text-sm mb-1.5">{t('emailLabel')}</label>
                <input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full h-12 px-4 rounded-lg bg-clark-bg-secondary text-clark-text-primary border border-clark-steel/40 focus:outline-none focus:ring-2 focus:ring-clark-gold focus:border-transparent transition-colors"
                  placeholder="you@example.com"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !email}
                className="w-full h-12 bg-clark-accent hover:bg-clark-accent-hover disabled:opacity-60 font-body font-semibold text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('sending')}
                  </>
                ) : (
                  t('sendResetLink')
                )}
              </button>
            </form>

            <p className="mt-6 text-center font-body text-sm text-clark-text-muted">
              <Link href="/login" className="text-clark-gold hover:text-clark-gold-hover font-medium transition-colors">
                {t('backToLogin')}
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
