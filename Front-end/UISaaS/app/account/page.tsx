'use client'

import { useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { useAuthStore } from '@/store/authStore'
import { useTranslation } from '@/hooks/useTranslation'
import { Camera, Trash2, X, Loader2, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function AccountPage() {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const clearSession = useAuthStore((s) => s.clearSession)
  const [displayName, setDisplayName] = useState(user?.display_name ?? user?.username ?? '')
  const [bio, setBio] = useState('Music enthusiast and collector.')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  const charCount = bio.length
  const maxChars = 160

  function handleDeleteAccount() {
    if (deleteConfirm !== 'DELETE') return
    setIsDeleting(true)
    setTimeout(() => {
      setIsDeleting(false)
      setShowDeleteModal(false)
      clearSession()
      window.location.href = '/login'
    }, 2000)
  }

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="font-display text-3xl tracking-widest uppercase">{t('myAccount')}</h1>

        {/* Profile header */}
        <div className="bg-clark-bg-secondary rounded-xl border border-clark-steel/20 p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative group">
              {user?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatar_url}
                  alt={user.display_name ?? 'Profile'}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-clark-steel to-clark-bg-card flex items-center justify-center overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/ClarkPlayer_Favicon.png" alt="ClarkPlayer" className="w-16 h-16 object-contain" />
                </div>
              )}
              <button
                className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={t('editPhoto')}
              >
                <Camera className="w-6 h-6 text-white" />
              </button>
            </div>
            <div className="text-center sm:text-left flex-1">
              <h2 className="font-display tracking-wider text-xl text-clark-text-primary">{displayName}</h2>
              <p className="font-body text-clark-text-muted">{user?.email ?? ''}</p>
              <p className="font-body text-sm text-clark-text-muted/50 mt-1">{t('googleAccountLinked')}</p>
              <span className="inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 rounded-full font-condensed text-xs uppercase tracking-wider bg-clark-gold/20 text-clark-gold border border-clark-gold/40">
                {t('free')}
              </span>
            </div>
          </div>
        </div>

        {/* Profile info form */}
        <div className="bg-clark-bg-secondary rounded-xl border border-clark-steel/20 p-6">
          <h3 className="font-display tracking-wider text-lg mb-4 text-clark-text-primary">{t('profileInformation')}</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="display-name" className="block font-body font-medium text-sm mb-1.5 text-clark-text-primary">{t('displayName')}</label>
              <input
                id="display-name"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full h-12 px-4 rounded-lg bg-clark-bg-card text-clark-text-primary border border-clark-steel/40 font-body focus:outline-none focus:ring-2 focus:ring-clark-gold focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="email-field" className="block font-body font-medium text-sm mb-1.5 text-clark-text-primary">{t('emailLabel')}</label>
              <input
                id="email-field"
                type="email"
                value={user?.email ?? ''}
                disabled
                className="w-full h-12 px-4 rounded-lg bg-clark-bg-card/50 text-clark-text-muted border border-clark-steel/40 font-body cursor-not-allowed"
              />
            </div>
            <div>
              <label htmlFor="bio" className="block font-body font-medium text-sm mb-1.5 text-clark-text-primary">{t('bioLabel')}</label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, maxChars))}
                rows={3}
                className="w-full px-4 py-3 rounded-lg bg-clark-bg-card text-clark-text-primary border border-clark-steel/40 font-body focus:outline-none focus:ring-2 focus:ring-clark-gold focus:border-transparent resize-none"
              />
              <p className={cn('font-body text-xs mt-1 text-right', charCount > maxChars * 0.9 ? 'text-clark-gold' : 'text-clark-text-muted')}>
                {charCount}/{maxChars}
              </p>
            </div>
            <button className="px-6 py-2.5 bg-clark-accent hover:bg-clark-accent-hover font-body font-semibold text-white rounded-lg transition-colors">
              {t('saveChanges')}
            </button>
          </div>
        </div>

        {/* Linked accounts */}
        <div className="bg-clark-bg-secondary rounded-xl border border-clark-steel/20 p-6">
          <h3 className="font-display tracking-wider text-lg mb-4 text-clark-text-primary">{t('linkedAccounts')}</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-clark-bg-card">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span className="font-body font-medium text-sm text-clark-text-primary">Google</span>
              </div>
              <span className="font-body text-xs text-emerald-400 flex items-center gap-1">
                <Check className="w-3 h-3" /> {t('connectedLabel')}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-clark-bg-card">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                <span className="font-body font-medium text-sm text-clark-text-primary">Apple</span>
              </div>
              <button className="font-body text-xs text-clark-danger hover:text-clark-danger/80 font-medium transition-colors">
                {t('disconnectAction')}
              </button>
            </div>
          </div>
        </div>

        {/* Danger zone */}
        <div className="bg-clark-bg-secondary rounded-xl border border-clark-danger/30 p-6">
          <h3 className="font-display tracking-wider text-lg mb-2 text-clark-danger">{t('dangerZone')}</h3>
          <p className="font-body text-sm text-clark-text-muted mb-4">
            {t('dangerZoneDesc')}
          </p>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-6 py-2.5 bg-clark-danger/20 hover:bg-clark-danger/30 font-body font-semibold text-clark-danger rounded-lg transition-colors flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            {t('deleteAccount')}
          </button>
        </div>

        {/* Delete confirmation modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-modal flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-clark-bg-secondary rounded-xl border border-clark-steel/20 p-6 w-full max-w-md shadow-modal" role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
              <div className="flex items-center justify-between mb-4">
                <h3 id="delete-modal-title" className="font-display tracking-wider text-lg text-clark-danger">{t('deleteConfirmTitle')}</h3>
                <button onClick={() => setShowDeleteModal(false)} className="text-clark-text-muted hover:text-clark-text-primary transition-colors" aria-label={t('cancelAction')}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="font-body text-sm text-clark-text-muted mb-4">
                {t('deleteConfirmDesc')}
              </p>
              <input
                type="text"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                className="w-full h-12 px-4 rounded-lg bg-clark-bg-card text-clark-text-primary border border-clark-steel/40 font-body focus:outline-none focus:ring-2 focus:ring-clark-danger mb-4"
                placeholder={t('typeDeleteConfirm')}
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 h-12 bg-clark-bg-card hover:bg-clark-steel/20 font-body font-semibold text-clark-text-primary rounded-lg transition-colors"
                >
                  {t('cancelAction')}
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirm !== 'DELETE' || isDeleting}
                  className="flex-1 h-12 bg-clark-danger hover:bg-clark-danger/80 disabled:opacity-60 font-body font-semibold text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t('deleting')}
                    </>
                  ) : (
                    t('deleteAction')
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
