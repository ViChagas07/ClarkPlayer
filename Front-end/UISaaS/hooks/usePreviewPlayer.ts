'use client'

import { useRef, useEffect } from 'react'
import { usePlayerStore } from '@/store/playerStore'

export function usePreviewPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const { isPreview, isPlaying, currentTrack, volume, setProgress, stopPreview } = usePlayerStore()

  const previewUrl = currentTrack?.previewUrl

  // Play / pause preview
  useEffect(() => {
    if (!isPreview || !previewUrl) return

    // Create audio element if needed
    if (!audioRef.current) {
      audioRef.current = new Audio()
    }

    const audio = audioRef.current

    if (isPlaying) {
      // Stop any previous playback
      audio.pause()
      audio.currentTime = 0
      audio.src = previewUrl
      audio.volume = volume
      audio.play().catch(() => {})
    } else {
      audio.pause()
    }

    return () => {
      audio.pause()
    }
  }, [isPreview, isPlaying, previewUrl])

  // Sync volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  // Progress tracking
  useEffect(() => {
    if (!isPreview || !audioRef.current) return

    const audio = audioRef.current

    const onTimeUpdate = () => {
      setProgress(audio.currentTime)
    }
    const onEnded = () => {
      stopPreview()
    }

    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('ended', onEnded)
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('ended', onEnded)
    }
  }, [isPreview, setProgress, stopPreview])

  return { previewActive: isPreview && isPlaying }
}
