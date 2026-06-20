'use client'

import { useEffect } from 'react'
import { queryClient } from '@/lib/queryClient'
import { api } from '@/lib/api'

export function CatalogPrefetcher() {
  useEffect(() => {
    queryClient.prefetchQuery({
      queryKey: ['catalog', 'artists', 30, 0, 'popularity'],
      queryFn: () => api.catalogArtists(30, 0, 'popularity'),
      staleTime: 6 * 60 * 60 * 1000,
    })
    // NOTE: genres uses useInfiniteQuery — do NOT prefetch with prefetchQuery
    // here as it would conflict with useInfiniteQuery's different cache structure
    // ({ pages: [...] } vs raw response). The useGenres hook handles its own fetch.
  }, [])

  return null
}
