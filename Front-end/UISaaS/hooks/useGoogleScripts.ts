'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * Dynamically loads the Google Identity Services (GIS) and Google API Platform (gapi)
 * scripts. Returns flags indicating load state so consumers can show spinners / errors.
 *
 * ── Why two scripts? ──
 * • GIS   (accounts.google.com/gsi/client) — modern OAuth 2.0 token client.
 * • gapi  (apis.google.com/js/api.js)       — legacy loader that exposes `gapi.load('picker', …)`.
 *
 * Google Picker requires both: GIS gives us the access token, gapi initialises the Picker.
 *
 * This hook loads them once and caches their readiness in a stable Promise so multiple
 * components can share the same load cycle.
 */

type ScriptState = 'idle' | 'loading' | 'ready' | 'error'

interface GoogleScriptsResult {
  /** Whether both scripts have finished loading successfully */
  ready: boolean
  /** Human-readable error if load failed */
  error: string | null
  /** True while scripts are still loading */
  loading: boolean
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ''
const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY ?? ''

// ── Module-level cache so the scripts are only injected once across remounts ──
let loadPromise: Promise<boolean> | null = null

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`)
    if (existing) {
      if (existing.dataset.loaded === 'true') return resolve()
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)))
      return
    }

    const script = document.createElement('script')
    script.src = src
    script.async = true
    script.defer = true
    script.dataset.loaded = 'false'
    script.onload = () => {
      script.dataset.loaded = 'true'
      resolve()
    }
    script.onerror = () => reject(new Error(`Failed to load ${src}`))
    document.head.appendChild(script)
  })
}

async function initGoogleAPIs(): Promise<boolean> {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_API_KEY) {
    throw new Error('Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID or NEXT_PUBLIC_GOOGLE_API_KEY')
  }

  // 1. Load GIS (modern token client)
  await loadScript('https://accounts.google.com/gsi/client')

  // 2. Load gapi (contains picker)
  await loadScript('https://apis.google.com/js/api.js')

  // 3. gapi.load('picker', …) must resolve before Picker is usable
  await new Promise<void>((resolve, reject) => {
    const gapi = (window as unknown as { gapi?: { load: (name: string, cb: { callback: () => void; onerror?: (err: unknown) => void }) => void } }).gapi
    if (!gapi) return reject(new Error('gapi not found after script load'))

    gapi.load('picker', {
      callback: resolve,
      onerror: (err: unknown) => reject(new Error(`gapi.load('picker') failed: ${String(err)}`)),
    })
  })

  return true
}

export function useGoogleScripts(): GoogleScriptsResult {
  const [state, setState] = useState<ScriptState>(loadPromise ? 'loading' : 'idle')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (loadPromise) {
      // Already loading (or loaded) — just subscribe
      setState('loading')
      loadPromise
        .then(() => setState('ready'))
        .catch((err: unknown) => {
          setError(err instanceof Error ? err.message : 'Unknown error loading Google scripts')
          setState('error')
        })
      return
    }

    loadPromise = initGoogleAPIs()
    setState('loading')

    loadPromise
      .then(() => setState('ready'))
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Unknown error loading Google scripts')
        setState('error')
        // Clear the promise so retry is possible
        loadPromise = null
      })
  }, [])

  return {
    ready: state === 'ready',
    error,
    loading: state === 'loading' || state === 'idle',
  }
}

export { GOOGLE_CLIENT_ID, GOOGLE_API_KEY }
