'use client'

import { useState } from 'react'
import { X as CloseIcon, Link, Copy, Check, MessageCircle, Send, Download, Music } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Track } from '@/types'

interface ShareSheetProps {
  track: Track | null
  isOpen: boolean
  onClose: () => void
}

export function ShareSheet({ track, isOpen, onClose }: ShareSheetProps) {
  const [copied, setCopied] = useState(false)

  if (!isOpen || !track) return null

  const shareText = `Now listening to '${track.title}' by ${track.artist} on ClarkPlayer`
  const shareUrl = `${window.location.origin}/tracks/${track.id}`

  function handleCopy() {
    navigator.clipboard.writeText(`${shareText} — ${shareUrl}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleWhatsApp() {
    window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`, '_blank')
  }

  function handleTelegram() {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, '_blank')
  }

  function handleTwitter() {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank')
  }

  function handleExportM3U8() {
    if (!track) return
    const content = `#EXTM3U\n#EXTINF:${track.duration},${track.title}\n${track.title}.mp3`
    const blob = new Blob([content], { type: 'audio/x-mpegurl' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${track.title}.m3u8`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleRingtone() {
    alert('This feature requires the desktop app')
  }

  return (
    <div className="fixed inset-0 z-modal flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full sm:max-w-md bg-fortress rounded-t-2xl sm:rounded-2xl border border-superman/30 shadow-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-sheet-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-superman/20">
          <h3 id="share-sheet-title" className="font-bold text-surface-100">Share</h3>
          <button onClick={onClose} className="text-surface-400 hover:text-gold transition-colors p-1 rounded-lg hover:bg-fortress-light" aria-label="Close">
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Track info */}
        <div className="flex items-center gap-3 p-4 border-b border-superman/20">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-superman to-hero flex items-center justify-center shadow-glow-hero overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="" className="w-9 h-9 object-contain" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-surface-100 truncate">{track.title}</p>
            <p className="text-xs text-superman-lighter truncate">{track.artist}</p>
          </div>
        </div>

        {/* Share targets */}
        <div className="p-4 space-y-1">
          <button
            onClick={handleCopy}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-surface-200 hover:bg-fortress-light hover:text-gold transition-colors"
          >
            {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Link className="w-5 h-5" />}
            {copied ? 'Copied!' : 'Copy link'}
          </button>

          <button onClick={handleWhatsApp} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-surface-200 hover:bg-fortress-light hover:text-gold transition-colors">
            <MessageCircle className="w-5 h-5 text-green-400" />
            WhatsApp
          </button>

          <button onClick={handleTelegram} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-surface-200 hover:bg-fortress-light hover:text-gold transition-colors">
            <Send className="w-5 h-5 text-sky" />
            Telegram
          </button>

          <button onClick={handleTwitter} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-surface-200 hover:bg-fortress-light hover:text-gold transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            Twitter / X
          </button>

          <div className="my-2 border-t border-superman/20" />

          <button onClick={handleExportM3U8} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-surface-200 hover:bg-fortress-light hover:text-gold transition-colors">
            <Download className="w-5 h-5 text-superman-lighter" />
            Export as M3U8
          </button>

          <button onClick={handleRingtone} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-surface-200 hover:bg-fortress-light hover:text-hero transition-colors">
            <Music className="w-5 h-5 text-hero" />
            Set as Ringtone
          </button>
        </div>
      </div>
    </div>
  )
}