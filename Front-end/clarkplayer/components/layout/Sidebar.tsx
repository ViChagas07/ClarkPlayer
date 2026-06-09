"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Library, Search, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePlayerStore } from "@/store/playerStore";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/library", label: "Library", icon: Library },
  { href: "/search", label: "Search", icon: Search },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { currentTrack, isPlaying, togglePlay } = usePlayerStore();

  return (
    <aside className="hidden lg:flex flex-col w-60 h-screen bg-bg-secondary border-r border-white/5 fixed left-0 top-0 z-30 pointer-events-auto">
      {/* Logo */}
      <div className="px-5 py-6">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 3.5C3 3.5 6 2 8 4C10 6 13 4.5 13 4.5V11.5C13 11.5 10 10 8 12C6 14 3 12.5 3 12.5V3.5Z" fill="white" />
              <path d="M5 6.5C5 6.5 6.5 6 7.5 7C8.5 8 10 7.5 10 7.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-base font-bold text-heading tracking-tight group-hover:text-accent transition-colors duration-200">
            ClarkPlayer
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1" aria-label="Main navigation">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium",
                "transition-all duration-200",
                isActive
                  ? "text-heading bg-accent/10 border-l-2 border-accent pl-[10px]"
                  : "text-muted hover:text-body hover:bg-bg-tertiary"
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Mini Now Playing */}
      <div className="border-t border-white/5 p-3">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-bg-tertiary">
          <div className="w-10 h-10 rounded-lg bg-bg-primary flex-shrink-0 flex items-center justify-center overflow-hidden">
            {currentTrack?.coverArtPath ? (
              <img
                src={currentTrack.coverArtPath}
                alt={currentTrack.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-accent/20 flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 3.5C3 3.5 6 2 8 4C10 6 13 4.5 13 4.5V11.5C13 11.5 10 10 8 12C6 14 3 12.5 3 12.5V3.5Z" fill="#6366F1" />
                </svg>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-heading truncate">
              {currentTrack?.title ?? "Nothing playing"}
            </p>
            <p className="text-xs text-muted truncate">
              {currentTrack?.artist ?? "—"}
            </p>
          </div>
          {currentTrack && (
            <button
              aria-label={isPlaying ? "Pause" : "Play"}
              onClick={togglePlay}
              className="p-1.5 rounded-lg text-muted hover:text-body hover:bg-bg-primary transition-all duration-200 cursor-pointer flex-shrink-0"
            >
              {isPlaying ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
