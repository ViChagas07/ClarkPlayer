'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { X, Edit2, Save, Sparkles, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LyricLine } from '@/types'
import { api } from '@/lib/api'

interface LyricsDrawerProps {
  isOpen: boolean
  onClose: () => void
  trackTitle?: string
  trackMbid?: string
}

export function LyricsDrawer({ isOpen, onClose, trackTitle, trackMbid }: LyricsDrawerProps) {
  const [lyrics, setLyrics] = useState<LyricLine[]>([])
  const [lyricsLoading, setLyricsLoading] = useState(false)
  const [lyricsLoaded, setLyricsLoaded] = useState(false)
  const [karaokeMode, setKaraokeMode] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [lyricsText, setLyricsText] = useState('')
  const [currentTime, setCurrentTime] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const activeLineRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    setLyrics([])
    setLyricsLoaded(false)
    setCurrentTime(0)

    if (trackMbid) {
      let cancelled = false
      setLyricsLoading(true)

      async function fetchLyrics() {
        try {
          const data = await api.musicTrack(trackMbid!)
          if (cancelled) return

          if (data.lyrics) {
            const lines: LyricLine[] = data.lyrics.split('\n').map((text, i) => ({
              timestamp: i * 4,
              text: text.trim(),
            }))
            setLyrics(lines)
            setLyricsLoaded(true)
            return
          }
        } catch {
          // Fall through to localStorage
        }

        if (cancelled) return

        // Try localStorage
        const key = `clark_lyrics_${trackTitle}`
        const stored = localStorage.getItem(key)
        if (stored) {
          try {
            const parsed: LyricLine[] = JSON.parse(stored)
            if (Array.isArray(parsed) && parsed.length > 0) {
              setLyrics(parsed)
              setLyricsLoaded(true)
              return
            }
          } catch { /* ignore */ }
        }

        if (cancelled) return
        setLyrics([])
        setLyricsLoaded(true)
      }

      fetchLyrics()
      return () => { cancelled = true }
    } else {
      // No mbid: try localStorage only
      const key = `clark_lyrics_${trackTitle}`
      const stored = localStorage.getItem(key)
      if (stored) {
        try {
          const parsed: LyricLine[] = JSON.parse(stored)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setLyrics(parsed)
            setLyricsLoaded(true)
            return
          }
        } catch { /* ignore */ }
      }
      setLyrics([])
      setLyricsLoaded(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, trackMbid, trackTitle])

  // Fake time counter — only runs when there are real lyrics to display
  useEffect(() => {
    if (!isOpen || lyrics.length === 0) return
    const maxTime = lyrics[lyrics.length - 1].timestamp + 4
    const interval = setInterval(() => {
      setCurrentTime((t) => (t >= maxTime ? 0 : t + 0.5))
    }, 500)
    return () => clearInterval(interval)
  }, [isOpen, lyrics])

  const activeIndex = lyrics.reduce((acc, line, i) => {
    if (currentTime >= line.timestamp) return i
    return acc
  }, 0)

  useEffect(() => {
    if (!karaokeMode && activeLineRef.current && containerRef.current) {
      const container = containerRef.current
      const line = activeLineRef.current
      const containerRect = container.getBoundingClientRect()
      const lineRect = line.getBoundingClientRect()
      if (lineRect.top < containerRect.top || lineRect.bottom > containerRect.bottom) {
        line.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, [activeIndex, karaokeMode])

  useEffect(() => {
    if (editMode) {
      setLyricsText(lyrics.map((l) => l.text).join('\n'))
    }
  }, [editMode, lyrics])

  const handleSave = useCallback(() => {
    const lines = lyricsText.split('\n').map((text, i) => ({
      timestamp: lyrics[i]?.timestamp ?? i * 4,
      text,
    }))
    localStorage.setItem(`clark_lyrics_${trackTitle}`, JSON.stringify(lines))
    setLyrics(lines)
    setEditMode(false)
  }, [lyricsText, trackTitle, lyrics])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-modal bg-clark-bg-secondary/95 backdrop-blur-xl flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-clark-steel/20">
        <div>
          <h2 className="font-display tracking-wider text-lg text-clark-text-primary">Lyrics</h2>
          {trackTitle && <p className="font-body text-sm text-clark-text-muted">{trackTitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {lyrics.length > 0 && (
            <button
              onClick={() => setKaraokeMode(!karaokeMode)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg font-condensed text-xs uppercase tracking-widest transition-all',
                karaokeMode
                  ? 'bg-clark-gold text-clark-shadow shadow-glow-gold'
                  : 'bg-clark-bg-card text-clark-text-muted hover:text-clark-gold border border-clark-steel/30 hover:border-clark-gold/40',
              )}
            >
              <Sparkles className="w-4 h-4" />
              Karaoke
            </button>
          )}
          {lyrics.length > 0 && (
            <button
              onClick={() => editMode ? handleSave() : setEditMode(true)}
              className="p-2 text-clark-text-muted hover:text-clark-gold transition-colors rounded-lg hover:bg-clark-bg-card"
              aria-label={editMode ? 'Save lyrics' : 'Edit lyrics'}
            >
              {editMode ? <Save className="w-5 h-5" /> : <Edit2 className="w-5 h-5" />}
            </button>
          )}
          <button onClick={onClose} className="p-2 text-clark-text-muted hover:text-clark-text-primary transition-colors rounded-lg hover:bg-clark-bg-card" aria-label="Close lyrics">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {lyricsLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 text-clark-accent animate-spin" />
          </div>
        ) : !lyricsLoaded ? (
          <div className="flex items-center justify-center h-full" />
        ) : lyrics.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-6 text-center">
            <p className="font-display text-xl tracking-wider text-clark-text-primary mb-2">No lyrics available for this track</p>
            {trackTitle && (
              <p className="font-body text-sm text-clark-text-muted">{trackTitle}</p>
            )}
          </div>
        ) : karaokeMode ? (
          <div className="flex flex-col items-center justify-center h-full px-4 sm:px-12 text-center">
            {activeIndex > 0 && (
              <p className="font-body text-lg sm:text-xl text-clark-text-muted mb-4 transition-all duration-500 -translate-y-4 opacity-50">
                {lyrics[activeIndex - 1]?.text}
              </p>
            )}
            <p className="font-display text-3xl sm:text-5xl tracking-widest uppercase text-clark-gold transition-all duration-300 scale-105 animate-gold-pulse break-words max-w-full">
              {lyrics[activeIndex]?.text || '...'}
            </p>
            {activeIndex < lyrics.length - 1 && (
              <p className="font-body text-xl text-clark-text-muted mt-4 transition-all duration-500 translate-y-4 opacity-50">
                {lyrics[activeIndex + 1]?.text}
              </p>
            )}
          </div>
        ) : editMode ? (
          <div className="h-full p-6">
            <textarea
              value={lyricsText}
              onChange={(e) => setLyricsText(e.target.value)}
              className="w-full h-full bg-transparent font-body text-lg leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-clark-gold/30 rounded-lg p-4 border border-clark-steel/20 text-clark-text-primary"
              placeholder="Enter lyrics..."
            />
          </div>
        ) : (
          <div ref={containerRef} className="h-full overflow-y-auto px-6 py-8 space-y-3">
            {lyrics.map((line, i) => (
              <div
                key={i}
                ref={i === activeIndex ? activeLineRef : null}
                className={cn(
                  'font-body text-lg transition-all duration-300 py-1',
                  i === activeIndex
                    ? 'text-clark-gold font-bold scale-105'
                    : line.text === ''
                    ? 'h-6'
                    : 'text-clark-text-muted/70',
                  i === activeIndex ? 'text-clark-gold' : 'text-clark-text-muted',
                )}
              >
                {line.text || '\u00A0'}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
