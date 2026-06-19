'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Home,
  Music,
  Library,
  ListMusic,
  Mic2,
  Tag,
  Search,
  Settings,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  Heart,
  ListOrdered,
  Menu,
  X,
  FileText,
  LogOut,
  LogIn,
  User,
  ChevronLeft,
  ChevronDown,
  Disc3,
  ArrowUp,
  Headphones,
} from 'lucide-react'
import { useState, useEffect, useRef, createContext, useContext } from 'react'
import { usePlayerStore } from '@/store/playerStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useAuthStore } from '@/store/authStore'
import { useSidebarStore } from '@/store/sidebarStore'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { GlobalFooter } from '@/components/layout/GlobalFooter'
import { api } from '@/lib/api'
import { useTranslation } from '@/hooks/useTranslation'
import { useDesktopAudioEngine } from '@/hooks/useDesktopAudioEngine'
import { usePreviewPlayer } from '@/hooks/usePreviewPlayer'

/* ── 26 unique aura animation classes — randomly selected per layer ── */
const AURA_ANIMATIONS = [
  'animate-aurora-bounce',
  'animate-aurora-spin',
  'animate-aurora-wave',
  'animate-aurora-sway',
  'animate-aurora-pulse',
  'animate-aurora-drift',
  'animate-aurora-glow',
  'animate-aurora-shimmer',
  'animate-aurora-ripple',
  'animate-aurora-float',
  'animate-aurora-breath',
  'animate-aurora-twirl',
  'animate-aurora-wobble',
  'animate-aurora-blur',
  'animate-aurora-dance',
  'animate-aurora-slide',
  'animate-aurora-zoom',
  'animate-aurora-flash',
  'animate-aurora-morph',
  'animate-aurora-roll',
  'animate-aurora-shake',
  'animate-aurora-swing',
  'animate-aurora-pulse-glow',
  'animate-aurora-waveform',
  'animate-aurora-spiral',
  'animate-aurora-burst',
]

const MOBILE_BREAKPOINT = 1024

/** Picks a random element from an array using crypto‑grade randomness. */
function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

const AppShellContext = createContext(false)

export function AppShell({ children }: { children: React.ReactNode }) {
  // If already inside a parent AppShell, just pass through children
  const parentShell = useContext(AppShellContext)
  if (parentShell) return <>{children}</>

  const { t } = useTranslation()
  const pathname = usePathname()
  const router = useRouter()
  const { isOpen: sidebarOpen, width: sidebarWidth, toggle: toggleSidebar, setOpen } = useSidebarStore()
  const [rightPanelOpen, setRightPanelOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [toggleCenter, setToggleCenter] = useState(0)
  const [windowWidth, setWindowWidth] = useState(0)

  // ── Mobile detection + sidebar auto-close on mobile ──────────────────
  useEffect(() => {
    let ticking = false
    const check = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const w = window.innerWidth
          const mobile = w < MOBILE_BREAKPOINT
          setWindowWidth(w)
          setIsMobile(mobile)
          setToggleCenter(w / 2 - 40) // center of 80px-wide toggle button
          // Close sidebar by default on mobile screens
          if (mobile) {
            setOpen(false)
          }
          ticking = false
        })
        ticking = true
      }
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [setOpen])

  // Close sidebar on route change (mobile behavior)
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      setOpen(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  /* ── Pick 3 random animations on first render (per session) ─────── */
  const [auraAnimation] = useState(() => pickRandom(AURA_ANIMATIONS))
  const [auraAnimationSoft] = useState(() => pickRandom(AURA_ANIMATIONS))
  const [auraAnimationMid] = useState(() => pickRandom(AURA_ANIMATIONS))

  const {
    currentTrack, isPlaying, isPreview, progress, volume, isShuffled, repeatMode,
    queue, queueIndex, isPlayerVisible,
    togglePlay, nextTrack, prevTrack, setProgress, setVolume,
    toggleShuffle, toggleRepeat, setPlayerVisible,
    stopPreview,
  } = usePlayerStore()
  const { sleepTimer, accentColor } = useSettingsStore()

  // Wire audio engines — library + preview
  const { seek } = useDesktopAudioEngine()
  const { previewActive } = usePreviewPlayer()
  void previewActive // referenced for liveness
  const { user, isAuthenticated, refreshToken, accessToken } = useAuthStore()
  const clearSession = useAuthStore((s) => s.clearSession)

  const [showUserMenu, setShowUserMenu] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    if (!showUserMenu) return
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showUserMenu])

  const displayTrack = currentTrack
  const trackDuration = displayTrack?.duration ?? 0

  // Calculate right panel width safely (no typeof window in SSR)
  const rightPanelWidth = windowWidth > 0 ? Math.min(320, windowWidth) : 320

  async function handleLogout() {
    if (refreshToken) {
      try {
        await api.logout({ refresh_token: refreshToken }, accessToken || undefined)
      } catch {
        // Continue with local logout even if backend call fails
      }
    }
    clearSession()
    window.location.href = '/'
  }

  const initials = user?.display_name
    ? user.display_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.username?.slice(0, 2).toUpperCase() ?? 'U'

  const navItems = [
    { href: '/', icon: Home, label: t('home') },
    { href: '/audios', icon: Music, label: t('allTracks') },
    { href: '/library', icon: Library, label: t('library') },
    { href: '/playlists', icon: ListMusic, label: t('playlists') },
    { href: '/artists', icon: Mic2, label: t('artists') },
    { href: '/genres', icon: Tag, label: t('genres') },
    { href: '/search', icon: Search, label: t('search') },
    { href: '/settings', icon: Settings, label: t('settingsNav') },
  ]

  return (
    <AppShellContext.Provider value={true}>
    <div className="flex h-screen bg-clark-bg-primary text-clark-text-primary overflow-hidden">
      {/* Standalone sidebar toggle — visible only when sidebar is closed */}
      <button
        onClick={() => {
          toggleSidebar()
          if (isMobile && rightPanelOpen) setRightPanelOpen(false)
        }}
        className={cn(
          'fixed left-0 top-1/2 -translate-y-1/2 z-50 pointer-events-auto',
          'w-7 h-20 rounded-r-lg bg-clark-bg-card/80 backdrop-blur-md border border-clark-steel/30 border-l-0',
          'text-clark-text-muted hover:text-clark-gold hover:bg-clark-bg-card transition-all duration-300',
          'shadow-lg shadow-black/20 flex items-center justify-center',
          sidebarOpen ? 'opacity-0 pointer-events-none' : 'opacity-100',
        )}
        aria-label={t('openSidebar')}
        title={t('openSidebar')}
      >
        <Menu className="w-4 h-4" />
      </button>

      {/* Top-right user button — Spotify style */}
      <div className={cn(
        'fixed top-4 right-4 z-40 flex items-center gap-3',
        rightPanelOpen ? 'pointer-events-none opacity-30' : 'pointer-events-auto',
      )}>
        {isAuthenticated ? (
          <div ref={userMenuRef} className="relative">
            <button
              onClick={() => setShowUserMenu((v) => !v)}
              className="flex items-center gap-2 px-3 py-2 rounded-full bg-clark-bg-card/80 backdrop-blur-sm border border-clark-steel/30 hover:border-clark-gold/50 transition-colors"
              aria-label={t('signOut')}
            >
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 rounded-full bg-clark-gold/20 blur-sm" />
                {user?.avatar_url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={user.avatar_url}
                    alt={user.display_name ?? user.username}
                    className="relative w-8 h-8 rounded-full object-cover ring-1 ring-clark-gold/50"
                  />
                ) : (
                  <div className="relative w-7 h-7 rounded-full bg-gradient-to-br from-clark-steel to-clark-accent flex items-center justify-center text-xs font-condensed text-clark-text-primary ring-1 ring-clark-gold/50">
                    {initials}
                  </div>
                )}
              </div>
              <span className="font-body text-sm text-clark-text-muted hidden sm:block max-w-28 truncate">
                {user?.display_name ?? user?.username}
              </span>
            </button>

            {/* Dropdown menu */}
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-clark-bg-card/95 backdrop-blur-md border border-clark-steel/30 shadow-xl shadow-black/30 overflow-hidden z-50">
                {/* Profile */}
                <button
                  onClick={() => { setShowUserMenu(false); router.push('/account') }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-body text-clark-text-muted hover:bg-clark-steel/20 hover:text-clark-text-primary transition-colors"
                >
                  <User className="w-4 h-4" />
                  {t('profileInformation')}
                </button>
                {/* Settings */}
                <button
                  onClick={() => { setShowUserMenu(false); router.push('/settings') }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-body text-clark-text-muted hover:bg-clark-steel/20 hover:text-clark-text-primary transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  {t('settingsNav')}
                </button>
                {/* Divider */}
                <div className="mx-3 border-t border-clark-steel/20" />
                {/* Logout */}
                <button
                  onClick={() => { setShowUserMenu(false); handleLogout() }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-body text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  {t('signOut')}
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => router.push('/login')}
            className="flex items-center gap-2 px-3 py-2 rounded-full bg-clark-bg-card/80 backdrop-blur-sm border border-clark-steel/30 hover:border-clark-sky/50 transition-colors"
            aria-label={t('signIn')}
          >
            <div className="w-7 h-7 rounded-full bg-clark-bg-card flex items-center justify-center">
              <LogIn className="w-4 h-4 text-clark-sky" />
            </div>
            <span className="font-body text-sm text-clark-text-muted hidden sm:block">{t('loginAccount')}</span>
          </button>
        )}
      </div>

      {/* Sidebar */}
      <aside
        style={{
          width: sidebarOpen ? `${sidebarWidth}px` : '0px',
          minWidth: sidebarOpen ? `${sidebarWidth}px` : '0px',
        }}
        className={cn(
          'fixed left-0 top-0 h-screen z-40 overflow-hidden pointer-events-auto',
          'bg-gradient-to-b from-clark-bg-secondary to-[#060F1E] border-r border-clark-steel/20',
          'transition-all duration-300 ease-in-out',
        )}
      >
        {/* Close button — inside the sidebar, on its right edge */}
        <button
          onClick={() => toggleSidebar()}
          className={cn(
            'absolute top-1/2 right-0 -translate-y-1/2 z-40 pointer-events-auto',
            'w-7 h-20 rounded-l-lg bg-clark-bg-card/80 backdrop-blur-md border border-clark-steel/30 border-r-0',
            'text-clark-text-muted hover:text-clark-gold hover:bg-clark-bg-card transition-all duration-200',
            'shadow-lg shadow-black/20 flex items-center justify-center',
          )}
          aria-label={t('closeSidebar')}
          title={t('closeNavigation')}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* TOP: logo + scrollable main nav */}
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* Logo area */}
          <div className="p-6 border-b border-clark-steel/20 flex-shrink-0">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 rounded-xl bg-clark-gold/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center ring-1 ring-clark-gold/40">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/ClarkPlayer_Transparent.png" alt="ClarkPlayer" className="w-full h-full object-contain" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-display text-lg tracking-widest text-clark-text-primary">
                  Clark<span className="text-clark-accent">Player</span>
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation — scrollable main links */}
          <nav className="flex-1 overflow-y-auto py-4 px-3" aria-label={t('mainNavigation')}>
            <ul className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      prefetch={item.href === '/' || item.href === '/audios' ? undefined : false}
                      className={cn(
                        'group flex items-center gap-3 px-3 py-2.5 rounded-lg font-body font-medium text-sm transition-all duration-200',
                        isActive
                          ? 'bg-clark-steel/20 text-clark-accent border-l-2 border-clark-accent pl-[10px]'
                          : 'text-clark-text-muted hover:text-clark-text-primary hover:bg-clark-steel/25 border-l-2 border-transparent pl-[10px]',
                      )}
                      onClick={() => {
                        if (isMobile) toggleSidebar()
                      }}
                    >
                      <item.icon className={cn(
                        'w-5 h-5 flex-shrink-0 transition-colors transition-transform group-hover:translate-x-1',
                        isActive ? 'text-clark-accent' : 'text-clark-sky group-hover:text-clark-accent'
                      )} />
                      <span className="transition-transform group-hover:translate-x-1">{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </div>
      </aside>

      {/* Sidebar backdrop — closes sidebar when tapping outside */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 backdrop-blur-sm lg:bg-transparent lg:backdrop-blur-none lg:pointer-events-none"
          onClick={() => {
            toggleSidebar()
            if (isMobile && rightPanelOpen) setRightPanelOpen(false)
          }}
        />
      )}

      {/* Open button — outside right panel, visible only when panel is closed */}
      {!rightPanelOpen && (
        <button
          onClick={() => {
            setRightPanelOpen(true)
            if (isMobile && sidebarOpen) toggleSidebar()
          }}
          className={cn(
            'fixed top-1/2 right-0 -translate-y-1/2 z-50 pointer-events-auto',
            'w-7 h-20 rounded-l-lg bg-clark-bg-card/80 backdrop-blur-md border border-clark-steel/30 border-r-0',
            'text-clark-text-muted hover:text-clark-gold hover:bg-clark-bg-card transition-all duration-200',
            'shadow-lg shadow-black/20 flex items-center justify-center',
          )}
          aria-label={t('openNowPlayingPanel')}
          title={t('nowPlaying')}
        >
          <Music className="w-4 h-4" />
        </button>
      )}

      {/* Right panel — Now Playing / Queue drawer */}
      <aside
        style={{ backgroundColor: accentColor + '40', zIndex: 60 }}
        className={cn(
          'fixed right-0 top-0 h-full w-full sm:w-80 max-w-[100vw] flex flex-col pointer-events-auto backdrop-blur-xl',
          'border-l border-clark-steel/20 shadow-2xl shadow-black/40',
          'transition-transform duration-300 ease-out',
          rightPanelOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
          {/* Toggle — on left wall, vertically centered on the full sidebar */}
          <button
            onClick={() => setRightPanelOpen(false)}
            className={cn(
              'absolute top-1/2 left-0 -translate-y-1/2 z-40 pointer-events-auto',
              'w-7 h-12 rounded-r-lg bg-clark-bg-card/80 backdrop-blur-md border border-clark-steel/30 border-l-0',
              'text-clark-text-muted hover:text-clark-gold hover:bg-clark-bg-card transition-all duration-200',
              'shadow-lg shadow-black/20 flex items-center justify-center',
            )}
            aria-label={t('closePanel')}
            title={t('closePanel')}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Panel header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-clark-steel/20">
            <h2 className="font-display text-lg tracking-widest text-clark-text-primary uppercase">
              {t('nowPlaying')}
            </h2>
            <button
              onClick={() => setRightPanelOpen(false)}
              className="p-1.5 rounded-lg text-clark-text-muted hover:text-clark-gold hover:bg-clark-steel/20 transition-colors pointer-events-auto"
              aria-label={t('closePanel')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Current track info */}
          <div className="px-5 py-6">
            <div className="relative mx-auto mb-4 w-48 h-48">
              <div className="absolute inset-0 rounded-xl bg-clark-gold/15 blur-2xl" />
              <div className="relative w-full h-full rounded-xl bg-gradient-to-br from-clark-steel to-clark-accent flex items-center justify-center ring-1 ring-clark-gold/30 overflow-hidden">
                {displayTrack?.coverUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={displayTrack.coverUrl}
                    alt={displayTrack.title ?? 'Cover'}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <Disc3 className="w-20 h-20 text-white/40" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
            </div>
            <h3 className="font-display text-xl tracking-wider text-clark-text-primary truncate text-center">
              {displayTrack?.title ?? 'No track playing'}
            </h3>
            <p className="font-body text-sm text-clark-text-muted truncate text-center mt-1">
              {displayTrack?.artist ?? '\u00A0'}
            </p>

            {/* Progress bar — inside Now Playing panel */}
            {displayTrack && (
              <div className="flex items-center justify-center gap-2 mt-4 px-2">
                <span className="font-condensed text-[10px] text-clark-text-muted w-8 text-right tabular-nums flex-shrink-0">{formatTime(progress)}</span>
                <div
                  className="flex-1 py-2 cursor-pointer group relative"
                  onClick={(e) => { const rect = e.currentTarget.getBoundingClientRect(); const pct = (e.clientX - rect.left) / rect.width; seek(pct * trackDuration) }}
                  role="slider"
                  aria-label="Track progress"
                  aria-valuemin={0}
                  aria-valuemax={trackDuration}
                  aria-valuenow={progress}
                  tabIndex={0}
                >
                  <div className="h-1 bg-clark-bg-secondary rounded-full relative">
                    <div
                      className="h-full rounded-full relative group-hover:brightness-110 transition-all"
                      style={{ width: `${trackDuration > 0 ? (progress / trackDuration) * 100 : 0}%`, backgroundColor: accentColor, boxShadow: `0 0 6px ${accentColor}80` }}
                    >
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: accentColor, boxShadow: `0 0 8px ${accentColor}` }} />
                    </div>
                  </div>
                </div>
                <span className="font-condensed text-[10px] text-clark-text-muted w-8 tabular-nums flex-shrink-0">{formatTime(trackDuration)}</span>
              </div>
            )}
          </div>

          {/* ── Spacer — pushes divider down ── */}
          <div className="flex-1 min-h-[40px]" />

          {/* ── Playback controls — inside right sidebar ── */}
          {displayTrack && (
            <div className="flex items-center justify-center gap-5 px-5 mb-4">
              <button
                className="p-2 text-clark-text-muted/80 hover:text-clark-text-primary transition-colors"
                onClick={prevTrack}
                aria-label={t('previousTrack')}
              >
                <SkipBack className="w-5 h-5" />
              </button>
              <button
                className="relative w-11 h-11 rounded-full bg-clark-accent hover:bg-clark-accent-hover flex items-center justify-center transition-all hover:scale-105 flex-shrink-0"
                style={{ boxShadow: `0 0 14px ${accentColor}60` }}
                onClick={() => { if (isPreview && isPlaying) stopPreview(); else togglePlay() }}
                aria-label={isPlaying ? t('pauseBtn') : t('playBtn')}
              >
                <div className="absolute inset-0 rounded-full bg-clark-gold/20 blur-sm" />
                <div className="relative flex items-center justify-center">
                  {isPlaying ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white ml-0.5" />}
                </div>
              </button>
              <button
                className="p-2 text-clark-text-muted/80 hover:text-clark-text-primary transition-colors"
                onClick={nextTrack}
                aria-label={t('nextTrack')}
              >
                <SkipForward className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* ── Divider — now significantly lower ── */}
          <div className="mx-5 border-t border-clark-steel/20 flex-shrink-0 mb-4" />

          {/* ── Queue section: header + content ── */}
          <div className="flex-shrink-0">
            {/* Queue header — below the divider */}
            <div className="flex items-center gap-2 px-5 py-3 pl-12">
              <ListOrdered className="w-4 h-4 text-clark-gold" />
              <h3 className="font-condensed text-xs tracking-widest text-clark-text-muted uppercase">{t('queue')}</h3>
              <span className="font-condensed text-xs text-clark-text-muted/50">({queue.length} {t('tracks')})</span>
            </div>
          </div>

          {/* Queue content */}
          <div className="flex-1 overflow-y-auto px-3 py-2">
            {queue.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Music className="w-10 h-10 text-clark-text-muted/30 mb-3" />
                <p className="font-body text-sm text-clark-text-muted/50">{t('noTracksInQueue')}</p>
                <p className="font-body text-xs text-clark-text-muted/30 mt-1">{t('browseTracks')}</p>
              </div>
            ) : (
              <ul className="space-y-1">
                {queue.map((track, idx) => (
                  <li key={`${track.id}-${idx}`}>
                    <button
                      onClick={() => {
                        const store = usePlayerStore.getState()
                        // Only update if it's a different track
                        if (idx !== store.queueIndex) {
                          usePlayerStore.setState({
                            queueIndex: idx,
                            currentTrack: track,
                            progress: 0,
                            isPlaying: true,
                            isPreview: false,
                          })
                        }
                      }}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors pointer-events-auto',
                        idx === queueIndex
                          ? 'bg-clark-gold/10 text-clark-gold ring-1 ring-clark-gold/30'
                          : 'text-clark-text-muted hover:text-clark-text-primary hover:bg-clark-steel/10',
                      )}
                    >
                    <div className="relative flex-shrink-0 w-8 h-8 rounded bg-clark-steel/30 flex items-center justify-center overflow-hidden">
                      {track.coverUrl ? (
                        <img src={track.coverUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <Music className="w-4 h-4" />
                      )}
                      {idx === queueIndex && isPlaying && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center gap-0.5">
                          <span className="w-0.5 h-3 bg-clark-gold rounded-full animate-equalizer" style={{ animationDelay: '0ms' }} />
                          <span className="w-0.5 h-3 bg-clark-gold rounded-full animate-equalizer" style={{ animationDelay: '150ms' }} />
                          <span className="w-0.5 h-3 bg-clark-gold rounded-full animate-equalizer" style={{ animationDelay: '300ms' }} />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={cn(
                        'font-body text-sm truncate',
                        idx === queueIndex ? 'text-clark-gold' : 'text-clark-text-primary',
                      )}>
                        {track.title}
                      </p>
                      <p className="font-body text-xs text-clark-text-muted/70 truncate">{track.artist}</p>
                    </div>
                    <span className="font-condensed text-xs text-clark-text-muted/50 flex-shrink-0">
                      {formatTime(track.duration)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main
        style={{
          marginLeft: sidebarOpen ? `${sidebarWidth}px` : '0px',
          paddingBottom: 'calc(100px + env(safe-area-inset-bottom, 0px))',
          transition: 'margin-left 300ms ease-in-out',
        }}
        className="flex-1 overflow-y-auto relative"
      >
        {/* Aurora borealis effect — covers full viewport from top to bottom */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className={cn(
            'absolute inset-0 aurora-gradient',
            auraAnimation,
          )} />
          <div className={cn(
            'absolute top-0 left-0 right-0 h-1/2 aurora-gradient-soft',
            auraAnimationSoft,
          )} />
          <div className={cn(
            'absolute bottom-0 left-0 right-0 h-1/2 aurora-gradient-mid',
            auraAnimationMid,
          )} />
        </div>
        <AuthGuard>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
            {children}
          </div>
        </AuthGuard>
        <GlobalFooter />
      </main>

      {/* Player bar — 3-region architecture: Left | Center (absolute) | Right */}
      <footer
        style={{
          position: 'fixed',
          left: sidebarOpen && !isMobile ? `${sidebarWidth}px` : '0px',
          right: rightPanelOpen && !isMobile ? `${rightPanelWidth}px` : '0px',
          bottom: '0px',
          zIndex: 30,
          height: 'auto',
          minHeight: '96px',
          backgroundColor: accentColor + '18',
          borderTopColor: accentColor + '50',
          transition: 'left 300ms ease-in-out, right 300ms ease-in-out, transform 400ms cubic-bezier(0.4, 0, 0.2, 1)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          transform: isPlayerVisible ? 'translateY(0)' : 'translateY(calc(100% + 1.5rem))',
        }}
        className="border-t px-3 sm:px-4 flex items-center justify-between pointer-events-auto backdrop-blur-md"
      >
        {/* ── LEFT REGION: Track info ── */}
        <div className="hidden sm:flex items-center gap-3 min-w-0 w-56 flex-shrink-0">
          {displayTrack ? (
            <>
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 rounded-md blur-md animate-gold-pulse" style={{ backgroundColor: accentColor + '30' }} />
                <div className="relative w-12 h-12 rounded-md bg-gradient-to-br from-clark-steel to-clark-accent flex items-center justify-center overflow-hidden" style={{ boxShadow: `0 0 12px ${accentColor}40` }}>
                  {displayTrack.coverUrl ? (
                    <img src={displayTrack.coverUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <Music className="w-5 h-5 text-white/70" />
                  )}
                </div>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-display text-sm tracking-wider truncate">{displayTrack.title}</p>
                  {isPreview && (
                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-clark-gold/15 text-clark-gold font-condensed text-[10px] uppercase tracking-wider flex-shrink-0">
                      <Headphones className="w-3 h-3" /> Preview
                    </span>
                  )}
                </div>
                <p className="font-body text-xs text-clark-text-muted truncate">{displayTrack.artist}</p>
              </div>
              <button className="ml-2 text-clark-text-muted hover:text-clark-accent transition-colors" aria-label={t('toggleFavorite')}>
                <Heart className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="min-w-0">
              <p className="font-display text-sm tracking-wider text-clark-text-muted/50 truncate">No track playing</p>
              <p className="font-body text-xs text-clark-text-muted/30 truncate">{'\u00A0'}</p>
            </div>
          )}
        </div>

        {/* ── CENTER REGION: absolutely centered — never affected by left/right ── */}
        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5 w-full max-w-[320px] sm:max-w-md px-2">
          {/* Toggle */}
          <button
            onClick={() => setPlayerVisible(false)}
            className="w-24 h-7 flex items-center justify-center mt-0 rounded-b-lg bg-clark-bg-card/60 hover:bg-clark-bg-card border-b border-x border-clark-steel/20 text-clark-text-muted/60 hover:text-clark-gold transition-colors"
            aria-label={t('hidePlayer')}
          >
            <ChevronDown className="w-4 h-4" />
          </button>

          {/* Controls row */}
          <div className="flex items-center justify-center gap-3 sm:gap-5 py-0.5">
            <button className={cn('p-2 text-clark-text-muted hover:text-clark-gold transition-colors', isShuffled && 'text-clark-gold')} onClick={toggleShuffle} aria-label={t('toggleShuffle')} style={{ minWidth: '44px', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shuffle className="w-4 h-4" />
            </button>
            <button className="p-2 text-clark-text-muted/80 hover:text-clark-text-primary transition-colors" onClick={prevTrack} aria-label={t('previousTrack')} style={{ minWidth: '44px', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <SkipBack className="w-5 h-5" />
            </button>
            <button className="relative w-11 h-11 rounded-full bg-clark-accent hover:bg-clark-accent-hover flex items-center justify-center transition-all hover:scale-105 group flex-shrink-0" style={{ boxShadow: `0 0 14px ${accentColor}60`, minWidth: '44px', minHeight: '44px' }} onClick={() => { if (isPreview && isPlaying) stopPreview(); else togglePlay() }} aria-label={isPlaying ? t('pauseBtn') : t('playBtn')}>
              <div className="absolute inset-0 rounded-full bg-clark-gold/20 blur-sm group-hover:bg-clark-gold/40 transition-colors" />
              <div className="relative flex items-center justify-center">
                {isPlaying ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white ml-0.5" />}
              </div>
            </button>
            <button className="p-2 text-clark-text-muted/80 hover:text-clark-text-primary transition-colors" onClick={nextTrack} aria-label={t('nextTrack')} style={{ minWidth: '44px', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <SkipForward className="w-5 h-5" />
            </button>
            <button className={cn('p-2 text-clark-text-muted hover:text-clark-gold transition-colors', repeatMode !== 'off' && 'text-clark-gold')} onClick={toggleRepeat} aria-label={t('toggleRepeat')} style={{ minWidth: '44px', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
            </button>
          </div>

          {/* Progress bar */}
          <div className="flex items-center justify-center gap-2 w-full px-1 pb-0.5">
            <span className="font-condensed text-[10px] sm:text-xs text-clark-text-muted w-8 sm:w-10 text-right tabular-nums flex-shrink-0">{formatTime(progress)}</span>
            <div className="flex-1 py-2 cursor-pointer group relative" onClick={(e) => { const rect = e.currentTarget.getBoundingClientRect(); const pct = (e.clientX - rect.left) / rect.width; seek(pct * trackDuration) }} role="slider" aria-label="Track progress" aria-valuemin={0} aria-valuemax={trackDuration} aria-valuenow={progress} tabIndex={0}>
              <div className="h-1.5 bg-clark-bg-secondary rounded-full relative">
                <div className="h-full rounded-full relative group-hover:brightness-110 transition-all" style={{ width: `${trackDuration > 0 ? (progress / trackDuration) * 100 : 0}%`, backgroundColor: accentColor, boxShadow: `0 0 8px ${accentColor}80` }}>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: accentColor, boxShadow: `0 0 10px ${accentColor}` }} />
                </div>
              </div>
            </div>
            <span className="font-condensed text-[10px] sm:text-xs text-clark-text-muted w-8 sm:w-10 tabular-nums flex-shrink-0">{formatTime(trackDuration)}</span>
          </div>
        </div>

        {/* ── RIGHT REGION: Volume + queue ── */}
        <div className="hidden sm:flex items-center justify-end gap-2 w-56 flex-shrink-0">
          {sleepTimer && (
            <span className="font-body text-xs bg-clark-steel/20 px-2 py-1 rounded text-clark-text-muted border border-clark-steel/30">{'\u23FE'} {t('sleepBtn')}</span>
          )}
          <button className="p-2 text-clark-text-muted hover:text-clark-sky transition-colors" aria-label={t('lyricsBtn')}><FileText className="w-4 h-4" /></button>
          <button className="p-2 text-clark-text-muted hover:text-clark-sky transition-colors" aria-label={t('queue')}><ListOrdered className="w-4 h-4" /></button>
          <div className="flex flex-col items-center justify-center gap-1">
            <div className="flex items-center justify-center" style={{ height: '50px' }}>
              <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} className="appearance-none cursor-pointer rounded-full" style={{ transform: 'rotate(-90deg)', width: '50px', height: '3px', margin: '0', background: `linear-gradient(to right, #F5C518 ${volume * 100}%, #0D1B4B ${volume * 100}%)` }} aria-label={t('volumeLabel')} />
            </div>
            <Volume2 className="w-3.5 h-3.5 text-clark-text-muted" />
          </div>
        </div>
      </footer>

      {/* Arrow-up toggle — shown when player is hidden, JS-calculated center */}
      <button
        onClick={() => setPlayerVisible(true)}
        style={{
          position: 'fixed',
          left: `${toggleCenter}px`,
          bottom: '0px',
          zIndex: 30,
        }}
        className={cn(
          'w-20 h-10 rounded-t-lg bg-clark-bg-card/80 backdrop-blur-md border border-clark-steel/30 border-b-0',
          'text-clark-text-muted hover:text-clark-gold hover:bg-clark-bg-card transition-all duration-200',
          'shadow-lg shadow-black/20 flex items-center justify-center',
          isPlayerVisible ? 'opacity-0 pointer-events-none' : 'opacity-100',
          'transition-all duration-300',
        )}
        aria-label={t('showPlayer')}
        title={t('showPlayer')}
      >
        <ArrowUp className="w-4 h-4" />
      </button>
    </div>
    </AppShellContext.Provider>
  )
}
