"use client";

import { useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";

/**
 * Prompts sign-in when unauthenticated users land on a protected page.
 * Shows instead of the page content when not authenticated.
 */
export function SignInPrompt() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, accessToken, isLoading } = useAuthStore();

  // Auto-redirect once auth is resolved
  useEffect(() => {
    if (!isLoading && !user && !accessToken) {
      // keep showing prompt
    }
  }, [isLoading, user, accessToken]);

  if (isLoading || user || accessToken) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-primary px-4">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-accent/20 flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 3.5C3 3.5 6 2 8 4C10 6 13 4.5 13 4.5V11.5C13 11.5 10 10 8 12C6 14 3 12.5 3 12.5V3.5Z" fill="#6366F1" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-heading">Join ClarkPlayer</h1>
            <p className="text-sm text-muted mt-1">Sign in to access your library and playlists.</p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/auth/sign-in"
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-semibold transition-all duration-200"
          >
            Sign In
          </Link>
          <Link
            href="/auth/sign-up"
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-bg-tertiary hover:bg-bg-tertiary/80 text-body text-sm font-semibold transition-all duration-200"
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
