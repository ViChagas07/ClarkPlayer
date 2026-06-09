"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { PlayerBar } from "@/components/layout/PlayerBar";
import { SignInPrompt } from "@/components/layout/SignInPrompt";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, accessToken, isLoading, loadUser } = useAuthStore();
  const router = useRouter();

  // Hydrate user from stored token on mount
  useEffect(() => {
    if (accessToken && !user) {
      loadUser();
    }
  }, []);

  if (isLoading && accessToken) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg-primary">
        <div
          className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"
          aria-label="Loading"
        />
      </div>
    );
  }

  if (!user || !accessToken) {
    return <SignInPrompt />;
  }

  return (
    <div className="flex min-h-screen bg-bg-primary">
      <Sidebar />

      <div className="flex flex-col min-h-screen lg:pl-60 pb-20 flex-1 relative">
        <main className="flex-1 relative">{children}</main>
      </div>

      <BottomNav />
      <PlayerBar />
    </div>
  );
}
