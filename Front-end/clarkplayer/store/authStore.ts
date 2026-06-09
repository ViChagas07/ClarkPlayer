"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";
import { authApi } from "@/lib/api/client";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
  // Actions
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (username: string, email: string, password: string, displayName?: string) => Promise<void>;
  signOut: () => void;
  clearError: () => void;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      error: null,

      signIn: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const data = await authApi.login({ email, password });
          set({ accessToken: data.accessToken, refreshToken: data.refreshToken ?? null });
          // Fetch user profile
          const user = await authApi.me();
          set({ user, isLoading: false });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Sign in failed";
          set({ error: message, isLoading: false });
          throw err;
        }
      },

      signUp: async (username, email, password, displayName) => {
        set({ isLoading: true, error: null });
        try {
          const data = await authApi.register({ username, email, password, displayName });
          set({ accessToken: data.accessToken, refreshToken: data.refreshToken ?? null });
          const user = await authApi.me();
          set({ user, isLoading: false });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Sign up failed";
          set({ error: message, isLoading: false });
          throw err;
        }
      },

      signOut: () => {
        set({ user: null, accessToken: null, refreshToken: null, error: null });
      },

      clearError: () => set({ error: null }),

      loadUser: async () => {
        const { accessToken } = get();
        if (!accessToken) return;
        try {
          const user = await authApi.me();
          set({ user });
        } catch {
          // Token expired or invalid — clear it
          get().signOut();
        }
      },
    }),
    {
      name: "clarkplayer-auth",
      partialize: (s) => ({
        user: s.user,
        accessToken: s.accessToken,
        refreshToken: s.refreshToken,
      }),
    }
  )
);
