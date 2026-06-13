'use client'

import { useEffect, useState, useRef } from 'react'

/**
 * useDeferredImport — Defers loading of heavy components until after
 * the browser is idle (requestIdleCallback) or after a specified delay.
 *
 * This dramatically improves TBT (Total Blocking Time) by keeping
 * the main thread free during initial page load.
 */
export function useDeferredImport(delayMs = 0) {
  const [shouldLoad, setShouldLoad] = useState(false)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    if (typeof window === 'undefined') {
      setShouldLoad(true)
      return
    }

    const load = () => {
      if (typeof window.requestIdleCallback === 'function') {
        window.requestIdleCallback(
          () => setShouldLoad(true),
          { timeout: Math.max(delayMs, 2000) }
        )
      } else {
        rafRef.current = window.setTimeout(() => setShouldLoad(true), delayMs)
      }
    }

    if (delayMs > 0) {
      rafRef.current = window.setTimeout(load, delayMs)
    } else {
      load()
    }

    return () => {
      if (rafRef.current) {
        clearTimeout(rafRef.current)
      }
    }
  }, [delayMs])

  return shouldLoad
}

/**
 * Component that lazily renders children after idle.
 * Wrap expensive components (like audio visualizers, lyrics panels,
 * complex grids) with this to improve initial load performance.
 */
export function DeferredRender({
  children,
  delayMs = 0,
  fallback = null,
}: {
  children: React.ReactNode
  delayMs?: number
  fallback?: React.ReactNode
}) {
  const shouldLoad = useDeferredImport(delayMs)

  if (!shouldLoad) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
