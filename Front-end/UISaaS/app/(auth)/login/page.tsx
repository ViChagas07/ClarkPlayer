'use client'

import Link from 'next/link'
import { Suspense, useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, AlertCircle, Lock, X, Check } from 'lucide-react'
import { cn, getGoogleAuthUrl } from '@/lib/utils'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { useTranslation } from '@/hooks/useTranslation'
import Image from 'next/image'
import ClarkLogo from '@/public/ClarkPlayer_Transparent.png'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

const registerSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  agreeTerms: z.boolean().refine((v) => v === true, { message: 'You must agree to the terms' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type LoginForm = z.infer<typeof loginSchema>
type RegisterForm = z.infer<typeof registerSchema>

interface LoginAttemptState {
  count: number
  lockedUntil: number | null
}

const MAX_ATTEMPTS = 5
const LOCKOUT_DURATION_MINUTES = 30
const LOCKOUT_DURATION_MS = LOCKOUT_DURATION_MINUTES * 60 * 1000
const STORAGE_KEY = 'clark_login_attempts'

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

function getPasswordStrength(password: string): { level: number; label: string; color: string } {
  if (password.length === 0) return { level: 0, label: '', color: '' }
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score <= 2) return { level: 1, label: 'weak', color: 'bg-clark-danger' }
  if (score <= 3) return { level: 2, label: 'fair', color: 'bg-clark-gold' }
  return { level: 3, label: 'strong', color: 'bg-emerald-500' }
}

function AuthFormInner() {
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlError = searchParams.get('error')
  const showRegistered = searchParams.get('registered') === '1'

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [attemptState, setAttemptState] = useState<LoginAttemptState>({ count: 0, lockedUntil: null })
  const [countdown, setCountdown] = useState(0)
  const [registerSuccess, setRegisterSuccess] = useState(false)
  const [agreeConsent, setAgreeConsent] = useState(false)
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
      else if (urlError === 'auth_failed') {
        const detail = searchParams.get('detail')
        setError(detail ? `${t('authFailedGoogle')} (${detail})` : t('authFailedGoogle'))
      }
      else setError(t('authFailed'))
    }
  }, [urlError, t, searchParams])

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

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const registerFormHook = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', email: '', password: '', confirmPassword: '', agreeTerms: false },
  })

  const password = registerFormHook.watch('password') || ''
  const strength = getPasswordStrength(password)
  const strengthLabel = strength.label === 'weak' ? t('weak') : strength.label === 'fair' ? t('fair') : t('strong')

  async function onLoginSubmit(data: LoginForm) {
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

  async function onRegisterSubmit(data: RegisterForm) {
    setIsLoading(true)
    setError(null)
    try {
      const username = data.email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 50)
      await api.register({
        username,
        email: data.email,
        password: data.password,
        display_name: data.fullName,
      })
      // Auto-login after successful registration
      const tokens = await api.login({ email: data.email, password: data.password })
      const user = await api.me(tokens.access_token)
      setSession(tokens.access_token, tokens.refresh_token, user)
      resetAttempts()
      setRegisterSuccess(true)
      setTimeout(() => { router.push('/'); router.refresh() }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  function handleGoogleLogin() {
    window.location.href = getGoogleAuthUrl()
  }

  const isLockedOut = attemptState.lockedUntil !== null && attemptState.lockedUntil > Date.now()
  const remainingAttempts = Math.max(0, MAX_ATTEMPTS - attemptState.count)

  // ── Register success state ───────────────────────────────────────────
  if (registerSuccess) {
    return (
      <>
        {/* LEFT PANEL — Branding */}
        <section
          className="
            relative overflow-hidden
            flex items-center justify-center
            min-h-[40vh] lg:min-h-0
            bg-gradient-to-br from-clark-shadow via-clark-bg-secondary to-clark-bg-card
          "
        >
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-0 animate-aurora aurora-gradient opacity-80" />
            <div className="absolute top-0 left-0 right-0 h-1/2 animate-aurora-drift aurora-gradient-soft" />
            <div className="absolute bottom-0 left-0 right-0 h-1/2 animate-aurora-drift aurora-gradient-mid" />
          </div>
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
          <div className="absolute inset-0 bg-gradient-to-t from-clark-shadow/80 to-transparent pointer-events-none" />
          <div className="relative z-10 flex flex-col items-center justify-center w-full px-8 py-12 lg:py-0">
            <div className="flex items-center justify-center mb-6">
              <Image src={ClarkLogo} alt="ClarkPlayer" className="w-28 h-28 lg:w-32 lg:h-32 object-contain drop-shadow-[0_0_20px_rgba(245,197,24,0.3)] animate-logo-float" width={128} height={128} priority />
            </div>
            <h1 className="font-display text-4xl lg:text-5xl tracking-widest uppercase text-clark-text-primary mb-3 text-center">
              Clark<span className="text-clark-accent">Player</span>
            </h1>
            <p className="font-body italic text-clark-text-muted text-base lg:text-lg text-center">
              {t('clarkTagline')}
            </p>
          </div>
        </section>

        {/* RIGHT PANEL — Success */}
      <section className="flex items-center justify-center px-6 py-12 lg:py-8">
          <div className="w-full max-w-md text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="font-display text-2xl tracking-widest uppercase mb-3">{t('accountCreated')}</h2>
            <p className="font-body text-clark-text-muted">{t('redirectingSignIn')}</p>
          </div>
        </section>
      </>
    )
  }

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
          <div className="flex items-center justify-center mb-6">
            <Image src={ClarkLogo} alt="ClarkPlayer" className="w-28 h-28 lg:w-32 lg:h-32 object-contain drop-shadow-[0_0_20px_rgba(245,197,24,0.3)] animate-logo-float" width={128} height={128} priority />
          </div>

          {/* Wordmark */}
          <h1 className="font-display text-4xl lg:text-5xl tracking-widest uppercase text-clark-text-primary mb-3 text-center">
            Clark<span className="text-clark-accent">Player</span>
          </h1>
          <p className="font-body italic text-clark-text-muted text-base lg:text-lg text-center">
            {t('clarkTagline')}
          </p>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          RIGHT PANEL — Authentication Form (50% on lg+, full on mobile)
          ════════════════════════════════════════════════════════════════ */}
      <section className="flex justify-center px-6 py-12 lg:py-8">
        <div className="w-full max-w-md my-auto">
          {/* Mobile-only branding header */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-clark-bg-card flex items-center justify-center animate-logo-float">
              <Image src={ClarkLogo} alt="ClarkPlayer" className="w-full h-full object-contain p-0.5" width={40} height={40} />
            </div>
            <span className="font-display text-xl tracking-wider">Clark<span className="text-clark-accent">Player</span></span>
          </div>

          {/* ── Tab Switcher: Sign In | Sign Up ────────────────────── */}
          <div className="flex gap-1 p-1 bg-clark-bg-secondary rounded-lg mb-8 ring-1 ring-clark-steel/30">
            <button
              type="button"
              onClick={() => { setActiveTab('login'); setError(null) }}
              className={cn(
                'flex-1 py-2.5 px-4 rounded-md text-sm font-semibold transition-all duration-200',
                activeTab === 'login'
                  ? 'bg-clark-accent text-white shadow-lg shadow-clark-accent/25'
                  : 'text-clark-text-muted hover:text-clark-text-primary hover:bg-clark-steel/20',
              )}
            >
              {t('signIn')}
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('register'); setError(null) }}
              className={cn(
                'flex-1 py-2.5 px-4 rounded-md text-sm font-semibold transition-all duration-200',
                activeTab === 'register'
                  ? 'bg-clark-accent text-white shadow-lg shadow-clark-accent/25'
                  : 'text-clark-text-muted hover:text-clark-text-primary hover:bg-clark-steel/20',
              )}
            >
              {t('signUp')}
            </button>
          </div>

          {/* ── Headings (contextual per tab) ──────────────────────── */}
          {activeTab === 'login' ? (
            <>
              <h2 className="font-display text-2xl sm:text-3xl tracking-widest uppercase mb-2">
                {t('welcomeBack')}
              </h2>
              <p className="font-body text-clark-text-muted mb-8">
                {t('signInToContinue')}
              </p>
            </>
          ) : (
            <>
              <h2 className="font-display text-2xl sm:text-3xl tracking-widest uppercase mb-2">
                {t('createYourAccount')}
              </h2>
              <p className="font-body text-clark-text-muted mb-8">
                {t('joinClarkPlayer')}
              </p>
            </>
          )}

          {/* Lockout warning (login tab only) */}
          {activeTab === 'login' && isLockedOut && (
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

          {/* Attempt warning (login tab only) */}
          {activeTab === 'login' && !isLockedOut && attemptState.count > 0 && (
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
          {error && (activeTab === 'login' ? !isLockedOut : true) && (
            <div className="mb-6 p-3 rounded-lg bg-clark-danger/10 border border-clark-danger/20 font-body text-sm text-clark-danger" role="alert">
              {error}
            </div>
          )}

          {/* Registration success banner (from external redirects) */}
          {activeTab === 'login' && showRegistered && (
            <div className="mb-6 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 font-body text-sm text-emerald-400" role="status">
              {t('accountCreatedBanner')}
            </div>
          )}

          {/* ── Consent checkbox (login tab) ─────────────────── */}
          {activeTab === 'login' && (
            <div className="flex items-start gap-3 mb-4">
              <input
                id="login-agreeConsent"
                type="checkbox"
                checked={agreeConsent}
                onChange={(e) => setAgreeConsent(e.target.checked)}
                disabled={isLoading || isLockedOut}
                className="mt-1 w-4 h-4 rounded border-clark-steel/40 bg-clark-bg-secondary text-clark-accent focus:ring-clark-accent"
              />
              <label htmlFor="login-agreeConsent" className="font-body text-sm text-clark-text-muted">
                I have read the{' '}
                <Link href="/privacy-policy#terms" target="_blank" className="text-clark-gold hover:underline">Terms of Use</Link>
                {' '}and{' '}
                <Link href="/privacy-policy" target="_blank" className="text-clark-gold hover:underline">Privacy Policy</Link>
                {' '}and agree to them.
              </label>
            </div>
          )}

          {/* ── Social / Google button (both tabs) ─────────────────── */}
          {activeTab === 'login' && (
            <div className="space-y-3 mb-6">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading || isLockedOut || !agreeConsent}
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
          )}

          {/* Divider (login tab only) */}
          {activeTab === 'login' && (
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-clark-steel/40" />
              <span className="font-body text-sm text-clark-text-muted">{t('orDivider')}</span>
              <div className="flex-1 h-px bg-clark-steel/40" />
            </div>
          )}

          {/* ── LOGIN FORM ─────────────────────────────────────────── */}
          {activeTab === 'login' && (
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4" noValidate>
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
                    loginForm.formState.errors.email ? 'border-clark-danger' : 'border-clark-steel/40',
                  )}
                  {...loginForm.register('email')}
                  aria-invalid={!!loginForm.formState.errors.email}
                  aria-describedby={loginForm.formState.errors.email ? 'email-error' : undefined}
                />
                {loginForm.formState.errors.email && (
                  <p id="email-error" className="mt-1 font-body text-sm text-clark-danger" role="alert">
                    {loginForm.formState.errors.email.message}
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
                    loginForm.formState.errors.password ? 'border-clark-danger' : 'border-clark-steel/40',
                  )}
                  {...loginForm.register('password')}
                  aria-invalid={!!loginForm.formState.errors.password}
                  aria-describedby={loginForm.formState.errors.password ? 'password-error' : undefined}
                />
                {loginForm.formState.errors.password && (
                  <p id="password-error" className="mt-1 font-body text-sm text-clark-danger" role="alert">
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex justify-end">
                <Link href="/forgot-password" className="font-body text-sm text-clark-sky hover:text-clark-sky/80 transition-colors">
                  {t('forgotPassword')}
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading || isLockedOut || !agreeConsent}
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
          )}

          {/* ── REGISTER FORM ──────────────────────────────────────── */}
          {activeTab === 'register' && (
            <form onSubmit={registerFormHook.handleSubmit(onRegisterSubmit)} className="space-y-4" noValidate>
              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="block font-body font-medium text-sm mb-1.5">
                  {t('fullName')}
                </label>
                <input
                  id="fullName"
                  type="text"
                  autoComplete="name"
                  disabled={isLoading}
                  className={cn(
                    'w-full h-12 px-4 rounded-lg bg-clark-bg-secondary text-clark-text-primary border transition-colors',
                    'focus:outline-none focus:ring-2 focus:ring-clark-gold focus:border-transparent',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    registerFormHook.formState.errors.fullName ? 'border-clark-danger' : 'border-clark-steel/40',
                  )}
                  {...registerFormHook.register('fullName')}
                  aria-invalid={!!registerFormHook.formState.errors.fullName}
                  aria-describedby={registerFormHook.formState.errors.fullName ? 'fullName-error' : undefined}
                />
                {registerFormHook.formState.errors.fullName && (
                  <p id="fullName-error" className="mt-1 font-body text-sm text-clark-danger" role="alert">
                    {registerFormHook.formState.errors.fullName.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="register-email" className="block font-body font-medium text-sm mb-1.5">
                  {t('emailLabel')}
                </label>
                <input
                  id="register-email"
                  type="email"
                  autoComplete="email"
                  disabled={isLoading}
                  className={cn(
                    'w-full h-12 px-4 rounded-lg bg-clark-bg-secondary text-clark-text-primary border transition-colors',
                    'focus:outline-none focus:ring-2 focus:ring-clark-gold focus:border-transparent',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    registerFormHook.formState.errors.email ? 'border-clark-danger' : 'border-clark-steel/40',
                  )}
                  {...registerFormHook.register('email')}
                  aria-invalid={!!registerFormHook.formState.errors.email}
                  aria-describedby={registerFormHook.formState.errors.email ? 'register-email-error' : undefined}
                />
                {registerFormHook.formState.errors.email && (
                  <p id="register-email-error" className="mt-1 font-body text-sm text-clark-danger" role="alert">
                    {registerFormHook.formState.errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="register-password" className="block font-body font-medium text-sm mb-1.5">
                  {t('passwordLabel')}
                </label>
                <input
                  id="register-password"
                  type="password"
                  autoComplete="new-password"
                  disabled={isLoading}
                  className={cn(
                    'w-full h-12 px-4 rounded-lg bg-clark-bg-secondary text-clark-text-primary border transition-colors',
                    'focus:outline-none focus:ring-2 focus:ring-clark-gold focus:border-transparent',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    registerFormHook.formState.errors.password ? 'border-clark-danger' : 'border-clark-steel/40',
                  )}
                  {...registerFormHook.register('password')}
                  aria-invalid={!!registerFormHook.formState.errors.password}
                  aria-describedby={registerFormHook.formState.errors.password ? 'register-password-error' : undefined}
                />
                {password.length > 0 && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={cn(
                            'h-1 flex-1 rounded-full transition-all duration-300',
                            i <= strength.level ? strength.color : 'bg-clark-steel/40',
                          )}
                        />
                      ))}
                    </div>
                    <p className={cn(
                      'font-condensed text-xs uppercase tracking-wider',
                      strength.level === 1 ? 'text-clark-danger' : strength.level === 2 ? 'text-clark-gold' : 'text-emerald-400',
                    )}>
                      {strengthLabel}
                    </p>
                  </div>
                )}
                {registerFormHook.formState.errors.password && (
                  <p id="register-password-error" className="mt-1 font-body text-sm text-clark-danger" role="alert">
                    {registerFormHook.formState.errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block font-body font-medium text-sm mb-1.5">
                  {t('confirmPassword')}
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  disabled={isLoading}
                  className={cn(
                    'w-full h-12 px-4 rounded-lg bg-clark-bg-secondary text-clark-text-primary border transition-colors',
                    'focus:outline-none focus:ring-2 focus:ring-clark-gold focus:border-transparent',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    registerFormHook.formState.errors.confirmPassword ? 'border-clark-danger' : 'border-clark-steel/40',
                  )}
                  {...registerFormHook.register('confirmPassword')}
                  aria-invalid={!!registerFormHook.formState.errors.confirmPassword}
                  aria-describedby={registerFormHook.formState.errors.confirmPassword ? 'confirmPassword-error' : undefined}
                />
                {registerFormHook.formState.errors.confirmPassword && (
                  <p id="confirmPassword-error" className="mt-1 font-body text-sm text-clark-danger" role="alert">
                    {registerFormHook.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Agree Terms */}
              <div className="flex items-start gap-3">
                <input
                  id="agreeTerms"
                  type="checkbox"
                  disabled={isLoading}
                  className="mt-1 w-4 h-4 rounded border-clark-steel/40 bg-clark-bg-secondary text-clark-accent focus:ring-clark-accent"
                  {...registerFormHook.register('agreeTerms')}
                  aria-invalid={!!registerFormHook.formState.errors.agreeTerms}
                  aria-describedby={registerFormHook.formState.errors.agreeTerms ? 'agreeTerms-error' : undefined}
                />
                <label htmlFor="agreeTerms" className="font-body text-sm text-clark-text-muted">
                  I have read the{' '}
                  <Link href="/privacy-policy#terms" target="_blank" className="text-clark-gold hover:underline">Terms of Use</Link>
                  {' '}and{' '}
                  <Link href="/privacy-policy" target="_blank" className="text-clark-gold hover:underline">Privacy Policy</Link>
                  {' '}and agree to them.
                </label>
              </div>
              {registerFormHook.formState.errors.agreeTerms && (
                <p id="agreeTerms-error" className="font-body text-sm text-clark-danger" role="alert">
                  {registerFormHook.formState.errors.agreeTerms.message}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-clark-accent hover:bg-clark-accent-hover disabled:opacity-60 font-body font-semibold text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> {t('creatingAccount')}</>
                ) : (
                  t('createAccount')
                )}
              </button>
            </form>
          )}

          {/* ── Bottom switch link ─────────────────────────────────── */}
          <p className="mt-6 text-center font-body text-sm text-clark-text-muted">
            {activeTab === 'login' ? (
              <>
                {t('noAccount')}{' '}
                <button
                  type="button"
                  onClick={() => { setActiveTab('register'); setError(null) }}
                  className="text-clark-gold hover:text-clark-gold-hover font-medium transition-colors"
                >
                  {t('signUp')}
                </button>
              </>
            ) : (
              <>
                {t('alreadyHaveAccount')}{' '}
                <button
                  type="button"
                  onClick={() => { setActiveTab('login'); setError(null) }}
                  className="text-clark-gold hover:text-clark-gold-hover font-medium transition-colors"
                >
                  {t('signIn')}
                </button>
              </>
            )}
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
        <AuthFormInner />
      </Suspense>
    </div>
  )
}
