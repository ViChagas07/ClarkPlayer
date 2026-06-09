"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

/**
 * AuthGuard — redirects unauthenticated users to /auth/sign-in.
 * Place inside a client component that wraps protected routes.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, accessToken, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !user && !accessToken) {
      router.push(`/auth/sign-in?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [user, accessToken, isLoading, router, pathname]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg-primary">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" aria-label="Loading" />
      </div>
    );
  }

  if (!user || !accessToken) return null;

  return <>{children}</>;
}
