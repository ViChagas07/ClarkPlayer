'use client'

import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
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

export function useDiscovery() {
  return useQuery<CatalogDiscoveryResponse>({
    queryKey: ['catalog', 'discovery'],
    queryFn: () => api.catalogDiscovery(),
    staleTime: 5 * 60 * 1000,
  })
}

// ── Search ────────────────────────────────────────────────────────────

export function useCatalogSearch(query: string, limit: number = 20) {
  return useQuery<CatalogSearchResponse>({
    queryKey: ['catalog', 'search', query, limit],
    queryFn: () => api.catalogSearch(query, limit),
    enabled: query.length >= 2,
    staleTime: 2 * 60 * 1000,
  })
}

// ── Artists ───────────────────────────────────────────────────────────

export function useArtists(limit: number = 30, offset: number = 0, sort: string = 'popularity') {
  return useQuery<CatalogListResponse<CatalogArtistItem>>({
    queryKey: ['catalog', 'artists', limit, offset, sort],
    queryFn: () => api.catalogArtists(limit, offset, sort),
    staleTime: 5 * 60 * 1000,
  })
}

export function useArtist(artistId: string) {
  return useQuery<CatalogArtistResponse>({
    queryKey: ['catalog', 'artist', artistId],
    queryFn: () => api.catalogArtist(artistId),
    enabled: !!artistId,
    staleTime: 10 * 60 * 1000,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  })
}

export function useArtistTracks(artistId: string, limit: number = 30, offset: number = 0) {
  return useQuery<CatalogListResponse<CatalogTrackItem>>({
    queryKey: ['catalog', 'artist-tracks', artistId, limit, offset],
    queryFn: () => api.catalogArtistTracks(artistId, limit, offset),
    enabled: !!artistId,
    staleTime: 5 * 60 * 1000,
  })
}

export function useArtistAlbums(artistId: string) {
  return useQuery<CatalogAlbumItem[]>({
    queryKey: ['catalog', 'artist-albums', artistId],
    queryFn: () => api.catalogArtistAlbums(artistId),
    enabled: !!artistId,
    staleTime: 10 * 60 * 1000,
  })
}

// ── Albums ────────────────────────────────────────────────────────────

export function useAlbum(albumId: string) {
  return useQuery<CatalogAlbumResponse>({
    queryKey: ['catalog', 'album', albumId],
    queryFn: () => api.catalogAlbum(albumId),
    enabled: !!albumId,
    staleTime: 10 * 60 * 1000,
  })
}

export function useAlbumTracks(albumId: string) {
  return useQuery<CatalogTrackItem[]>({
    queryKey: ['catalog', 'album-tracks', albumId],
    queryFn: () => api.catalogAlbumTracks(albumId),
    enabled: !!albumId,
    staleTime: 10 * 60 * 1000,
  })
}

// ── Track ─────────────────────────────────────────────────────────────

export function useTrack(trackId: string) {
  return useQuery<CatalogTrackResponse>({
    queryKey: ['catalog', 'track', trackId],
    queryFn: () => api.catalogTrack(trackId),
    enabled: !!trackId,
    staleTime: 5 * 60 * 1000,
  })
}

// ── Genres ────────────────────────────────────────────────────────────

export function useGenres() {
  return useQuery<CatalogGenreItem[]>({
    queryKey: ['catalog', 'genres'],
    queryFn: () => api.catalogGenres(),
    staleTime: 2 * 60 * 60 * 1000,
  })
}

export function useGenre(slug: string) {
  return useQuery<CatalogGenreItem>({
    queryKey: ['catalog', 'genre', slug],
    queryFn: () => api.catalogGenre(slug),
    enabled: !!slug,
    staleTime: 2 * 60 * 60 * 1000,
  })
}

export function useGenreTracks(slug: string, limit: number = 30, offset: number = 0) {
  return useQuery<CatalogListResponse<CatalogTrackItem>>({
    queryKey: ['catalog', 'genre-tracks', slug, limit, offset],
    queryFn: () => api.catalogGenreTracks(slug, limit, offset),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  })
}

// ── Brazilian ─────────────────────────────────────────────────────────

export function useBrazilianArtists(limit: number = 20, offset: number = 0) {
  return useQuery<CatalogListResponse<CatalogArtistItem>>({
    queryKey: ['catalog', 'brazilian', limit, offset],
    queryFn: () => api.catalogBrazilian(limit, offset),
    staleTime: 10 * 60 * 1000,
  })
}

// ── Autocomplete ──────────────────────────────────────────────────────

export function useAutocomplete(query: string) {
  return useQuery<CatalogAutocompleteResponse>({
    queryKey: ['catalog', 'autocomplete', query],
    queryFn: () => api.catalogAutocomplete(query),
    enabled: query.length >= 2,
    staleTime: 60 * 1000,
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
