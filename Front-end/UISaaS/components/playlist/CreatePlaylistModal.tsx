'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { X, Upload, Image as ImageIcon, Lock, Globe, Music } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePlayerStore } from '@/store/playerStore'
import { useTranslation } from '@/hooks/useTranslation'

interface CreatePlaylistModalProps {
  onClose: () => void
  onCreate: (data: { name: string; description?: string; isPrivate: boolean }) => void
}

export function CreatePlaylistModal({ onClose, onCreate }: CreatePlaylistModalProps) {
  const { t } = useTranslation()
  const setPlayerVisible = usePlayerStore((s) => s.setPlayerVisible)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  // Hide player bar while modal is open
  useEffect(() => {
    setPlayerVisible(false)
    return () => setPlayerVisible(true)
  }, [setPlayerVisible])

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

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

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
        <div className="flex items-center justify-between p-4 pb-0">
          <div className="flex items-center gap-2">
            <h2 id="create-playlist-title" className="font-display text-xl tracking-widest uppercase text-clark-text-primary">{t('newPlaylist')}</h2>
          </div>
          <button onClick={onClose} className="text-clark-text-muted hover:text-clark-gold transition-colors p-1 rounded-lg hover:bg-clark-bg-card" aria-label={t('cancelAction')}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          {/* Cover upload — reduced size */}
          <div
            className={cn(
              'relative h-28 rounded-xl border-2 border-dashed transition-colors overflow-hidden',
              isDragging
                ? 'border-clark-gold bg-clark-gold/5'
                : 'border-clark-steel/30 bg-clark-bg-card hover:border-clark-gold/40',
            )}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            {previewUrl ? (
              <img src={previewUrl} alt={t('playlistCoverPreview')} className="w-full h-full object-cover" />
            ) : (
              <div className="flex items-center justify-center gap-3 h-full text-clark-text-muted px-4">
                <ImageIcon className="w-6 h-6 flex-shrink-0 text-clark-gold" />
                <div className="text-left">
                  <p className="font-body text-sm">{t('dropImageUpload')}</p>
                  <p className="font-body text-xs text-clark-text-muted/50 mt-0.5">{t('pngJpgLimit')}</p>
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

          {/* Name */}
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

          {/* Description */}
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

          {/* Privacy toggle */}
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

          {/* Submit */}
          <button
            onClick={() => {
              if (!name.trim()) return
              onCreate({ name: name.trim(), description: description.trim() || undefined, isPrivate })
            }}
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
