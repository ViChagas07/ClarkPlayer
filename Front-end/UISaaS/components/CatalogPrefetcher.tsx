'use client'

import { useEffect } from 'react'
import { queryClient } from '@/lib/queryClient'
import { api } from '@/lib/api'
import { useQuery } from '@tanstack/react-query'

/**
 * Pre-warms the React Query cache on app load so every page renders
 * instantly on navigation.  All prefetches are non-blocking — the UI
 * renders immediately regardless of prefetch progress.
 */
export function CatalogPrefetcher() {
  // ── Discovery (Home page) — 5min stale, 1h refetch interval ──
  useQuery({
    queryKey: ['catalog', 'discovery'],
    queryFn: () => api.catalogDiscovery(),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 30 * 60 * 1000,
    enabled: true,
  })

  // ── Artists (first page) — 5min stale ──
  useQuery({
    queryKey: ['catalog', 'artists', 30, 0, 'popularity'],
    queryFn: () => api.catalogArtists(30, 0, 'popularity'),
    staleTime: 5 * 60 * 1000,
    enabled: true,
  })

  // ── Genres — 2h stale (rarely changes) ──
  useQuery({
    queryKey: ['catalog', 'genres'],
    queryFn: () => api.catalogGenres(),
    staleTime: 2 * 60 * 60 * 1000,
    enabled: true,
  })

  return null
}
