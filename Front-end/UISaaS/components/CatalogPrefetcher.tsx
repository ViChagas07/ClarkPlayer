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
    queryClient.prefetchQuery({
      queryKey: ['catalog', 'genres'],
      queryFn: () => api.catalogGenres(),
      staleTime: 12 * 60 * 60 * 1000,
    })
  }, [])

  return null
}
