// A persistent cache layer for catalog data.
// Uses localStorage to survive page reloads and browser restarts.
// Strategy: Cache First, Network Second — display cached data immediately, refresh in background.

const CACHE_PREFIX = 'clark_catalog_'
const MAX_AGE_MS = 24 * 60 * 60 * 1000 // 24 hours

interface CacheEntry<T = unknown> {
  data: T
  timestamp: number
}

export function getCachedCatalogData<T = unknown>(key: string): T | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key)
    if (!raw) return null
    const entry: CacheEntry<T> = JSON.parse(raw)
    if (Date.now() - entry.timestamp > MAX_AGE_MS) {
      localStorage.removeItem(CACHE_PREFIX + key)
      return null
    }
    return entry.data
  } catch {
    return null
  }
}

export function setCachedCatalogData(key: string, data: unknown): void {
  try {
    const entry: CacheEntry = { data, timestamp: Date.now() }
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry))
  } catch {
    // localStorage full or unavailable — silently ignore
  }
}

export function clearOldCatalogCache(): void {
  try {
    const keys = Object.keys(localStorage)
    for (const key of keys) {
      if (!key.startsWith(CACHE_PREFIX)) continue
      try {
        const raw = localStorage.getItem(key)
        if (!raw) continue
        const entry: CacheEntry = JSON.parse(raw)
        if (Date.now() - entry.timestamp > MAX_AGE_MS) {
          localStorage.removeItem(key)
        }
      } catch {
        localStorage.removeItem(key)
      }
    }
  } catch {
    // localStorage unavailable — silently ignore
  }
}
