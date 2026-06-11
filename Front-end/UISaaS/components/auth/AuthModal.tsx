/**
 * Authentication Modal — Superman themed
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Music, Loader2, X, AlertCircle, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { useTranslation } from '@/hooks/useTranslation'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(50),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

type LoginForm = z.infer<typeof loginSchema>
type RegisterForm = z.infer<typeof registerSchema>
type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>

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

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  defaultTab?: 'login' | 'register'
}

export function AuthModal({ isOpen, onClose, defaultTab = 'login' }: AuthModalProps) {
  const router = useRouter()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot'>('login')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [attemptState, setAttemptState] = useState<LoginAttemptState>({ count: 0, lockedUntil: null })
  const [countdown, setCountdown] = useState(0)
  const [forgotSuccess, setForgotSuccess] = useState(false)
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
    if (!attemptState.lockedUntil) {
      setCountdown(0)
      return
    }
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

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const saveAttemptState = useCallback((state: LoginAttemptState) => {
    setAttemptState(state)
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    }
  }, [])

  const handleFailedAttempt = useCallback(() => {
    const newCount = attemptState.count + 1
    const remainingAttempts = MAX_ATTEMPTS - newCount
    if (newCount >= MAX_ATTEMPTS) {
      const lockedUntil = Date.now() + LOCKOUT_DURATION_MS
      saveAttemptState({ count: newCount, lockedUntil })
      setError(`Too many failed attempts. Please try again in ${LOCKOUT_DURATION_MINUTES} minutes.`)
    } else {
      saveAttemptState({ count: newCount, lockedUntil: null })
      setError(`Wrong email or password. Please try again. (${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining)`)
    }
  }, [attemptState.count, saveAttemptState])

  const resetAttempts = useCallback(() => {
    saveAttemptState({ count: 0, lockedUntil: null })
    localStorage.removeItem(STORAGE_KEY)
  }, [saveAttemptState])

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: '', email: '', password: '', confirmPassword: '' },
  })

  const forgotForm = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  async function onLoginSubmit(data: LoginForm) {
    if (attemptState.lockedUntil && attemptState.lockedUntil > Date.now()) {
      const remainingMins = Math.ceil((attemptState.lockedUntil - Date.now()) / 60000)
      setError(`Account is temporarily locked. Please try again in ${remainingMins} minute${remainingMins !== 1 ? 's' : ''}.`)
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const tokens = await api.login(data)
      const user = await api.me(tokens.access_token)
      setSession(tokens.access_token, tokens.refresh_token, user)
      resetAttempts()
      onClose()
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
      await api.register({
        username: data.username,
        email: data.email,
        password: data.password,
      })
      // Auto-login after successful registration
      const tokens = await api.login({ email: data.email, password: data.password })
      const user = await api.me(tokens.access_token)
      setSession(tokens.access_token, tokens.refresh_token, user)
      onClose()
      router.push('/')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  async function onForgotPasswordSubmit(data: ForgotPasswordForm) {
    setIsLoading(true)
    setError(null)
    setForgotSuccess(false)
    try {
      await api.forgotPassword(data.email)
      setForgotSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  function handleGoogleLogin() {
    window.location.href = getGoogleAuthUrl()
  }

  const isLockedOut = attemptState.lockedUntil !== null && attemptState.lockedUntil > Date.now()
  const remainingAttempts = Math.max(0, MAX_ATTEMPTS - attemptState.count)
  const { isAuthenticated } = useAuthStore()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity" onClick={!isLoading ? onClose : undefined} />

      <div className="relative w-full max-w-4xl bg-clark-dark rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {isAuthenticated && (
          <button
            onClick={onClose}
            disabled={isLoading}
            className="absolute top-4 right-4 z-10 p-2 text-surface-400 hover:text-surface-100 rounded-lg hover:bg-shell-raised transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="flex min-h-[min(600px,calc(100vh-6rem))]">
          {/* ── Left panel — Superman hero visual ─────────────────────────── */}
          <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">

            {/* Deep Superman blue gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-superman via-fortress to-fortress-dark" />

            {/* Aurora borealis effect — Superman colors */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute inset-0 animate-aurora aurora-gradient opacity-70" />
              <div className="absolute top-0 left-0 right-0 h-1/2 animate-aurora-drift aurora-gradient-soft" />
              <div className="absolute bottom-0 left-0 right-0 h-1/2 animate-aurora-drift aurora-gradient-mid" />
            </div>

            {/* Animated gold star/hex shapes — Fortress of Solitude feel with zero-gravity float */}
            <div className="absolute inset-0">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute border border-gold/10 backdrop-blur-sm animate-float"
                  style={{
                    width: `${80 + i * 35}px`,
                    height: `${80 + i * 35}px`,
                    top: `${5 + i * 10}%`,
                    left: `${3 + i * 12}%`,
                    transform: `rotate(${i * 20}deg)`,
                    animationDelay: `${i * 0.6}s`,
                    animationDuration: `${5 + i * 0.4}s`,
                    clipPath: i % 2 === 0
                      ? 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)'  // hex
                      : 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',              // diamond
                  }}
                />
              ))}
            </div>

            {/* Radial gold overlay at center bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-fortress-dark/80 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gold/5 to-transparent" />

            {/* Logo watermark */}
            <div className="absolute right-4 top-4 opacity-10">
              <img src="/logo.png" alt="" className="w-32 h-36 object-contain" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center w-full p-8 text-center">
              {/* Animated logo icon */}
              <div className="relative mb-8">
                <div className="absolute inset-0 rounded-2xl bg-gold/20 blur-xl animate-gold-float" />
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center shadow-glow-hero ring-2 ring-gold/60 animate-gold-float">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/logo.png" alt="ClarkPlayer" className="w-full h-full object-contain p-1" />
                </div>
              </div>

              {/* Wordmark with gold highlight */}
              <h1 className="text-4xl font-black tracking-tight text-white mb-2">
                Clark<span className="text-gold">Player</span>
              </h1>
              <p className="text-superman-lighter text-lg mb-8 italic">{t('clarkTagline')}</p>

              {/* Feature highlights with gold dots */}
              <div className="space-y-3 text-sm text-surface-300">
                {[
                  'Stream your music library anywhere',
                  'Create and manage playlists',
                  'High-quality audio playback',
                  'Collaborate with friends',
                ].map((feat) => (
                  <div key={feat} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-gold shadow-glow-gold flex-shrink-0" />
                    <span className="text-left">{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right panel — forms ───────────────────────────────────────── */}
          <div className="flex-1 flex flex-col p-8 lg:p-12 overflow-y-auto max-h-[90vh]">

            {/* Tab switcher — Hero Red active tab */}
            <div className="flex gap-1 p-1 bg-fortress rounded-lg mb-8 ring-1 ring-superman/30">
              <button
                onClick={() => { setActiveTab('login'); setError(null) }}
                className={cn(
                  'flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-all',
                  activeTab === 'login'
                    ? 'bg-hero text-white shadow-glow-hero'
                    : 'text-surface-400 hover:text-surface-100 hover:bg-fortress-light'
                )}
              >
                Sign In
              </button>
              <button
                onClick={() => { setActiveTab('register'); setError(null) }}
                className={cn(
                  'flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-all',
                  activeTab === 'register'
                    ? 'bg-hero text-white shadow-glow-hero'
                    : 'text-surface-400 hover:text-surface-100 hover:bg-fortress-light'
                )}
              >
                Sign Up
              </button>
            </div>

            {/* Lockout warning */}
            {isLockedOut && (
              <div className="mb-6 p-4 rounded-lg bg-hero-muted border border-hero/30">
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-hero flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-hero font-semibold mb-1">Account Temporarily Locked</h3>
                    <p className="text-hero/80 text-sm">
                      Too many failed login attempts. Please try again in{' '}
                      <span className="font-mono font-bold text-white">{formatCountdown(countdown)}</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Attempt warning */}
            {!isLockedOut && attemptState.count > 0 && (
              <div className="mb-6 p-3 rounded-lg bg-gold-muted border border-gold/20">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-gold" />
                  <span className="text-gold text-sm">
                    {remainingAttempts} attempt{remainingAttempts !== 1 ? 's' : ''} remaining before lockout
                  </span>
                </div>
              </div>
            )}

            {/* Error banner */}
            {error && !isLockedOut && (
              <div className="mb-6 p-3 rounded-lg bg-hero-muted border border-hero/30 text-hero text-sm" role="alert">
                {error}
              </div>
            )}

            {/* Google social button */}
            <div className="space-y-3 mb-6">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading || isLockedOut}
                className="w-full h-12 flex items-center justify-center gap-3 border border-superman/40 rounded-lg bg-fortress text-surface-100 hover:bg-fortress-light hover:border-superman transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-superman/30" />
              <span className="text-xs text-surface-500 uppercase tracking-widest">or</span>
              <div className="flex-1 h-px bg-superman/30" />
            </div>

            {/* Login Form */}
            {activeTab === 'login' && (
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4" noValidate>
                <div>
                  <label htmlFor="login-email" className="block text-sm font-semibold mb-1.5 text-surface-200">
                    Email
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    disabled={isLoading || isLockedOut}
                    className={cn(
                      'w-full h-12 px-4 rounded-lg bg-fortress text-surface-100 border transition-colors',
                      'focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                      loginForm.formState.errors.email ? 'border-hero' : 'border-superman/30'
                    )}
                    {...loginForm.register('email')}
                    aria-invalid={!!loginForm.formState.errors.email}
                    aria-describedby={loginForm.formState.errors.email ? 'login-email-error' : undefined}
                  />
                  {loginForm.formState.errors.email && (
                    <p id="login-email-error" className="mt-1 text-sm text-hero" role="alert">
                      {loginForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="login-password" className="block text-sm font-semibold mb-1.5 text-surface-200">
                    Password
                  </label>
                  <input
                    id="login-password"
                    type="password"
                    autoComplete="current-password"
                    disabled={isLoading || isLockedOut}
                    className={cn(
                      'w-full h-12 px-4 rounded-lg bg-fortress text-surface-100 border transition-colors',
                      'focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                      loginForm.formState.errors.password ? 'border-hero' : 'border-superman/30'
                    )}
                    {...loginForm.register('password')}
                    aria-invalid={!!loginForm.formState.errors.password}
                    aria-describedby={loginForm.formState.errors.password ? 'login-password-error' : undefined}
                  />
                  {loginForm.formState.errors.password && (
                    <p id="login-password-error" className="mt-1 text-sm text-hero" role="alert">
                      {loginForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => { setActiveTab('forgot'); setError(null) }}
                    className="text-sm text-gold hover:text-gold-light transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || isLockedOut}
                  className="w-full h-12 bg-hero hover:bg-hero-light disabled:opacity-60 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 hover:shadow-glow-hero hover:-translate-y-0.5"
                >
                  {isLoading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" />Signing in…</>
                  ) : isLockedOut ? (
                    <><Lock className="w-5 h-5" />Locked ({formatCountdown(countdown)})</>
                  ) : (
                    'Sign in'
                  )}
                </button>
              </form>
            )}

            {/* Register Form */}
            {activeTab === 'register' && (
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4" noValidate>
                <div>
                  <label htmlFor="register-username" className="block text-sm font-semibold mb-1.5 text-surface-200">
                    Username
                  </label>
                  <input
                    id="register-username"
                    type="text"
                    autoComplete="username"
                    disabled={isLoading}
                    className={cn(
                      'w-full h-12 px-4 rounded-lg bg-fortress text-surface-100 border transition-colors',
                      'focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                      registerForm.formState.errors.username ? 'border-hero' : 'border-superman/30'
                    )}
                    {...registerForm.register('username')}
                    aria-invalid={!!registerForm.formState.errors.username}
                    aria-describedby={registerForm.formState.errors.username ? 'register-username-error' : undefined}
                  />
                  {registerForm.formState.errors.username && (
                    <p id="register-username-error" className="mt-1 text-sm text-hero" role="alert">
                      {registerForm.formState.errors.username.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="register-email" className="block text-sm font-semibold mb-1.5 text-surface-200">
                    Email
                  </label>
                  <input
                    id="register-email"
                    type="email"
                    autoComplete="email"
                    disabled={isLoading}
                    className={cn(
                      'w-full h-12 px-4 rounded-lg bg-fortress text-surface-100 border transition-colors',
                      'focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                      registerForm.formState.errors.email ? 'border-hero' : 'border-superman/30'
                    )}
                    {...registerForm.register('email')}
                    aria-invalid={!!registerForm.formState.errors.email}
                    aria-describedby={registerForm.formState.errors.email ? 'register-email-error' : undefined}
                  />
                  {registerForm.formState.errors.email && (
                    <p id="register-email-error" className="mt-1 text-sm text-hero" role="alert">
                      {registerForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="register-password" className="block text-sm font-semibold mb-1.5 text-surface-200">
                    Password
                  </label>
                  <input
                    id="register-password"
                    type="password"
                    autoComplete="new-password"
                    disabled={isLoading}
                    className={cn(
                      'w-full h-12 px-4 rounded-lg bg-fortress text-surface-100 border transition-colors',
                      'focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                      registerForm.formState.errors.password ? 'border-hero' : 'border-superman/30'
                    )}
                    {...registerForm.register('password')}
                    aria-invalid={!!registerForm.formState.errors.password}
                    aria-describedby={registerForm.formState.errors.password ? 'register-password-error' : undefined}
                  />
                  {registerForm.formState.errors.password && (
                    <p id="register-password-error" className="mt-1 text-sm text-hero" role="alert">
                      {registerForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="register-confirm-password" className="block text-sm font-semibold mb-1.5 text-surface-200">
                    Confirm Password
                  </label>
                  <input
                    id="register-confirm-password"
                    type="password"
                    autoComplete="new-password"
                    disabled={isLoading}
                    className={cn(
                      'w-full h-12 px-4 rounded-lg bg-fortress text-surface-100 border transition-colors',
                      'focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                      registerForm.formState.errors.confirmPassword ? 'border-hero' : 'border-superman/30'
                    )}
                    {...registerForm.register('confirmPassword')}
                    aria-invalid={!!registerForm.formState.errors.confirmPassword}
                    aria-describedby={registerForm.formState.errors.confirmPassword ? 'register-confirm-password-error' : undefined}
                  />
                  {registerForm.formState.errors.confirmPassword && (
                    <p id="register-confirm-password-error" className="mt-1 text-sm text-hero" role="alert">
                      {registerForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-hero hover:bg-hero-light disabled:opacity-60 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 hover:shadow-glow-hero hover:-translate-y-0.5"
                >
                  {isLoading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" />Creating account…</>
                  ) : (
                    'Create account'
                  )}
                </button>
              </form>
            )}

            {/* Forgot Password Form */}
            {activeTab === 'forgot' && !forgotSuccess && (
              <form onSubmit={forgotForm.handleSubmit(onForgotPasswordSubmit)} className="space-y-4" noValidate>
                <p className="text-surface-400 text-sm mb-4">
                  Enter your email address and we&apos;ll send you a link to reset your password.
                </p>

                <div>
                  <label htmlFor="forgot-email" className="block text-sm font-semibold mb-1.5 text-surface-200">
                    Email
                  </label>
                  <input
                    id="forgot-email"
                    type="email"
                    autoComplete="email"
                    disabled={isLoading}
                    className={cn(
                      'w-full h-12 px-4 rounded-lg bg-fortress text-surface-100 border transition-colors',
                      'focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                      forgotForm.formState.errors.email ? 'border-hero' : 'border-superman/30'
                    )}
                    {...forgotForm.register('email')}
                  />
                  {forgotForm.formState.errors.email && (
                    <p className="mt-1 text-sm text-hero">{forgotForm.formState.errors.email.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-hero hover:bg-hero-light disabled:opacity-60 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 hover:shadow-glow-hero hover:-translate-y-0.5"
                >
                  {isLoading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" />Sending…</>
                  ) : (
                    'Send reset link'
                  )}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => { setActiveTab('login'); setError(null) }}
                    className="text-sm text-gold hover:text-gold-light transition-colors"
                  >
                    Back to sign in
                  </button>
                </div>
              </form>
            )}

            {/* Forgot password success */}
            {activeTab === 'forgot' && forgotSuccess && (
              <div className="text-center py-8">
                <div className="relative mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gold/20 ring-2 ring-gold/40">
                  <img src="/logo.png" alt="" className="w-8 h-9 object-contain" />
                </div>
                <h3 className="text-lg font-bold text-surface-100 mb-2">Check your email</h3>
                <p className="text-surface-400 text-sm mb-6">
                  If an account exists with that email, we&apos;ve sent a password reset link.
                </p>
                <button
                  type="button"
                  onClick={() => { setActiveTab('login'); setForgotSuccess(false); setError(null) }}
                  className="text-sm text-gold hover:text-gold-light transition-colors"
                >
                  Back to sign in
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}