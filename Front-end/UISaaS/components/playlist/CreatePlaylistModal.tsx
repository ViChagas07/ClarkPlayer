'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { X, Image as ImageIcon, Lock, Globe, Music, Pencil, Trash2, HardDrive, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePlayerStore } from '@/store/playerStore'
import { useTranslation } from '@/hooks/useTranslation'
import { useGooglePicker } from '@/hooks/useGooglePicker'

interface CreatePlaylistModalProps {
  onClose: () => void
  onCreate: (data: { name: string; description?: string; isPrivate: boolean; coverUrl?: string }) => void
}

export function CreatePlaylistModal({ onClose, onCreate }: CreatePlaylistModalProps) {
  const { t } = useTranslation()
  const setPlayerVisible = usePlayerStore((s) => s.setPlayerVisible)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [driveError, setDriveError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  // ── Google Drive picker ──────────────────────────────────────
  const handleDriveFile = useCallback((file: File) => {
    setDriveError(null)
    if (!file.type.startsWith('image/')) return
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl)
    }
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    setImageFile(file)
  }, [previewUrl])

  const handleDriveError = useCallback((message: string) => {
    setDriveError(message)
  }, [])

  const { openPicker, ready: driveReady, loading: driveLoading } = useGooglePicker({
    onFilePicked: handleDriveFile,
    onError: handleDriveError,
  })

  // ── Player bar visibility ───────────────────────────────────
  useEffect(() => {
    setPlayerVisible(false)
    return () => setPlayerVisible(true)
  }, [setPlayerVisible])

  // ── Focus trap + Escape ─────────────────────────────────────
  useEffect(() => {
    const modal = modalRef.current
    if (!modal) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key === 'Tab') {
        const focusable = modal.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        )
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    modal.focus()
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  // ── Local file handling ─────────────────────────────────────
  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl)
    }
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    setImageFile(file)
    setDriveError(null)
  }, [previewUrl])

  const handleRemoveImage = useCallback(() => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl(null)
    setImageFile(null)
    setDriveError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [previewUrl])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  // ── Submit ──────────────────────────────────────────────────
  const handleSubmit = useCallback(() => {
    if (!name.trim()) return

    const submit = (coverUrl?: string) => {
      onCreate({
        name: name.trim(),
        description: description.trim() || undefined,
        isPrivate,
        coverUrl,
      })
    }

    if (imageFile) {
      const reader = new FileReader()
      reader.onload = () => {
        submit(reader.result as string)
      }
      reader.onerror = () => {
        submit(undefined)
      }
      reader.readAsDataURL(imageFile)
    } else {
      submit(undefined)
    }
  }, [name, description, isPrivate, imageFile, onCreate])

  const charCount = description.length
  const maxChars = 200

  return (
    <div
      className="fixed inset-0 z-modal flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-playlist-title"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="bg-clark-bg-secondary rounded-xl border border-clark-steel/30 w-full max-w-sm shadow-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ──────────────────────────────────── */}
        <div className="flex items-center justify-between p-4 pb-0">
          <div className="flex items-center gap-2">
            <h2 id="create-playlist-title" className="font-display text-xl tracking-widest uppercase text-clark-text-primary">{t('newPlaylist')}</h2>
          </div>
          <button onClick={onClose} className="text-clark-text-muted hover:text-clark-gold transition-colors p-1 rounded-lg hover:bg-clark-bg-card" aria-label={t('cancelAction')}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          {/* ── Cover upload: drop zone + Google Drive CTA ── */}
          <div
            className={cn(
              'relative h-28 rounded-xl border-2 border-dashed transition-colors overflow-hidden group/cover',
              isDragging
                ? 'border-clark-gold bg-clark-gold/5'
                : 'border-clark-steel/30 bg-clark-bg-card hover:border-clark-gold/40',
            )}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            {previewUrl ? (
              <>
                <img src={previewUrl} alt={t('playlistCoverPreview')} className="w-full h-full object-cover" />
                {/* Edit/Remove overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/cover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      fileInputRef.current?.click()
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white font-body text-xs font-medium transition-colors"
                    aria-label={t('changeCoverImage')}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    {t('changeCoverImage')}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemoveImage()
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/30 hover:bg-red-500/50 text-white font-body text-xs font-medium transition-colors"
                    aria-label={t('removeCoverImage')}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {t('removeCoverImage')}
                  </button>
                </div>
              </>
            ) : (
              <div
                className="flex flex-col items-center justify-center gap-2 h-full text-clark-text-muted px-4 cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex items-center gap-3">
                  <ImageIcon className="w-6 h-6 flex-shrink-0 text-clark-gold" />
                  <div className="text-left">
                    <p className="font-body text-sm">{t('dropImageUpload')}</p>
                    <p className="font-body text-xs text-clark-text-muted/50 mt-0.5">{t('pngJpgLimit')}</p>
                  </div>
                </div>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFile(file)
              }}
            />
          </div>

          {/* ── Google Drive picker row ────────────────── */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-clark-steel/20" />
            <span className="font-body text-[10px] uppercase tracking-widest text-clark-text-muted/50">{t('orDivider')}</span>
            <div className="flex-1 h-px bg-clark-steel/20" />
          </div>

          <button
            type="button"
            onClick={() => {
              setDriveError(null)
              openPicker()
            }}
            disabled={driveLoading}
            className={cn(
              'w-full h-10 flex items-center justify-center gap-2 rounded-lg border border-clark-steel/20 bg-clark-bg-card hover:bg-clark-bg-card/80 font-body text-sm text-clark-text-muted hover:text-clark-text-primary transition-all',
              driveLoading && 'opacity-50 cursor-wait',
            )}
            aria-label={t('chooseFromDrive')}
          >
            {driveLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <HardDrive className="w-4 h-4" />
            )}
            {driveLoading ? t('loadingDrive') : t('chooseFromDrive')}
          </button>

          {/* Drive error feedback */}
          {driveError && (
            <p className="font-body text-xs text-clark-danger flex items-center gap-1" role="alert">
              <span aria-hidden="true">!</span> {driveError}
            </p>
          )}

          {/* ── Name ───────────────────────────────────── */}
          <div>
            <label htmlFor="playlist-name" className="block font-body font-semibold text-xs mb-1 text-clark-text-primary">{t('nameLabel')}</label>
            <input
              id="playlist-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-11 px-3 rounded-lg bg-clark-bg-card text-clark-text-primary border border-clark-steel/30 font-body text-sm focus:outline-none focus:ring-2 focus:ring-clark-gold/40 focus:border-transparent transition-colors"
              placeholder={t('playlistNamePlaceholder')}
              autoFocus
            />
          </div>

          {/* ── Description ────────────────────────────── */}
          <div>
            <label htmlFor="playlist-desc" className="block font-body font-semibold text-xs mb-1 text-clark-text-primary">{t('descriptionOptional')}</label>
            <textarea
              id="playlist-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, maxChars))}
              rows={1}
              className="w-full px-3 py-2 rounded-lg bg-clark-bg-card text-clark-text-primary border border-clark-steel/30 font-body text-sm focus:outline-none focus:ring-2 focus:ring-clark-gold/40 focus:border-transparent resize-none transition-colors"
              placeholder={t('descriptionPlaceholder')}
            />
            <p className="font-body text-xs text-clark-text-muted text-right mt-0.5">{charCount}/{maxChars}</p>
          </div>

          {/* ── Privacy toggle ─────────────────────────── */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-clark-bg-card border border-clark-steel/20">
            <div className="flex items-center gap-2">
              {isPrivate
                ? <Lock className="w-3.5 h-3.5 text-clark-accent" />
                : <Globe className="w-3.5 h-3.5 text-clark-text-muted" />
              }
              <span className="font-body font-medium text-xs text-clark-text-primary">{isPrivate ? t('privateLabel') : t('publicLabel')}</span>
            </div>
            <button
              onClick={() => setIsPrivate(!isPrivate)}
              className={cn(
                'relative w-9 h-5 rounded-full transition-all',
                isPrivate ? 'bg-clark-accent shadow-glow-hero' : 'bg-clark-steel/40',
              )}
              role="switch"
              aria-checked={isPrivate}
              aria-label={t('togglePrivacy')}
            >
              <div
                className={cn(
                  'absolute top-0.5 w-4 h-4 rounded-full bg-clark-gold shadow transition-transform',
                  isPrivate ? 'translate-x-4' : 'translate-x-0.5',
                )}
              />
            </button>
          </div>

          {/* ── Submit ─────────────────────────────────── */}
          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="w-full h-11 bg-clark-accent hover:bg-clark-accent-hover disabled:opacity-50 font-body font-semibold text-sm text-white rounded-lg transition-all hover:-translate-y-0.5 shadow-glow-hero flex items-center justify-center gap-2"
          >
            <Music className="w-3.5 h-3.5 text-clark-gold" />
            {t('createPlaylist')}
          </button>
        </div>
      </div>
    </div>
  )
}
