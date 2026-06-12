import type {
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
  UnifiedTrackResponse,
  UnifiedArtistResponse,
  SimilarArtistsResponse,
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

async function _fetch<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    // Handle specific auth error messages from backend
    const errorMessage = body.message || body.detail || 'Request failed'
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
   * Search tracks and artists across all integrated music APIs
   * (MusicBrainz, iTunes, Spotify, Genius, Last.fm).
   */
  musicSearch(query: string, limit: number = 5): Promise<UnifiedSearchResponse> {
    return _fetch<UnifiedSearchResponse>(
      `/api/v1/music/search?q=${encodeURIComponent(query)}&limit=${limit}`,
    )
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
   * Get full aggregated artist profile by MusicBrainz artist ID.
   */
  musicArtist(mbid: string): Promise<UnifiedArtistResponse> {
    return _fetch<UnifiedArtistResponse>(
      `/api/v1/music/artist/${encodeURIComponent(mbid)}`,
    )
  },

  /**
   * Get similar artists for a given MusicBrainz artist ID.
   */
  musicSimilarArtists(mbid: string, limit: number = 10): Promise<SimilarArtistsResponse> {
    return _fetch<SimilarArtistsResponse>(
      `/api/v1/music/artist/${encodeURIComponent(mbid)}/similar?limit=${limit}`,
    )
  },
} as const

export { ApiError }
