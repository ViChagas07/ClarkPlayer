import type {
  AvatarUploadResponse,
  GoogleCallbackRequest,
  GoogleCallbackResponse,
  HealthResponse,
  LoginRequest,
  LogoutRequest,
  LogoutResponse,
  PlaylistResponse,
  RegisterRequest,
  TokenResponse,
  TrackListResponse,
  TrackResponse,
  UpdateProfileRequest,
  UserResponse,
  VerifyEmailRequest,
  VerifyEmailResponse,
  ResendVerificationRequest,
  ResendVerificationResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  UnifiedSearchResponse,
  UnifiedSearchResult,
  UnifiedTrackResponse,
  UnifiedArtistResponse,
  SimilarArtistsResponse,
  CatalogDiscoveryResponse,
  CatalogDiscoverySection,
  CatalogSearchResponse,
  CatalogListResponse,
  CatalogArtistItem,
  CatalogArtistResponse,
  CatalogAlbumResponse,
  CatalogTrackResponse,
  CatalogGenreItem,
  CatalogTrackItem,
  CatalogAlbumItem,
  CatalogAutocompleteResponse,
} from '@/types'

class ApiError extends Error {
  status: number
  body: unknown

  constructor(message: string, status: number, body: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

// ── Token refresh interceptor ─────────────────────────────────────────────
let _refreshPromise: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  // Dynamically import to avoid circular dependency at module level
  const { useAuthStore } = await import('@/store/authStore')
  const { refreshToken } = useAuthStore.getState()

  if (!refreshToken) return null

  try {
    const res = await fetch('/api/v1/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })

    if (!res.ok) {
      // Refresh failed — clear session
      useAuthStore.getState().clearSession()
      return null
    }

    const data: TokenResponse = await res.json()
    const { user } = useAuthStore.getState()
    useAuthStore.getState().setSession(
      data.access_token,
      data.refresh_token,
      user as UserResponse,
    )
    return data.access_token
  } catch {
    useAuthStore.getState().clearSession()
    return null
  }
}

/** Throttle to a single in-flight refresh; queue other callers */
function getOrCreateRefresh(): Promise<string | null> {
  if (!_refreshPromise) {
    _refreshPromise = refreshAccessToken().finally(() => {
      _refreshPromise = null
    })
  }
  return _refreshPromise
}

async function _fetch<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(input, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers,
      },
    })
  } catch (networkErr) {
    const msg = networkErr instanceof Error ? networkErr.message : String(networkErr)
    console.error('[ClarkPlayer] Network error:', msg)
    throw new ApiError(`Network error: ${msg}`, 0, null)
  }

  // ── Auto-refresh on 401 ─────────────────────────────────────────
  if (response.status === 401) {
    const newToken = await getOrCreateRefresh()
    if (newToken) {
      // Retry the original request with the fresh token
      const retryInit = {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          ...init?.headers,
          Authorization: `Bearer ${newToken}`,
        },
      }
      response = await fetch(input, retryInit)
    }
  }

  if (!response.ok) {
    const contentType = response.headers.get('content-type') ?? ''
    let body: unknown = {}
    let errorMessage = 'Request failed'

    if (contentType.includes('application/json')) {
      body = await response.json().catch(() => ({}))
      const b = body as Record<string, unknown>
      errorMessage = String(b.message || b.detail || `HTTP ${response.status}`)
    } else {
      // Non-JSON response (crash, proxy error, cold-start page, etc.)
      const text = await response.text().catch(() => '')
      errorMessage = `HTTP ${response.status}: ${text.slice(0, 120) || 'empty response'}`
    }

    throw new ApiError(errorMessage, response.status, body)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

function authHeader(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` }
}

// ── iTunes Search API helpers (standalone — no backend needed) ──────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function iTunesToUnified(raw: any): UnifiedSearchResult {
  const trackName: string = raw.trackName ?? raw.collectionName ?? ''
  const artistName: string = raw.artistName ?? ''
  const albumName: string = raw.collectionName ?? ''
  const artwork: string = raw.artworkUrl100?.replace('100x100', '600x600') ?? raw.artworkUrl60?.replace('60x60', '600x600') ?? ''
  const preview: string | null = raw.previewUrl ?? null
  const duration: number | null = raw.trackTimeMillis ?? null
  const genres: string[] = raw.primaryGenreName ? [raw.primaryGenreName] : []

  return {
    type: 'track' as const,
    track: {
      title: trackName,
      duration,
      mbid: raw.trackId ? String(raw.trackId) : null,
      spotify_id: null,
      preview_url: preview,
    },
    artist: {
      name: artistName,
      bio: null,
      mbid: raw.artistId ? String(raw.artistId) : null,
      spotify_id: null,
      image_url: null,
      similar: [],
      tags: [],
    },
    album: {
      title: albumName,
      cover_url: artwork || null,
      release_date: raw.releaseDate ?? null,
      country: raw.country ?? null,
      mbid: null,
    },
    audio_features: null,
    popularity: 0,
    playcount: 0,
    genres,
    cover_url: artwork || null,
  }
}

/**
 * Direct iTunes Search API call.
 * Public, free, no API key required, CORS-enabled.
 * Returns preview URLs (30-second clips) for most tracks.
 */
export async function musicSearchITunes(query: string, limit: number = 8): Promise<UnifiedSearchResponse> {
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&limit=${limit}&entity=song`
  const response = await fetch(url)
  if (!response.ok) throw new Error(`iTunes API error: ${response.status}`)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await response.json() as { resultCount: number; results: any[] }

  const tracks: UnifiedSearchResult[] = (data.results ?? []).map((r) => iTunesToUnified(r))

  // Also search for artists — with album artwork lookup
  const artistUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&limit=${Math.max(1, Math.floor(limit / 2))}&entity=musicArtist`
  let artists: UnifiedSearchResult[] = []
  try {
    const artistRes = await fetch(artistUrl)
    if (artistRes.ok) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const artistData = await artistRes.json() as { resultCount: number; results: any[] }
      const rawArtists = artistData.results ?? []

      // ── Batch-fetch album artwork for each artist ──────
      const artworkMap = new Map<string, string>()
      const artworkPromises = rawArtists
        .filter((r: { artistId?: number }) => r.artistId)
        .map(async (r: { artistId: number; artistName?: string }) => {
          try {
            const albumUrl = `https://itunes.apple.com/lookup?id=${r.artistId}&entity=album&limit=1`
            const albumRes = await fetch(albumUrl)
            if (albumRes.ok) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const albumData = await albumRes.json() as { results?: any[] }
              const firstAlbum = (albumData.results ?? []).find((a: { wrapperType?: string }) => a.wrapperType === 'collection')
              if (firstAlbum?.artworkUrl100) {
                artworkMap.set(String(r.artistId), firstAlbum.artworkUrl100.replace('100x100', '600x600'))
              }
            }
          } catch { /* skip */ }
        })
      await Promise.allSettled(artworkPromises)

      // ── Map to UnifiedSearchResult ─────────────────────
      artists = rawArtists.map((r: { artistId?: number; artistName?: string; primaryGenreName?: string; artistLinkUrl?: string }) => {
        const id = r.artistId ? String(r.artistId) : null
        const artwork = id ? (artworkMap.get(id) ?? null) : null
        return {
          type: 'artist' as const,
          track: null,
          artist: {
            name: r.artistName ?? '',
            bio: null,
            mbid: id,
            spotify_id: null,
            image_url: artwork,
            similar: [],
            tags: r.primaryGenreName ? [r.primaryGenreName] : [],
          },
          album: null,
          audio_features: null,
          popularity: 0,
          playcount: 0,
          genres: r.primaryGenreName ? [r.primaryGenreName] : [],
          cover_url: artwork,
        }
      })
    }
  } catch {
    // Artists are optional
  }

  return {
    query,
    tracks,
    artists,
    total_tracks: tracks.length,
    total_artists: artists.length,
  }
}

/**
 * iTunes Artist Lookup — builds a complete artist profile from the public
 * iTunes Search API (free, no auth, CORS-enabled).
 *
 * @param artistId  — numeric iTunes artist ID (or any ID; will try lookup first)
 * @param artistName — fallback name search if ID lookup fails
 */
export async function iTunesArtistLookup(artistId: string, artistName?: string): Promise<UnifiedArtistResponse> {
  // ── Try ID-based lookup ──────────────────────────────────
  let foundName = artistName ?? ''
  let foundGenre = ''
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let topTracksRaw: any[] = []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let albumsRaw: any[] = []

  // Try iTunes Lookup by artist ID for albums + tracks
  const isNumeric = /^\d+$/.test(artistId)
  if (isNumeric) {
    try {
      const lookupUrl = `https://itunes.apple.com/lookup?id=${artistId}&entity=song&limit=30`
      const res = await fetch(lookupUrl)
      if (res.ok) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = await res.json() as { resultCount: number; results: any[] }
        topTracksRaw = (data.results ?? []).filter((r) => r.wrapperType === 'track')
        if (topTracksRaw.length > 0 && !foundName) {
          foundName = topTracksRaw[0].artistName ?? ''
          foundGenre = topTracksRaw[0].primaryGenreName ?? ''
        }
      }

      // Albums
      const albumUrl = `https://itunes.apple.com/lookup?id=${artistId}&entity=album&limit=20`
      const albumRes = await fetch(albumUrl)
      if (albumRes.ok) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const albumData = await albumRes.json() as { resultCount: number; results: any[] }
        albumsRaw = (albumData.results ?? []).filter((r) => r.collectionType === 'Album')
      }
    } catch {
      // ID lookup failed — fall through to name search
    }
  }

  // ── Fallback: search by name ─────────────────────────────
  if (topTracksRaw.length === 0 && foundName) {
    try {
      const searchUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(foundName)}&entity=song&limit=30`
      const res = await fetch(searchUrl)
      if (res.ok) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = await res.json() as { resultCount: number; results: any[] }
        topTracksRaw = (data.results ?? []).filter((r) => r.wrapperType === 'track')
      }
    } catch { /* silent */ }
  }

  if (topTracksRaw.length === 0 && !foundName) {
    throw new Error('Artist not found')
  }

  // ── Build top_tracks array ───────────────────────────────
  // Use a Set to deduplicate by track name
  const seen = new Set<string>()
  const topTracks: UnifiedArtistResponse['top_tracks'] = []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const t of topTracksRaw) {
    const trackName: string = t.trackName ?? t.trackCensoredName ?? ''
    if (!trackName || seen.has(trackName.toLowerCase())) continue
    seen.add(trackName.toLowerCase())

    topTracks.push({
      name: trackName,
      id: t.trackId ? String(t.trackId) : undefined,
      album: {
        name: t.collectionName ?? '',
        images: t.artworkUrl100
          ? [{ url: t.artworkUrl100.replace('100x100', '600x600') }]
          : [],
      },
      artists: [{ name: t.artistName ?? foundName }],
      duration_ms: t.trackTimeMillis ?? undefined,
      preview_url: t.previewUrl ?? null,
    })
  }

  // ── Build albums ─────────────────────────────────────────
  const albumSeen = new Set<string>()
  const albums: Array<Record<string, unknown>> = []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const a of albumsRaw) {
    const name: string = a.collectionName ?? ''
    if (!name || albumSeen.has(name.toLowerCase())) continue
    albumSeen.add(name.toLowerCase())
    albums.push({
      name,
      artworkUrl100: a.artworkUrl100 ?? null,
      releaseDate: a.releaseDate ?? null,
      trackCount: a.trackCount ?? 0,
      collectionId: a.collectionId ? String(a.collectionId) : null,
    })
  }

  // ── Artist image — use first album's artwork ─────────────
  const firstArtwork = topTracksRaw[0]?.artworkUrl100?.replace('100x100', '600x600') ?? null

  return {
    name: foundName || 'Unknown Artist',
    bio: null,
    mbid: isNumeric ? artistId : null,
    spotify_id: null,
    image_url: firstArtwork,
    genres: foundGenre ? [foundGenre] : [],
    popularity: 0,
    playcount: 0,
    similar_artists: [],
    top_tracks: topTracks,
    albums,
    tags: foundGenre ? [foundGenre] : [],
  }
}

export const api = {
  health(): Promise<HealthResponse> {
    return _fetch<HealthResponse>('/health')
  },

  register(body: RegisterRequest): Promise<UserResponse> {
    return _fetch<UserResponse>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  },

  login(body: LoginRequest): Promise<TokenResponse> {
    return _fetch<TokenResponse>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  },

  googleCallback(body: GoogleCallbackRequest): Promise<GoogleCallbackResponse> {
    return _fetch<GoogleCallbackResponse>('/api/v1/auth/google/callback', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  },

  me(token: string): Promise<UserResponse> {
    return _fetch<UserResponse>('/api/v1/auth/me', {
      headers: authHeader(token),
    })
  },

  listTracks(token: string, searchParams?: URLSearchParams): Promise<TrackListResponse> {
    const qs = searchParams ? `?${searchParams.toString()}` : ''
    return _fetch<TrackListResponse>(`/api/v1/tracks${qs}`, {
      headers: authHeader(token),
    })
  },

  listFavorites(token: string): Promise<TrackListResponse> {
    return _fetch<TrackListResponse>('/api/v1/tracks/favorites', {
      headers: authHeader(token),
    })
  },

  listPlaylists(token: string): Promise<PlaylistResponse[]> {
    return _fetch<PlaylistResponse[]>('/api/v1/playlists', {
      headers: authHeader(token),
    })
  },

  getPlaylist(token: string, playlistId: string): Promise<PlaylistResponse & { tracks?: TrackResponse[] }> {
    return _fetch<PlaylistResponse & { tracks?: TrackResponse[] }>(`/api/v1/playlists/${encodeURIComponent(playlistId)}`, {
      headers: authHeader(token),
    })
  },

  recentlyPlayed(token: string): Promise<TrackResponse[]> {
    return _fetch<TrackResponse[]>('/api/v1/player/recently-played', {
      headers: authHeader(token),
    })
  },

  logout(body: LogoutRequest, token?: string): Promise<LogoutResponse> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
    return _fetch<LogoutResponse>('/api/v1/auth/logout', {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })
  },

  // ── User profile ───────────────────────────────────────────────────────

  updateProfile(body: UpdateProfileRequest, token: string): Promise<UserResponse> {
    return _fetch<UserResponse>('/api/v1/users/me', {
      method: 'PATCH',
      headers: authHeader(token),
      body: JSON.stringify(body),
    })
  },

  async uploadAvatar(file: File, token: string): Promise<AvatarUploadResponse> {
    const formData = new FormData()
    formData.append('file', file)
    const response = await fetch('/api/v1/users/me/avatar', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    })
    if (!response.ok) {
      const body = await response.json().catch(() => ({}))
      throw new ApiError(body.message || body.detail || 'Upload failed', response.status, body)
    }
    return response.json() as Promise<AvatarUploadResponse>
  },

  // ── Email verification ──────────────────────────────────────────────────

  verifyEmail(token: string): Promise<VerifyEmailResponse> {
    return _fetch<VerifyEmailResponse>('/api/v1/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token } as VerifyEmailRequest),
    })
  },

  resendVerification(email: string): Promise<ResendVerificationResponse> {
    return _fetch<ResendVerificationResponse>('/api/v1/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email } as ResendVerificationRequest),
    })
  },

  // ── Password reset ───────────────────────────────────────────────────────

  forgotPassword(email: string): Promise<ForgotPasswordResponse> {
    return _fetch<ForgotPasswordResponse>('/api/v1/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email } as ForgotPasswordRequest),
    })
  },

  resetPassword(token: string, newPassword: string): Promise<ResetPasswordResponse> {
    return _fetch<ResetPasswordResponse>('/api/v1/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, new_password: newPassword } as ResetPasswordRequest),
    })
  },

  // ── Music Metadata ───────────────────────────────────────────────────

  /**
   * Search tracks and artists.
   * Tries the backend first; if unreachable or returns empty, falls back
   * to the public iTunes Search API (free, no auth required, CORS-enabled).
   */
  async musicSearch(query: string, limit: number = 5): Promise<UnifiedSearchResponse> {
    try {
      const result = await _fetch<UnifiedSearchResponse>(
        `/api/v1/music/search?q=${encodeURIComponent(query)}&limit=${limit}`,
      )
      if (result.tracks && result.tracks.length > 0) return result
      return musicSearchITunes(query, limit)
    } catch {
      return musicSearchITunes(query, limit)
    }
  },

  /**
   * Get full aggregated track metadata by MusicBrainz recording ID.
   */
  musicTrack(mbid: string): Promise<UnifiedTrackResponse> {
    return _fetch<UnifiedTrackResponse>(
      `/api/v1/music/track/${encodeURIComponent(mbid)}`,
    )
  },

  /**
   * Get full aggregated artist profile.
   * Tries the backend first; falls back to iTunes by ID or name.
   * @param mbid — MusicBrainz / Spotify / iTunes artist ID
   * @param artistName — optional name for iTunes fallback when ID lookup fails
   */
  async musicArtist(mbid: string, artistName?: string): Promise<UnifiedArtistResponse> {
    try {
      return await _fetch<UnifiedArtistResponse>(
        `/api/v1/music/artist/${encodeURIComponent(mbid)}`,
      )
    } catch {
      return iTunesArtistLookup(mbid, artistName)
    }
  },

  /**
   * Get similar artists for a given MusicBrainz artist ID.
   */
  musicSimilarArtists(mbid: string, limit: number = 10): Promise<SimilarArtistsResponse> {
    return _fetch<SimilarArtistsResponse>(
      `/api/v1/music/artist/${encodeURIComponent(mbid)}/similar?limit=${limit}`,
    )
  },

  // ── Catalog endpoints (local DB) ──────────────────────────────────

  catalogDiscovery(): Promise<CatalogDiscoveryResponse> {
    return _fetch<any>('/api/v1/catalog/discovery').then((data) => {
      // Convert dict sections to array format expected by frontend
      const sectionsDict = data.sections ?? {}
      const sectionsArray: CatalogDiscoverySection[] = Object.entries(sectionsDict).map(([genre, items]) => ({
        genre,
        label: genre.charAt(0).toUpperCase() + genre.slice(1),
        items: (items as any[]) ?? [],
      }))
      return {
        top_artists: data.top_artists ?? [],
        trending_tracks: data.trending_tracks ?? [],
        featured_albums: data.featured_albums ?? [],
        popular_genres: data.popular_genres ?? [],
        brazilian_artists: data.brazilian_artists ?? [],
        international_artists: data.international_artists ?? [],
        sections: sectionsArray,
      }
    })
  },

  catalogSearch(query: string, limit: number = 20, offset: number = 0): Promise<CatalogSearchResponse> {
    const qs = new URLSearchParams({ q: query, limit: String(limit), offset: String(offset) })
    return _fetch<CatalogSearchResponse>(`/api/v1/catalog/search?${qs.toString()}`)
  },

  catalogArtists(limit: number = 30, offset: number = 0, sort: string = 'popularity'): Promise<CatalogListResponse<CatalogArtistItem>> {
    const qs = new URLSearchParams({ limit: String(limit), offset: String(offset), sort })
    return _fetch<any>(`/api/v1/catalog/artists?${qs.toString()}`).then((data) => ({
      items: data.artists ?? [],
      total: data.total ?? 0,
      offset: data.offset ?? 0,
      limit: data.limit ?? limit,
    }))
  },

  catalogArtist(artistId: string): Promise<CatalogArtistResponse> {
    return _fetch<any>(`/api/v1/catalog/artists/${encodeURIComponent(artistId)}`).then((data) => ({
      artist: {
        id: data.id,
        name: data.name,
        image_url: data.image_url ?? null,
        genres: data.genres ?? [],
        bio: data.bio ?? null,
        popularity: data.popularity ?? 0,
        track_count: data.track_count ?? 0,
        album_count: Array.isArray(data.albums) ? data.albums.length : 0,
      },
      top_tracks: [],
      albums: Array.isArray(data.albums) ? data.albums.map((a: any) => ({
        id: a.id,
        title: a.title,
        artist_name: a.artist_name ?? 'Unknown',
        cover_url: a.cover_url ?? null,
        release_date: a.release_date ?? null,
        track_count: a.track_count ?? 0,
        genres: [],
      })) : [],
      similar: [],
    }))
  },

  catalogArtistTracks(artistId: string, limit: number = 20, offset: number = 0): Promise<CatalogListResponse<CatalogTrackItem>> {
    const qs = new URLSearchParams({ limit: String(limit), offset: String(offset) })
    return _fetch<any>(`/api/v1/catalog/artists/${encodeURIComponent(artistId)}/tracks?${qs.toString()}`).then((data) => ({
      items: data.tracks ?? [],
      total: data.total ?? 0,
      offset: data.offset ?? 0,
      limit: data.limit ?? limit,
    }))
  },

  catalogArtistAlbums(artistId: string): Promise<CatalogAlbumItem[]> {
    return _fetch<any>(`/api/v1/catalog/artists/${encodeURIComponent(artistId)}/albums`).then((data) =>
      (data.albums ?? []).map((a: any) => ({
        id: a.id,
        title: a.title,
        artist_name: a.artist_name ?? 'Unknown',
        cover_url: a.cover_url ?? null,
        release_date: a.release_date ?? null,
        track_count: a.track_count ?? 0,
        genres: [],
      }))
    )
  },

  catalogAlbum(albumId: string): Promise<CatalogAlbumResponse> {
    return _fetch<CatalogAlbumResponse>(`/api/v1/catalog/albums/${encodeURIComponent(albumId)}`)
  },

  catalogAlbumTracks(albumId: string): Promise<CatalogTrackItem[]> {
    return _fetch<any>(`/api/v1/catalog/albums/${encodeURIComponent(albumId)}/tracks`).then((data) => data.tracks ?? [])
  },

  catalogTrack(trackId: string): Promise<CatalogTrackResponse> {
    return _fetch<CatalogTrackResponse>(`/api/v1/catalog/tracks/${encodeURIComponent(trackId)}`)
  },

  catalogGenres(): Promise<CatalogGenreItem[]> {
    return _fetch<CatalogGenreItem[]>('/api/v1/catalog/genres')
  },

  catalogGenre(slug: string): Promise<CatalogGenreItem> {
    return _fetch<CatalogGenreItem>(`/api/v1/catalog/genres/${encodeURIComponent(slug)}`)
  },

  catalogGenreTracks(slug: string, limit: number = 20, offset: number = 0): Promise<CatalogListResponse<CatalogTrackItem>> {
    const qs = new URLSearchParams({ limit: String(limit), offset: String(offset) })
    return _fetch<any>(`/api/v1/catalog/genres/${encodeURIComponent(slug)}/tracks?${qs.toString()}`).then((data) => ({
      items: data.tracks ?? [],
      total: data.total ?? 0,
      offset: data.offset ?? 0,
      limit: data.limit ?? limit,
    }))
  },

  catalogBrazilian(limit: number = 20, offset: number = 0): Promise<CatalogListResponse<CatalogArtistItem>> {
    const qs = new URLSearchParams({ limit: String(limit), offset: String(offset) })
    return _fetch<any>(`/api/v1/catalog/brazilian?${qs.toString()}`).then((data) => ({
      items: data.artists ?? [],
      total: data.total ?? 0,
      offset: data.offset ?? 0,
      limit: data.limit ?? limit,
    }))
  },

  catalogAutocomplete(query: string): Promise<CatalogAutocompleteResponse> {
    return _fetch<CatalogAutocompleteResponse>(`/api/v1/catalog/autocomplete?q=${encodeURIComponent(query)}`)
  },
} as const

export { ApiError }
