/**
 * Password reset page — /reset-password?token=...
 * Allows the user to set a new password after clicking the reset link.
 */

'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/hooks/useTranslation'

const resetSchema = z
  .object({
    password: z.string().min(8, 'Must be at least 8 characters').max(128),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type ResetForm = z.infer<typeof resetSchema>

function ResetPasswordContent() {
  const { t } = useTranslation()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  if (!token) {
    return (
      <div className="min-h-screen bg-clark-bg-primary flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-clark-bg-secondary rounded-2xl p-8 text-center shadow-xl">
          <h1 className="font-display text-3xl tracking-widest uppercase text-clark-text-primary mb-4">{t('invalidResetLink')}</h1>
          <p className="font-body text-clark-text-muted mb-8">
            {t('invalidResetLinkDesc')}
          </p>
          <a href="/" className="inline-block w-full py-3 px-6 bg-clark-accent hover:bg-clark-accent-hover font-body font-semibold text-white rounded-lg transition-colors">
            {t('goToSignIn')}
          </a>
        </div>
      </div>
    )
  }

  async function onSubmit(data: ResetForm) {
    if (!token) return
    setIsLoading(true)
    setError(null)
    try {
      await api.resetPassword(token, data.password)
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password reset failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-clark-bg-primary flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-clark-bg-secondary rounded-2xl p-8 text-center shadow-xl">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
            <svg className="h-8 w-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="font-display text-3xl tracking-widest uppercase text-clark-text-primary mb-2">{t('passwordResetComplete')}</h1>
          <p className="font-body text-clark-text-muted mb-8">{t('passwordUpdated')}</p>
          <a href="/" className="inline-block w-full py-3 px-6 bg-clark-accent hover:bg-clark-accent-hover font-body font-semibold text-white rounded-lg transition-colors">
            {t('signIn')}
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-clark-bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-clark-bg-secondary rounded-2xl p-8 shadow-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-clark-gold/20">
            <svg className="h-6 w-6 text-clark-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="font-display text-3xl tracking-widest uppercase text-clark-text-primary">{t('resetPassword')}</h1>
          <p className="font-body text-clark-text-muted mt-2 text-sm">{t('enterNewPassword')}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Password */}
          <div>
            <label className="block font-body font-medium text-sm text-clark-text-muted mb-1.5">
              {t('newPassword')}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                placeholder="••••••••"
                className="w-full h-11 px-4 pr-10 rounded-lg bg-clark-bg-card border border-clark-steel/40 text-clark-text-primary placeholder:text-clark-text-muted/50 focus:outline-none focus:ring-2 focus:ring-clark-gold/50 focus:border-clark-gold/30 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 font-body text-clark-text-muted hover:text-clark-text-primary transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1.5 font-body text-xs text-clark-danger">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block font-body font-medium text-sm text-clark-text-muted mb-1.5">
              {t('confirmPassword')}
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              {...register('confirmPassword')}
              placeholder="••••••••"
              className="w-full h-11 px-4 rounded-lg bg-clark-bg-card border border-clark-steel/40 text-clark-text-primary placeholder:text-clark-text-muted/50 focus:outline-none focus:ring-2 focus:ring-clark-gold/50 focus:border-clark-gold/30 transition-colors"
            />
            {errors.confirmPassword && (
              <p className="mt-1.5 font-body text-xs text-clark-danger">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-lg bg-clark-danger/10 border border-clark-danger/20 p-3">
              <p className="font-body text-sm text-clark-danger">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-clark-accent hover:bg-clark-accent-hover disabled:opacity-50 font-body font-semibold text-white rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {t('resetPasswordBtn')}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-clark-bg-primary flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-clark-bg-secondary rounded-2xl p-8 text-center shadow-xl">
          <Loader2 className="h-8 w-8 animate-spin text-clark-accent mx-auto" />
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}
