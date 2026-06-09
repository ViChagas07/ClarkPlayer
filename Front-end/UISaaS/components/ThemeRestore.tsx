'use client'

import { useEffect } from 'react'

export function ThemeRestore() {
  useEffect(() => {
    const saved = localStorage.getItem('clark_theme') as 'dark' | 'light' | 'midnight' | null
    if (saved) {
      document.documentElement.dataset.theme = saved
    }
  }, [])

  return null
}