'use client'

/**
 * ClarkPlayer Desktop — Audio Engine
 *
 * Uses the Web Audio API to play audio files read by Tauri from the local
 * filesystem. Falls back to a standard <audio> element approach for browser
 * mode (using mock data or backend streaming).
 */
import { useRef, useCallback, useEffect, useState } from 'react'
import { usePlayerStore } from '@/store/playerStore'
import { isTauri, readAudioFile, recordPlay } from '@/lib/desktopApi'
import type { Track } from '@/types'

export function useDesktopAudioEngine() {
  const audioContextRef = useRef<AudioContext | null>(null)
  const audioElementRef = useRef<HTMLAudioElement | null>(null)
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const startTimeRef = useRef<number>(0)
  const startOffsetRef = useRef<number>(0)
  const animationFrameRef = useRef<number>(0)
  const [audioInitialized, setAudioInitialized] = useState(false)

  const {
    currentTrack, isPlaying, volume, progress,
    queue, queueIndex,
    togglePlay, setProgress, nextTrack, prevTrack,
  } = usePlayerStore()

  // Initialize audio context (must be after user gesture)
  const initAudio = useCallback(() => {
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') return
    audioContextRef.current = new AudioContext()
    gainNodeRef.current = audioContextRef.current.createGain()
    analyserRef.current = audioContextRef.current.createAnalyser()
    analyserRef.current.fftSize = 256
    gainNodeRef.current.connect(analyserRef.current)
    analyserRef.current.connect(audioContextRef.current.destination)
    setAudioInitialized(true)
  }, [])

  // Update gain when volume changes
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = volume
    }
  }, [volume])

  // Load and play a track
  const loadAndPlay = useCallback(async (track: Track, startOffset: number = 0) => {
    const trackId = track.id

    if (!isTauri()) {
      // Browser mode: use <audio> element fallback
      if (!audioElementRef.current) {
        audioElementRef.current = new Audio()
      }

      // Catalog tracks → previewUrl (public HTTP URL, no auth needed)
      // Personal uploads → /api/v1/tracks/{id}/stream (requires auth + UUID)
      if (track.previewUrl) {
        audioElementRef.current.src = track.previewUrl
      } else {
        audioElementRef.current.src = `/api/v1/tracks/${trackId}/stream`
      }

      audioElementRef.current.currentTime = startOffset
      audioElementRef.current.play().catch((err: unknown) => {
        console.warn(
          `[AudioEngine] Failed to play track ${trackId}:`,
          (err as Error)?.message ?? err,
        )
      })
      return
    }

    // Tauri mode: read file bytes and decode via Web Audio API
    try {
      const bytes = await readAudioFile(trackId)
      if (!audioContextRef.current) {
        initAudio()
      }

      // Stop any existing playback
      if (sourceNodeRef.current) {
        try { sourceNodeRef.current.stop() } catch { /* already stopped */ }
      }

      const ctx = audioContextRef.current!
      const audioBuffer = await ctx.decodeAudioData(bytes.buffer as ArrayBuffer)

      sourceNodeRef.current = ctx.createBufferSource()
      sourceNodeRef.current.buffer = audioBuffer
      sourceNodeRef.current.connect(gainNodeRef.current!)

      startOffsetRef.current = startOffset
      startTimeRef.current = ctx.currentTime
      sourceNodeRef.current.start(0, startOffset)

      // Record play in local DB
      recordPlay(trackId).catch((err: unknown) => {
        console.warn('[AudioEngine] Failed to record play:', (err as Error)?.message ?? err)
      })

      // Update progress via animation frame
      const updateProgress = () => {
        if (!sourceNodeRef.current) return
        const elapsed = ctx.currentTime - startTimeRef.current + startOffsetRef.current
        setProgress(elapsed)
        animationFrameRef.current = requestAnimationFrame(updateProgress)
      }
      updateProgress()

      sourceNodeRef.current.onended = () => {
        cancelAnimationFrame(animationFrameRef.current)
        if (usePlayerStore.getState().repeatMode === 'one') {
          const current = usePlayerStore.getState().currentTrack
          if (current) loadAndPlay(current, 0)
        } else {
          nextTrack()
        }
      }
    } catch (err) {
      console.error('[AudioEngine] Failed to load audio file:', err)
    }
  }, [initAudio, setProgress, nextTrack])

  // Handle play/pause — skip preview tracks (handled by usePreviewPlayer)
  useEffect(() => {
    if (!currentTrack) return
    if (currentTrack.isPreview) return

    if (isPlaying && audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume()
    }

    if (isPlaying && !sourceNodeRef.current) {
      loadAndPlay(currentTrack, progress)
    }

    if (!isPlaying && audioContextRef.current) {
      audioContextRef.current.suspend()
    }
  }, [isPlaying, currentTrack, progress, loadAndPlay])

  // Handle track changes — skip previews
  useEffect(() => {
    if (currentTrack && isPlaying && !currentTrack.isPreview) {
      loadAndPlay(currentTrack, 0)
    }
  }, [currentTrack?.id])

  // Seek
  const seek = useCallback((timeSeconds: number) => {
    if (!currentTrack) return
    if (sourceNodeRef.current && audioContextRef.current) {
      try { sourceNodeRef.current.stop() } catch {}
      sourceNodeRef.current = null
    }
    setProgress(timeSeconds)
    if (isPlaying) {
      loadAndPlay(currentTrack, timeSeconds)
    }
  }, [currentTrack, isPlaying, loadAndPlay, setProgress])

  // Browser mode audio element sync
  useEffect(() => {
    if (isTauri()) return
    const el = audioElementRef.current
    if (!el) return

    const handleTimeUpdate = () => setProgress(el.currentTime)
    const handleEnded = () => {
      if (usePlayerStore.getState().repeatMode === 'one') {
        el.currentTime = 0
        el.play()
      } else {
        nextTrack()
      }
    }

    el.addEventListener('timeupdate', handleTimeUpdate)
    el.addEventListener('ended', handleEnded)
    return () => {
      el.removeEventListener('timeupdate', handleTimeUpdate)
      el.removeEventListener('ended', handleEnded)
    }
  }, [isTauri(), setProgress, nextTrack])

  // Browser mode: sync play/pause with audio element
  useEffect(() => {
    if (isTauri() || !audioElementRef.current) return
    const el = audioElementRef.current
    if (isPlaying) {
      el.play().catch((err: unknown) => {
        console.warn('[AudioEngine] Browser play failed:', (err as Error)?.message ?? err)
      })
      el.volume = volume
    } else {
      el.pause()
    }
  }, [isPlaying, volume, isTauri()])

  // Browser mode: seek
  useEffect(() => {
    if (isTauri() || !audioElementRef.current) return
    if (Math.abs(audioElementRef.current.currentTime - progress) > 1) {
      audioElementRef.current.currentTime = progress
    }
  }, [isTauri(), progress])

  return {
    initAudio,
    seek,
    audioInitialized,
    isDesktopMode: isTauri(),
  }
}
