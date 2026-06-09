'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'
import { useTranslation } from '@/hooks/useTranslation'

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

type RegisterForm = z.infer<typeof registerSchema>

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

function RegisterFormInner() {
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', email: '', password: '', confirmPassword: '', agreeTerms: false },
  })

  const password = watch('password') || ''
  const strength = getPasswordStrength(password)
  const prefilledEmail = searchParams.get('email') ?? ''

  async function onSubmit(data: RegisterForm) {
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
      setSuccess(true)
      setTimeout(() => { router.push('/login?registered=1') }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Localized password strength labels
  const strengthLabel = strength.label === 'weak' ? t('weak') : strength.label === 'fair' ? t('fair') : strength.label === 'strong' ? t('strong') : ''

  if (success) {
    return (
      <>
        {/* Left panel */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-clark-shadow via-clark-bg-secondary to-clark-bg-card">
          <div className="absolute inset-0 animate-pulse-slow">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="absolute rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10"
                style={{ width: `${120 + i * 40}px`, height: `${120 + i * 40}px`, top: `${10 + i * 12}%`, left: `${5 + i * 15}%`, transform: `rotate(${i * 15}deg)`, animationDelay: `${i * 0.3}s` }} />
            ))}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-clark-shadow/80 to-transparent" />
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-clark-accent via-clark-accent/60 to-clark-accent opacity-40" />
          <div className="relative z-10 flex flex-col items-center justify-center w-full">
            <div className="w-20 h-20 rounded-2xl bg-clark-bg-card flex items-center justify-center mb-6 shadow-glow-gold ring-2 ring-clark-gold/60 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="ClarkPlayer" className="w-full h-full object-contain p-1" />
            </div>
            <h1 className="font-display text-5xl tracking-widest uppercase text-clark-text-primary mb-3">ClarkPlayer</h1>
<p className="font-body italic text-clark-text-muted text-lg">Clark by Name. Super by Nature.</p>
          </div>
        </div>

        {/* Right panel — success */}
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="font-display text-2xl tracking-widest uppercase mb-3">{t('accountCreated')}</h2>
            <p className="font-body text-clark-text-muted">{t('redirectingSignIn')}</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-clark-shadow via-clark-bg-secondary to-clark-bg-card">
        <div className="absolute inset-0 animate-pulse-slow">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="absolute rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10"
              style={{ width: `${120 + i * 40}px`, height: `${120 + i * 40}px`, top: `${10 + i * 12}%`, left: `${5 + i * 15}%`, transform: `rotate(${i * 15}deg)`, animationDelay: `${i * 0.3}s` }} />
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-clark-shadow/80 to-transparent" />
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-clark-accent via-clark-accent/60 to-clark-accent opacity-40" />
        <div className="relative z-10 flex flex-col items-center justify-center w-full">
          <div className="w-20 h-20 rounded-2xl bg-clark-bg-card flex items-center justify-center mb-6 shadow-glow-gold ring-2 ring-clark-gold/60 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="ClarkPlayer" className="w-full h-full object-contain p-1" />
          </div>
          <h1 className="font-display text-5xl tracking-widest uppercase text-clark-text-primary mb-3">ClarkPlayer</h1>
          <p className="font-body italic text-clark-text-muted text-lg">Clark by Name. Super by Nature.</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-clark-bg-card flex items-center justify-center overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="ClarkPlayer" className="w-full h-full object-contain p-0.5" />
            </div>
            <span className="font-display text-xl tracking-wider">ClarkPlayer</span>
          </div>

          <h2 className="font-display text-3xl tracking-widest uppercase mb-2">{t('createYourAccount')}</h2>
          <p className="font-body text-clark-text-muted mb-8">{t('joinClarkPlayer')}</p>

          {error && (
            <div className="mb-6 p-3 rounded-lg bg-clark-danger/10 border border-clark-danger/20 font-body text-sm text-clark-danger" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div>
              <label htmlFor="fullName" className="block font-body font-medium text-sm mb-1.5">{t('fullName')}</label>
              <input id="fullName" type="text" className={cn(
                'w-full h-12 px-4 rounded-lg bg-clark-bg-secondary text-clark-text-primary border transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-clark-gold focus:border-transparent',
                errors.fullName ? 'border-clark-danger' : 'border-clark-steel/40',
              )} {...register('fullName')} aria-invalid={!!errors.fullName} />
              {errors.fullName && <p className="mt-1 font-body text-sm text-clark-danger" role="alert">{errors.fullName.message}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block font-body font-medium text-sm mb-1.5">{t('emailLabel')}</label>
              <input id="email" type="email" defaultValue={prefilledEmail} className={cn(
                'w-full h-12 px-4 rounded-lg bg-clark-bg-secondary text-clark-text-primary border transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-clark-gold focus:border-transparent',
                errors.email ? 'border-clark-danger' : 'border-clark-steel/40',
              )} {...register('email')} aria-invalid={!!errors.email} />
              {errors.email && <p className="mt-1 font-body text-sm text-clark-danger" role="alert">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block font-body font-medium text-sm mb-1.5">{t('passwordLabel')}</label>
              <input id="password" type="password" className={cn(
                'w-full h-12 px-4 rounded-lg bg-clark-bg-secondary text-clark-text-primary border transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-clark-gold focus:border-transparent',
                errors.password ? 'border-clark-danger' : 'border-clark-steel/40',
              )} {...register('password')} aria-invalid={!!errors.password} />
              {password.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className={cn(
                        'h-1 flex-1 rounded-full transition-all duration-300',
                        i <= strength.level ? strength.color : 'bg-clark-steel/40',
                      )} />
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
              {errors.password && <p className="mt-1 font-body text-sm text-clark-danger" role="alert">{errors.password.message}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block font-body font-medium text-sm mb-1.5">{t('confirmPassword')}</label>
              <input id="confirmPassword" type="password" className={cn(
                'w-full h-12 px-4 rounded-lg bg-clark-bg-secondary text-clark-text-primary border transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-clark-gold focus:border-transparent',
                errors.confirmPassword ? 'border-clark-danger' : 'border-clark-steel/40',
              )} {...register('confirmPassword')} aria-invalid={!!errors.confirmPassword} />
              {errors.confirmPassword && <p className="mt-1 font-body text-sm text-clark-danger" role="alert">{errors.confirmPassword.message}</p>}
            </div>

            <div className="flex items-start gap-3">
              <input id="agreeTerms" type="checkbox" className="mt-1 w-4 h-4 rounded border-clark-steel/40 bg-clark-bg-secondary text-clark-accent focus:ring-clark-accent" {...register('agreeTerms')} />
              <label htmlFor="agreeTerms" className="font-body text-sm text-clark-text-muted">
                {t('agreeTerms')}
              </label>
            </div>
            {errors.agreeTerms && <p className="font-body text-sm text-clark-danger" role="alert">{errors.agreeTerms.message}</p>}

            <button type="submit" disabled={isLoading} className="w-full h-12 bg-clark-accent hover:bg-clark-accent-hover disabled:opacity-60 font-body font-semibold text-white rounded-lg transition-colors flex items-center justify-center gap-2">
              {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> {t('creatingAccount')}</> : t('createAccount')}
            </button>
          </form>

          <p className="mt-6 text-center font-body text-sm text-clark-text-muted">
            {t('alreadyHaveAccount')}{' '}
            <Link href="/login" className="text-clark-gold hover:text-clark-gold-hover font-medium transition-colors">{t('signIn')}</Link>
          </p>
        </div>
      </div>
    </>
  )
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterFormInner />
    </Suspense>
  )
}
