'use client'

import { useEffect } from 'react'
import { useSettingsStore } from '@/store/settingsStore'

export function SleepTimerRestore() {
  const setSleepTimer = useSettingsStore((s) => s.setSleepTimer)

  useEffect(() => {
    async function restore() {
      try {
        const res = await fetch('/api/v1/player/sleep-timer')
        if (res.ok) {
          const data = await res.json()
          if (data.expires_at != null) {
            const now = Date.now()
            if (data.expires_at > now) {
              // Still in the future — restore it
              setSleepTimer(data.expires_at)
            } else {
              // Already expired — clean up
              await fetch('/api/v1/player/sleep-timer', { method: 'DELETE' })
              setSleepTimer(null)
            }
          }
        }
      } catch {
        // Silently ignore — timer will be null on error
      }
    }

    restore()
  }, [setSleepTimer])

  return null
}