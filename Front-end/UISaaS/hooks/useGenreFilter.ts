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
 * NEW BEHAVIOUR (Hotfix):
 * ALL genres are ALWAYS rendered. Instead of filtering the grid, we
 * compute a Set of matching slugs. The page then applies distinct
 * visual treatment:
 *   - Matching genres → clear, scale(1.02), elevated
 *   - Non-matching genres → blur(8px), opacity 0.25, scale(0.96), no pointer
 *
 * Features:
 * - 300 ms debounce before matching
 * - Case-insensitive + accent-insensitive matching
 * - Partial / substring matching
 * - Returns matchingSlugs Set + search state
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

  // Escape key handler
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        clearSearch()
        ;(e.target as HTMLInputElement).blur()
      }
    },
    [clearSearch],
  )

  // ── Matching slugs (memoised, based on debounced query) ─────────────
  const matchingSlugs = useMemo<Set<string>>(() => {
    const trimmed = debouncedQuery.trim()
    if (!trimmed) return new Set<string>()

    const normalisedQuery = normalise(trimmed)
    const slugs = new Set<string>()
    for (const g of genres) {
      if (normalise(g.name).includes(normalisedQuery)) {
        slugs.add(g.slug)
      }
    }
    return slugs
  }, [genres, debouncedQuery])

  // ── Derived state ──────────────────────────────────────────────────

  /** True while user has typed anything (immediate — not debounced) */
  const isSearching = query.trim().length > 0

  /** True when at least one genre matches the debounced query */
  const hasResults = matchingSlugs.size > 0

  return {
    /** Current raw input value (updates on every keystroke) */
    query,
    /** Setter for the raw input */
    setQuery,
    /** Debounced input value (used for matching) */
    debouncedQuery,
    /** Whether the search input is focused */
    isFocused,
    /** Focus setter */
    setIsFocused,
    /** Set of genre slugs that match the debounced query */
    matchingSlugs,
    /** True while user has typed anything (immediate) */
    isSearching,
    /** True when at least one genre matches */
    hasResults,
    /** Clear query + debounced */
    clearSearch,
    /** Keyboard handler for Escape */
    handleKeyDown,
  }
}
