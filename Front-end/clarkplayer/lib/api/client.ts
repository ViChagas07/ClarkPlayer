/**
 * API client for ClarkPlayer backend.
 * All requests include the Bearer token when available.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("clarkplayer-token")
      : null;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers ?? {}),
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errorMessage = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      errorMessage = body.message ?? body.error ?? errorMessage;
    } catch {
      // ignore parse error
    }
    throw new Error(errorMessage);
  }

  // 204 No Content
  if (res.status === 204) return {} as T;

  return res.json() as Promise<T>;
}

// ── Auth ────────────────────────────────────────────────────────────────────

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  displayName?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
}

export interface UserResponse {
  id: string;
  username: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  isActive: boolean;
}

export const authApi = {
  register: (body: RegisterRequest) =>
    request<TokenResponse & { user?: UserResponse }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  login: (body: LoginRequest) =>
    request<TokenResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  refresh: (refreshToken: string) =>
    request<TokenResponse>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    }),

  me: () => request<UserResponse>("/auth/me"),
};

// ── Tracks ────────────────────────────────────────────────────────────────────

export const tracksApi = {
  list: (params?: {
    offset?: number;
    limit?: number;
    search?: string;
    artist?: string;
    album?: string;
    genre?: string;
  }) => {
    const filtered = Object.entries(params ?? {})
      .filter(([, v]) => v != null)
      .map(([k, v]) => [k, String(v)] as [string, string]);
    const qs = new URLSearchParams(filtered);
    return request<{ items: unknown[]; total: number; offset: number; limit: number }>(
      `/tracks?${qs}`
    );
  },
};

// ── Playlists ────────────────────────────────────────────────────────────────

export const playlistsApi = {
  list: () => request<PlaylistResponse[]>("/playlists"),
};

export interface PlaylistResponse {
  id: string;
  name: string;
  description: string | null;
  coverArtPath: string | null;
  visibility: string;
  trackCount: number;
  createdAt: string;
  updatedAt: string;
}
