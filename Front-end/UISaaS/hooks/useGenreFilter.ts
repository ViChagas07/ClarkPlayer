'use client'

import { useMemo, useState, useEffect, useRef, useCallback } from 'react'
import type { CatalogGenreItem } from '@/types'

/**
 * Normalises a string for accent-insensitive comparison.
 * Decomposes Unicode (NFD) and strips combining diacritical marks.
 */
function normalise(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

/**
 * Client-side genre search hook.
 *
 * Features:
 * - 300 ms debounce before filtering
 * - Case-insensitive + accent-insensitive matching
 * - Partial / substring matching
 * - Returns memoised filtered list + search state
 */
export function useGenreFilter(genres: CatalogGenreItem[]) {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)

  // Debounce: 300 ms after the user stops typing
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setDebouncedQuery(query), 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  // Clear search helper
  const clearSearch = useCallback(() => {
    setQuery('')
    setDebouncedQuery('')
  }, [])

  // Blur when Escape is pressed
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        clearSearch()
        ;(e.target as HTMLInputElement).blur()
      }
    },
    [clearSearch],
  )

  // Filtered results — memoised, runs only when debouncedQuery or genres change
  const filtered = useMemo<CatalogGenreItem[]>(() => {
    const trimmed = debouncedQuery.trim()
    if (!trimmed) return genres

    const normalisedQuery = normalise(trimmed)
    return genres.filter((g) => normalise(g.name).includes(normalisedQuery))
  }, [genres, debouncedQuery])

  // Is the user actively searching? (immediate, not debounced)
  const isSearching = query.trim().length > 0

  // Are there any results for the current search?
  const hasResults = filtered.length > 0

  return {
    /** Current raw input value (updates on every keystroke) */
    query,
    /** Setter for the raw input */
    setQuery,
    /** Debounced input value (used for filtering) */
    debouncedQuery,
    /** Whether the search input is focused */
    isFocused,
    /** Focus setter */
    setIsFocused,
    /** Filtered genre list */
    filtered,
    /** True while user has typed anything (immediate) */
    isSearching,
    /** True when the filtered list is non-empty */
    hasResults,
    /** Clear query + debounced */
    clearSearch,
    /** Keyboard handler for Escape */
    handleKeyDown,
  }
}
