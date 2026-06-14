'use client'

import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { queryClient } from '@/lib/queryClient'
import type {
  CatalogDiscoveryResponse,
  CatalogSearchResponse,
  CatalogListResponse,
  CatalogArtistItem,
  CatalogArtistResponse,
  CatalogAlbumResponse,
  CatalogAlbumItem,
  CatalogTrackResponse,
  CatalogGenreItem,
  CatalogTrackItem,
  CatalogAutocompleteResponse,
} from '@/types'

// ── Discovery ─────────────────────────────────────────────────────────

const DISCOVERY_KEY = ['catalog', 'discovery']

export function useDiscovery() {
  return useQuery<CatalogDiscoveryResponse>({
    queryKey: DISCOVERY_KEY,
    queryFn: () => api.catalogDiscovery(),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 30 * 60 * 1000,
    placeholderData: queryClient.getQueryData<CatalogDiscoveryResponse>(DISCOVERY_KEY),
  })
}

// ── Search ────────────────────────────────────────────────────────────

export function useCatalogSearch(query: string, limit: number = 20) {
  const qKey = ['catalog', 'search', query, limit]
  return useQuery<CatalogSearchResponse>({
    queryKey: qKey,
    queryFn: () => api.catalogSearch(query, limit),
    enabled: query.length >= 2,
    staleTime: 2 * 60 * 1000,
    placeholderData: queryClient.getQueryData<CatalogSearchResponse>(qKey),
  })
}

// ── Artists ───────────────────────────────────────────────────────────

export function useArtists(limit: number = 30, offset: number = 0, sort: string = 'popularity') {
  const qKey = ['catalog', 'artists', limit, offset, sort]
  return useQuery<CatalogListResponse<CatalogArtistItem>>({
    queryKey: qKey,
    queryFn: () => api.catalogArtists(limit, offset, sort),
    staleTime: 5 * 60 * 1000,
    placeholderData: queryClient.getQueryData<CatalogListResponse<CatalogArtistItem>>(qKey),
  })
}

export function useArtist(artistId: string) {
  const qKey = ['catalog', 'artist', artistId]
  return useQuery<CatalogArtistResponse>({
    queryKey: qKey,
    queryFn: () => api.catalogArtist(artistId),
    enabled: !!artistId,
    staleTime: 10 * 60 * 1000,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  })
}

export function useArtistTracks(artistId: string, limit: number = 30, offset: number = 0) {
  const qKey = ['catalog', 'artist-tracks', artistId, limit, offset]
  return useQuery<CatalogListResponse<CatalogTrackItem>>({
    queryKey: qKey,
    queryFn: () => api.catalogArtistTracks(artistId, limit, offset),
    enabled: !!artistId,
    staleTime: 5 * 60 * 1000,
    placeholderData: queryClient.getQueryData<CatalogListResponse<CatalogTrackItem>>(qKey),
  })
}

export function useArtistAlbums(artistId: string) {
  const qKey = ['catalog', 'artist-albums', artistId]
  return useQuery<CatalogAlbumItem[]>({
    queryKey: qKey,
    queryFn: () => api.catalogArtistAlbums(artistId),
    enabled: !!artistId,
    staleTime: 10 * 60 * 1000,
    placeholderData: queryClient.getQueryData<CatalogAlbumItem[]>(qKey),
  })
}

// ── Albums ────────────────────────────────────────────────────────────

export function useAlbum(albumId: string) {
  const qKey = ['catalog', 'album', albumId]
  return useQuery<CatalogAlbumResponse>({
    queryKey: qKey,
    queryFn: () => api.catalogAlbum(albumId),
    enabled: !!albumId,
    staleTime: 10 * 60 * 1000,
    placeholderData: queryClient.getQueryData<CatalogAlbumResponse>(qKey),
  })
}

export function useAlbumTracks(albumId: string) {
  const qKey = ['catalog', 'album-tracks', albumId]
  return useQuery<CatalogTrackItem[]>({
    queryKey: qKey,
    queryFn: () => api.catalogAlbumTracks(albumId),
    enabled: !!albumId,
    staleTime: 10 * 60 * 1000,
    placeholderData: queryClient.getQueryData<CatalogTrackItem[]>(qKey),
  })
}

// ── Track ─────────────────────────────────────────────────────────────

export function useTrack(trackId: string) {
  const qKey = ['catalog', 'track', trackId]
  return useQuery<CatalogTrackResponse>({
    queryKey: qKey,
    queryFn: () => api.catalogTrack(trackId),
    enabled: !!trackId,
    staleTime: 5 * 60 * 1000,
    placeholderData: queryClient.getQueryData<CatalogTrackResponse>(qKey),
  })
}

// ── Genres ────────────────────────────────────────────────────────────

export function useGenres() {
  const qKey = ['catalog', 'genres']
  return useQuery<CatalogGenreItem[]>({
    queryKey: qKey,
    queryFn: () => api.catalogGenres(),
    staleTime: 2 * 60 * 60 * 1000,
    placeholderData: queryClient.getQueryData<CatalogGenreItem[]>(qKey),
  })
}

export function useGenre(slug: string) {
  const qKey = ['catalog', 'genre', slug]
  return useQuery<CatalogGenreItem>({
    queryKey: qKey,
    queryFn: () => api.catalogGenre(slug),
    enabled: !!slug,
    staleTime: 2 * 60 * 60 * 1000,
    placeholderData: queryClient.getQueryData<CatalogGenreItem>(qKey),
  })
}

export function useGenreTracks(slug: string, limit: number = 30, offset: number = 0) {
  const qKey = ['catalog', 'genre-tracks', slug, limit, offset]
  return useQuery<CatalogListResponse<CatalogTrackItem>>({
    queryKey: qKey,
    queryFn: () => api.catalogGenreTracks(slug, limit, offset),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
    placeholderData: queryClient.getQueryData<CatalogListResponse<CatalogTrackItem>>(qKey),
  })
}

// ── Brazilian ─────────────────────────────────────────────────────────

export function useBrazilianArtists(limit: number = 20, offset: number = 0) {
  const qKey = ['catalog', 'brazilian', limit, offset]
  return useQuery<CatalogListResponse<CatalogArtistItem>>({
    queryKey: qKey,
    queryFn: () => api.catalogBrazilian(limit, offset),
    staleTime: 10 * 60 * 1000,
    placeholderData: queryClient.getQueryData<CatalogListResponse<CatalogArtistItem>>(qKey),
  })
}

// ── Autocomplete ──────────────────────────────────────────────────────

export function useAutocomplete(query: string) {
  const qKey = ['catalog', 'autocomplete', query]
  return useQuery<CatalogAutocompleteResponse>({
    queryKey: qKey,
    queryFn: () => api.catalogAutocomplete(query),
    enabled: query.length >= 2,
    staleTime: 60 * 1000,
    placeholderData: queryClient.getQueryData<CatalogAutocompleteResponse>(qKey),
  })
}

// ── Infinite Artists ──────────────────────────────────────────────────

export function useInfiniteArtists(pageSize: number = 30) {
  return useInfiniteQuery<CatalogListResponse<CatalogArtistItem>>({
    queryKey: ['catalog', 'artists', 'infinite'],
    queryFn: ({ pageParam }) => api.catalogArtists(pageSize, pageParam as number),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const nextOffset = lastPage.offset + lastPage.limit
      return nextOffset < lastPage.total ? nextOffset : undefined
    },
    staleTime: 5 * 60 * 1000,
  })
}
