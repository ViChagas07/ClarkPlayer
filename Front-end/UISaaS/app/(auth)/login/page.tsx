'use client'

import { Suspense, useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, AlertCircle, Lock, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { useTranslation } from '@/hooks/useTranslation'
import Image from 'next/image'
import ClarkLogo from '@/public/ClarkPlayer_White.png'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type LoginForm = z.infer<typeof loginSchema>

interface LoginAttemptState {
  count: number
  lockedUntil: number | null
}

const MAX_ATTEMPTS = 5
const LOCKOUT_DURATION_MINUTES = 30
const LOCKOUT_DURATION_MS = LOCKOUT_DURATION_MINUTES * 60 * 1000
const STORAGE_KEY = 'clark_login_attempts'

function getGoogleAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '',
    redirect_uri: process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI ?? '',
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

function getRemainingLockoutTime(lockedUntil: number | null): number {
  if (!lockedUntil) return 0
  const remaining = lockedUntil - Date.now()
  return remaining > 0 ? Math.ceil(remaining / 1000) : 0
}

function formatCountdown(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function LoginFormInner() {
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlError = searchParams.get('error')
  const showRegistered = searchParams.get('registered') === '1'

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [attemptState, setAttemptState] = useState<LoginAttemptState>({ count: 0, lockedUntil: null })
  const [countdown, setCountdown] = useState(0)
  const setSession = useAuthStore((state) => state.setSession)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed: LoginAttemptState = JSON.parse(stored)
        if (parsed.lockedUntil && parsed.lockedUntil <= Date.now()) {
          setAttemptState({ count: 0, lockedUntil: null })
          localStorage.removeItem(STORAGE_KEY)
        } else {
          setAttemptState(parsed)
        }
      }
    }
  }, [])

  useEffect(() => {
    if (urlError) {
      if (urlError === 'access_denied') setError(t('accessDeniedGoogle'))
      else if (urlError === 'auth_failed') setError(t('authFailedGoogle'))
      else setError(t('authFailed'))
    }
  }, [urlError, t])

  useEffect(() => {
    if (!attemptState.lockedUntil) { setCountdown(0); return }
    const updateCountdown = () => {
      const remaining = getRemainingLockoutTime(attemptState.lockedUntil)
      if (remaining <= 0) {
        setCountdown(0)
        setAttemptState({ count: 0, lockedUntil: null })
        localStorage.removeItem(STORAGE_KEY)
      } else {
        setCountdown(remaining)
      }
    }
    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [attemptState.lockedUntil])

  const saveAttemptState = useCallback((state: LoginAttemptState) => {
    setAttemptState(state)
    if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [])

  const handleFailedAttempt = useCallback(() => {
    const newCount = attemptState.count + 1
    const remainingAttempts = MAX_ATTEMPTS - newCount
    if (newCount >= MAX_ATTEMPTS) {
      const lockedUntil = Date.now() + LOCKOUT_DURATION_MS
      saveAttemptState({ count: newCount, lockedUntil })
      setError(`${t('tooManyAttempts')} ${LOCKOUT_DURATION_MINUTES} ${t('min')}.`)
    } else {
      saveAttemptState({ count: newCount, lockedUntil: null })
      setError(`${t('wrongCredentials')} (${remainingAttempts} ${t('attemptsRemaining')})`)
    }
  }, [attemptState.count, saveAttemptState, t])

  const resetAttempts = useCallback(() => {
    saveAttemptState({ count: 0, lockedUntil: null })
    localStorage.removeItem(STORAGE_KEY)
  }, [saveAttemptState])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  async function onSubmit(data: LoginForm) {
    if (attemptState.lockedUntil && attemptState.lockedUntil > Date.now()) {
      const remainingMins = Math.ceil((attemptState.lockedUntil - Date.now()) / 60000)
      setError(`${t('tooManyAttempts')} ${remainingMins} ${t('min')}.`)
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const tokens = await api.login(data)
      const user = await api.me(tokens.access_token)
      setSession(tokens.access_token, tokens.refresh_token, user)
      resetAttempts()
      router.push('/')
      router.refresh()
    } catch {
      handleFailedAttempt()
    } finally {
      setIsLoading(false)
    }
  }

  function handleGoogleLogin() {
    window.location.href = getGoogleAuthUrl()
  }

  const isLockedOut = attemptState.lockedUntil !== null && attemptState.lockedUntil > Date.now()
  const remainingAttempts = Math.max(0, MAX_ATTEMPTS - attemptState.count)

  return (
    <>
      {/* ════════════════════════════════════════════════════════════════
          LEFT PANEL — Branding (50% width on lg+, full width on mobile)
          ════════════════════════════════════════════════════════════════ */}
      <section
        className="
          relative overflow-hidden
          flex items-center justify-center
          min-h-[40vh] lg:min-h-0
          bg-gradient-to-br from-clark-shadow via-clark-bg-secondary to-clark-bg-card
        "
      >
        {/* Aurora borealis effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 animate-aurora aurora-gradient opacity-80" />
          <div className="absolute top-0 left-0 right-0 h-1/2 animate-aurora-drift aurora-gradient-soft" />
          <div className="absolute bottom-0 left-0 right-0 h-1/2 animate-aurora-drift aurora-gradient-mid" />
        </div>

        {/* Floating shapes */}
        <div className="absolute inset-0">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 animate-float pointer-events-none"
              style={{
                width: `${120 + i * 40}px`,
                height: `${120 + i * 40}px`,
                top: `${10 + i * 12}%`,
                left: `${5 + i * 15}%`,
                transform: `rotate(${i * 15}deg)`,
                animationDelay: `${i * 0.8}s`,
                animationDuration: `${5 + i * 0.5}s`,
              }}
            />
          ))}
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-clark-shadow/80 to-transparent pointer-events-none" />

        {/* Branding content */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full px-8 py-12 lg:py-0">
          {/* Logo */}
          <div className="w-24 h-24 lg:w-28 lg:h-28 rounded-2xl bg-clark-bg-card flex items-center justify-center mb-6 shadow-glow-gold ring-2 ring-clark-gold/60 overflow-hidden">
            <Image src={ClarkLogo} alt="ClarkPlayer" className="w-full h-full object-contain p-1" width={112} height={112} priority />
          </div>

          {/* Wordmark */}
          <h1 className="font-display text-4xl lg:text-5xl tracking-widest uppercase text-clark-text-primary mb-3 text-center">
            ClarkPlayer
          </h1>
          <p className="font-body italic text-clark-text-muted text-base lg:text-lg text-center">
            {t('clarkTagline')}
          </p>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          RIGHT PANEL — Authentication Form (50% on lg+, full on mobile)
          ════════════════════════════════════════════════════════════════ */}
      <section className="flex items-center justify-center px-6 py-12 lg:py-0">
        <div className="w-full max-w-md">
          {/* Mobile-only branding header */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-clark-bg-card flex items-center justify-center overflow-hidden">
              <Image src={ClarkLogo} alt="ClarkPlayer" className="w-full h-full object-contain p-0.5" width={40} height={40} />
            </div>
            <span className="font-display text-xl tracking-wider">ClarkPlayer</span>
          </div>

          {/* Headings */}
          <h2 className="font-display text-2xl sm:text-3xl tracking-widest uppercase mb-2">
            {t('welcomeBack')}
          </h2>
          <p className="font-body text-clark-text-muted mb-8">
            {t('signInToContinue')}
          </p>

          {/* Lockout warning */}
          {isLockedOut && (
            <div className="mb-6 p-4 rounded-lg bg-clark-accent/10 border border-clark-accent/20">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-clark-danger flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-body font-semibold text-clark-danger mb-1">{t('accountLocked')}</h3>
                  <p className="font-body text-sm text-clark-danger/80">
                    {t('tooManyAttempts')}{' '}
                    <span className="font-mono font-bold">{formatCountdown(countdown)}</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Attempt warning */}
          {!isLockedOut && attemptState.count > 0 && (
            <div className="mb-6 p-3 rounded-lg bg-clark-gold/10 border border-clark-gold/20">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-clark-gold" />
                <span className="font-body text-sm text-clark-gold">
                  {remainingAttempts} {t('attemptsRemaining')}
                </span>
              </div>
            </div>
          )}

          {/* Error banner */}
          {error && !isLockedOut && (
            <div className="mb-6 p-3 rounded-lg bg-clark-danger/10 border border-clark-danger/20 font-body text-sm text-clark-danger" role="alert">
              {error}
            </div>
          )}

          {/* Registration success banner */}
          {showRegistered && (
            <div className="mb-6 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 font-body text-sm text-emerald-400" role="status">
              {t('accountCreatedBanner')}
            </div>
          )}

          {/* Social buttons */}
          <div className="space-y-3 mb-6">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading || isLockedOut}
              className="w-full h-12 flex items-center justify-center gap-3 border border-clark-steel rounded-lg bg-transparent font-body font-medium text-clark-text-primary hover:bg-clark-bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              {t('continueWithGoogle')}
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-clark-steel/40" />
            <span className="font-body text-sm text-clark-text-muted">{t('orDivider')}</span>
            <div className="flex-1 h-px bg-clark-steel/40" />
          </div>

          {/* Email form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div>
              <label htmlFor="email" className="block font-body font-medium text-sm mb-1.5">
                {t('emailLabel')}
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                disabled={isLoading || isLockedOut}
                className={cn(
                  'w-full h-12 px-4 rounded-lg bg-clark-bg-secondary text-clark-text-primary border transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-clark-gold focus:border-transparent',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  errors.email ? 'border-clark-danger' : 'border-clark-steel/40',
                )}
                {...register('email')}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              {errors.email && (
                <p id="email-error" className="mt-1 font-body text-sm text-clark-danger" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block font-body font-medium text-sm mb-1.5">
                {t('passwordLabel')}
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                disabled={isLoading || isLockedOut}
                className={cn(
                  'w-full h-12 px-4 rounded-lg bg-clark-bg-secondary text-clark-text-primary border transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-clark-gold focus:border-transparent',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  errors.password ? 'border-clark-danger' : 'border-clark-steel/40',
                )}
                {...register('password')}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'password-error' : undefined}
              />
              {errors.password && (
                <p id="password-error" className="mt-1 font-body text-sm text-clark-danger" role="alert">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex justify-end">
              <a href="/forgot-password" className="font-body text-sm text-clark-sky hover:text-clark-sky/80 transition-colors">
                {t('forgotPassword')}
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading || isLockedOut}
              className="w-full h-12 bg-clark-accent hover:bg-clark-accent-hover disabled:opacity-60 font-body font-semibold text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t('signingIn')}
                </>
              ) : isLockedOut ? (
                <>
                  <Lock className="w-5 h-5" />
                  {t('lockedLabel')} ({formatCountdown(countdown)})
                </>
              ) : (
                t('signIn')
              )}
            </button>
          </form>

          <p className="mt-6 text-center font-body text-sm text-clark-text-muted">
            {t('noAccount')}{' '}
            <a href="/register" className="text-clark-gold hover:text-clark-gold-hover font-medium transition-colors">
              {t('signUp')}
            </a>
          </p>
        </div>
      </section>
    </>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const { t } = useTranslation()

  return (
    <div className="min-h-dvh bg-clark-bg-primary grid grid-cols-1 lg:grid-cols-2 relative">
      {/* Close button — returns user to home page */}
      <button
        type="button"
        onClick={() => router.push('/')}
        aria-label={t('closeLoginPage')}
        className={cn(
          'absolute top-5 left-5 z-50',
          'w-12 h-12 rounded-full',
          'flex items-center justify-center',
          'bg-white text-black',
          'shadow-lg shadow-black/30',
          'hover:bg-gray-100 hover:scale-105',
          'focus:outline-none focus:ring-2 focus:ring-clark-gold focus:ring-offset-2 focus:ring-offset-clark-bg-primary',
          'transition-all duration-200',
        )}
      >
        <X className="w-6 h-6" strokeWidth={2.5} />
      </button>

      <Suspense>
        <LoginFormInner />
      </Suspense>
    </div>
  )
}
