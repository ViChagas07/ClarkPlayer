'use client'

import { useEffect } from 'react'
import { useSettingsStore } from '@/store/settingsStore'
import { useAuthStore } from '@/store/authStore'

export function SleepTimerRestore() {
  const setSleepTimer = useSettingsStore((s) => s.setSleepTimer)
  const accessToken = useAuthStore((s) => s.accessToken)

  useEffect(() => {
    // Only restore sleep timer for authenticated users
    if (!accessToken) return

    async function restore() {
      try {
        const res = await fetch('/api/v1/player/sleep-timer', {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        if (res.ok) {
          const data = await res.json()
          if (data.expires_at != null) {
            const now = Date.now()
            if (data.expires_at > now) {
              setSleepTimer(data.expires_at)
            } else {
              await fetch('/api/v1/player/sleep-timer', {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${accessToken}` },
              })
              setSleepTimer(null)
            }
          }
        }
      } catch {
        // Silently ignore — timer will be null on error
      }
    }

    restore()
  }, [setSleepTimer, accessToken])

  return null
}