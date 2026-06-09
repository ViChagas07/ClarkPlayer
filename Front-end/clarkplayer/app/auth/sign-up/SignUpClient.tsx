"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";

export default function SignUpClient() {
  const router = useRouter();
  const { signUp, isLoading, error, clearError } = useAuthStore();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (password.length < 8) {
      setLocalError("Password must be at least 8 characters.");
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setLocalError("Username can only contain letters, numbers, and underscores.");
      return;
    }

    try {
      await signUp(username, email, password, displayName || undefined);
      router.push("/");
    } catch {
      // error is already in store
    }
  };

  const displayError = localError ?? error;

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-primary px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 3.5C3 3.5 6 2 8 4C10 6 13 4.5 13 4.5V11.5C13 11.5 10 10 8 12C6 14 3 12.5 3 12.5V3.5Z" fill="white" />
              </svg>
            </div>
            <span className="text-lg font-bold text-heading group-hover:text-accent transition-colors">ClarkPlayer</span>
          </Link>
          <h1 className="text-xl font-bold text-heading">Create your account</h1>
          <p className="text-sm text-muted">Start building your music library today.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {displayError && (
            <div role="alert" aria-live="assertive" className="flex items-center gap-2 px-4 py-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="flex-shrink-0">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                <path d="M8 5v3M8 10.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              {displayError}
            </div>
          )}

          <div className="space-y-1">
            <label htmlFor="username" className="text-sm font-medium text-body">Username</label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              required
              minLength={3}
              maxLength={50}
              pattern="^[a-zA-Z0-9_]+$"
              value={username}
              onChange={(e) => { setUsername(e.target.value); clearError(); setLocalError(null); }}
              className="w-full px-4 py-2.5 rounded-xl bg-bg-secondary border border-white/5 text-sm text-body placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200"
              placeholder="your_username"
            />
            <p className="text-xs text-muted">Letters, numbers, and underscores only.</p>
          </div>

          <div className="space-y-1">
            <label htmlFor="email" className="text-sm font-medium text-body">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => { setEmail(e.target.value); clearError(); setLocalError(null); }}
              className="w-full px-4 py-2.5 rounded-xl bg-bg-secondary border border-white/5 text-sm text-body placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="displayName" className="text-sm font-medium text-body">
              Display Name <span className="text-muted font-normal">(optional)</span>
            </label>
            <input
              id="displayName"
              type="text"
              autoComplete="nickname"
              maxLength={100}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-bg-secondary border border-white/5 text-sm text-body placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200"
              placeholder="How should we call you?"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="text-sm font-medium text-body">Password</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={8}
                maxLength={128}
                value={password}
                onChange={(e) => { setPassword(e.target.value); clearError(); setLocalError(null); }}
                className="w-full px-4 py-2.5 pr-11 rounded-xl bg-bg-secondary border border-white/5 text-sm text-body placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200"
                placeholder="••••••••"
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-body transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="text-xs text-muted">At least 8 characters.</p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={cn(
              "w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-semibold transition-all duration-200",
              isLoading && "opacity-60 cursor-not-allowed"
            )}
          >
            {isLoading && <Loader2 size={16} className="animate-spin" />}
            Create Account
          </button>
        </form>

        <p className="text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/auth/sign-in" className="text-accent hover:text-accent-hover font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
