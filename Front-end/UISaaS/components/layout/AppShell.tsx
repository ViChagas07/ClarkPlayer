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
  ChevronLeft,
  Disc3,
  ArrowUp,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { usePlayerStore } from '@/store/playerStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useAuthStore } from '@/store/authStore'
import { useSidebarStore } from '@/store/sidebarStore'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { mockTracks } from '@/lib/mockData'
import { api } from '@/lib/api'
import { useTranslation } from '@/hooks/useTranslation'

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

/** Picks a random element from an array using crypto‑grade randomness. */
function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation()
  const pathname = usePathname()
  const router = useRouter()
  const { isOpen: sidebarOpen, width: sidebarWidth, toggle: toggleSidebar } = useSidebarStore()
  const [rightPanelOpen, setRightPanelOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  /* ── Pick 3 random animations on first render (per session) ─────── */
  const [auraAnimation] = useState(() => pickRandom(AURA_ANIMATIONS))
  const [auraAnimationSoft] = useState(() => pickRandom(AURA_ANIMATIONS))
  const [auraAnimationMid] = useState(() => pickRandom(AURA_ANIMATIONS))

  const {
    currentTrack, isPlaying, progress, volume, isShuffled, repeatMode,
    queue, queueIndex, isPlayerVisible,
    togglePlay, nextTrack, prevTrack, setProgress, setVolume,
    toggleShuffle, toggleRepeat, setPlayerVisible,
  } = usePlayerStore()
  const { sleepTimer, accentColor } = useSettingsStore()
  const { user, isAuthenticated, refreshToken, accessToken } = useAuthStore()
  const clearSession = useAuthStore((s) => s.clearSession)

  const displayTrack = currentTrack ?? mockTracks[0]
  const trackDuration = displayTrack.duration ?? 240

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
    <div className="flex h-screen bg-clark-bg-primary text-clark-text-primary overflow-hidden">
      {/* Standalone sidebar toggle — visible only when sidebar is closed */}
      <button
        onClick={() => {
          toggleSidebar()
          if (isMobile && rightPanelOpen) setRightPanelOpen(false)
        }}
        className={cn(
          'fixed left-0 top-1/2 -translate-y-1/2 z-50 pointer-events-auto',
          'w-12 sm:w-7 h-20 rounded-r-lg bg-clark-bg-card/80 backdrop-blur-md border border-clark-steel/30 border-l-0',
          'text-clark-text-muted hover:text-clark-gold hover:bg-clark-bg-card transition-all duration-300',
          'shadow-lg shadow-black/20',
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
          <button
            onClick={handleLogout}
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
            'w-12 sm:w-7 h-20 rounded-l-lg bg-clark-bg-card/80 backdrop-blur-md border border-clark-steel/30 border-r-0',
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
                      className={cn(
                        'group flex items-center gap-3 px-3 py-2.5 rounded-lg font-body font-medium text-sm transition-all duration-200',
                        isActive
                          ? 'bg-clark-steel/20 text-clark-accent border-l-2 border-clark-accent pl-[10px]'
                          : 'text-clark-text-muted hover:text-clark-text-primary hover:bg-clark-steel/25 border-l-2 border-transparent pl-[10px]',
                      )}
          onClick={() => toggleSidebar()}
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

      {/* Open button — outside panel, visible only when panel is closed */}
      {!rightPanelOpen && (
        <button
          onClick={() => {
            setRightPanelOpen(true)
            if (isMobile && sidebarOpen) toggleSidebar()
          }}
          className={cn(
            'fixed top-1/2 right-0 -translate-y-1/2 z-50 pointer-events-auto',
            'w-12 sm:w-7 h-20 rounded-l-lg bg-clark-bg-card/80 backdrop-blur-md border border-clark-steel/30 border-r-0',
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
          'fixed right-0 top-0 h-full w-80 flex flex-col pointer-events-auto backdrop-blur-xl',
          'border-l border-clark-steel/20 shadow-2xl shadow-black/40',
          'transition-transform duration-300 ease-out',
          rightPanelOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
          {/* Close button — inside the panel, on its left wall */}
          <button
            onClick={() => setRightPanelOpen(false)}
            className={cn(
              'absolute top-1/2 left-0 -translate-y-1/2 z-40 pointer-events-auto',
              'w-12 sm:w-7 h-20 rounded-r-lg bg-clark-bg-card/80 backdrop-blur-md border border-clark-steel/30 border-l-0',
              'text-clark-text-muted hover:text-clark-gold hover:bg-clark-bg-card transition-all duration-200',
              'shadow-lg shadow-black/20 flex items-center justify-center',
            )}
            aria-label={t('closeNowPlayingPanel')}
            title={t('nowPlaying')}
          >
            <Music className="w-4 h-4" />
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
          <div className="px-5 py-6 border-b border-clark-steel/10">
            <div className="relative mx-auto mb-4 w-48 h-48">
              <div className="absolute inset-0 rounded-xl bg-clark-gold/15 blur-2xl" />
              <div className="relative w-full h-full rounded-xl bg-gradient-to-br from-clark-steel to-clark-accent flex items-center justify-center ring-1 ring-clark-gold/30 overflow-hidden">
                <Disc3 className="w-20 h-20 text-white/40" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
            </div>
            <h3 className="font-display text-xl tracking-wider text-clark-text-primary truncate text-center">
              {displayTrack.title}
            </h3>
            <p className="font-body text-sm text-clark-text-muted truncate text-center mt-1">
              {displayTrack.artist}
            </p>
          </div>

          {/* Queue */}
          <div className="flex-1 overflow-y-auto px-3 py-4">
            <div className="flex items-center gap-2 mb-3 px-2">
              <ListOrdered className="w-4 h-4 text-clark-gold" />
              <h3 className="font-condensed text-xs tracking-widest text-clark-text-muted uppercase">{t('queue')}</h3>
              <span className="font-condensed text-xs text-clark-text-muted/50">({queue.length} {t('tracks')})</span>
            </div>

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
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors pointer-events-auto',
                        idx === queueIndex
                          ? 'bg-clark-gold/10 text-clark-gold ring-1 ring-clark-gold/30'
                          : 'text-clark-text-muted hover:text-clark-text-primary hover:bg-clark-steel/10',
                      )}
                    >
                    <div className="relative flex-shrink-0 w-8 h-8 rounded bg-clark-steel/30 flex items-center justify-center">
                      {idx === queueIndex && isPlaying ? (
                        <div className="flex items-end gap-0.5 h-3">
                          <span className="w-0.5 bg-clark-gold rounded-full animate-equalizer" style={{ animationDelay: '0ms' }} />
                          <span className="w-0.5 bg-clark-gold rounded-full animate-equalizer" style={{ animationDelay: '150ms' }} />
                          <span className="w-0.5 bg-clark-gold rounded-full animate-equalizer" style={{ animationDelay: '300ms' }} />
                        </div>
                      ) : (
                        <Music className="w-4 h-4" />
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
          paddingBottom: '96px',
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
          <div className="relative max-w-7xl mx-auto px-6 py-8">
            {children}
          </div>
        </AuthGuard>
      </main>

      {/* Player bar — centered controls, slides fully off-screen when hidden */}
      <footer
        style={{
          position: 'fixed',
          left: sidebarOpen ? `${sidebarWidth}px` : '0px',
          right: rightPanelOpen ? '320px' : '0px',
          bottom: '0px',
          zIndex: 30,
          height: '96px',
          backgroundColor: accentColor + '14',
          transition: 'left 300ms ease-in-out, right 300ms ease-in-out, transform 300ms ease-in-out',
        }}
        className={cn(
          'border-t border-clark-steel/30 px-2 sm:px-4 flex items-center justify-center gap-2 sm:gap-8 pointer-events-auto backdrop-blur-md',
          isPlayerVisible ? 'translate-y-0' : 'translate-y-[calc(100%+1.5rem)]',
        )}
      >
        {/* Track info — left (hidden on mobile) */}
        <div className="hidden sm:flex items-center gap-3 w-56 flex-shrink-0">
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 rounded-md bg-clark-gold/20 blur-md animate-gold-pulse" />
            <div className="relative w-12 h-12 rounded-md bg-gradient-to-br from-clark-steel to-clark-accent flex items-center justify-center ring-1 ring-clark-gold/40">
              <Music className="w-5 h-5 text-white/70" />
            </div>
          </div>
          <div className="min-w-0">
            <p className="font-display text-sm tracking-wider truncate">{displayTrack.title}</p>
            <p className="font-body text-xs text-clark-text-muted truncate">{displayTrack.artist}</p>
          </div>
          <button className="ml-2 text-clark-text-muted hover:text-clark-accent transition-colors" aria-label={t('toggleFavorite')}>
            <Heart className="w-4 h-4" />
          </button>
        </div>

        {/* Controls — center */}
        <div className="flex flex-col items-center justify-center gap-1">
          <div className="flex items-center justify-center gap-5">
            <button
              className={cn(
                'font-body text-clark-text-muted hover:text-clark-gold transition-colors',
                isShuffled && 'text-clark-gold'
              )}
              onClick={toggleShuffle}
              aria-label={t('toggleShuffle')}
            >
              <Shuffle className="w-4 h-4" />
            </button>
            <button className="font-body text-clark-text-muted/80 hover:text-clark-text-primary transition-colors" onClick={prevTrack} aria-label={t('previousTrack')}>
              <SkipBack className="w-5 h-5" />
            </button>
            <button
              className="relative w-10 h-10 rounded-full bg-clark-accent hover:bg-clark-accent-hover flex items-center justify-center transition-all hover:scale-105 group"
              onClick={togglePlay}
              aria-label={isPlaying ? t('pauseBtn') : t('playBtn')}
            >
              <div className="absolute inset-0 rounded-full bg-clark-gold/20 blur-sm group-hover:bg-clark-gold/40 transition-colors" />
              <div className="relative flex items-center justify-center">
                {isPlaying
                  ? <Pause className="w-5 h-5 text-white" />
                  : <Play className="w-5 h-5 text-white ml-0.5" />
                }
              </div>
            </button>
            <button className="font-body text-clark-text-muted/80 hover:text-clark-text-primary transition-colors" onClick={nextTrack} aria-label={t('nextTrack')}>
              <SkipForward className="w-5 h-5" />
            </button>
            <button
              className={cn(
                'font-body text-clark-text-muted hover:text-clark-gold transition-colors',
                repeatMode !== 'off' && 'text-clark-gold'
              )}
              onClick={toggleRepeat}
              aria-label={t('toggleRepeat')}
            >
              {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
            </button>
          </div>

          {/* Progress bar — center */}
          <div className="flex items-center gap-2 w-full sm:max-w-md">
            <span className="font-condensed text-xs text-clark-text-muted w-10 text-right tabular-nums">{formatTime(progress)}</span>
            <div
              className="flex-1 h-1.5 bg-clark-bg-secondary rounded-full cursor-pointer group relative"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                const pct = (e.clientX - rect.left) / rect.width
                setProgress(pct * trackDuration)
              }}
            >
              <div
                className="h-full bg-gradient-to-r from-clark-gold to-clark-gold-hover rounded-full relative group-hover:brightness-110 transition-all"
                style={{ width: `${(progress / trackDuration) * 100}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-clark-gold rounded-full shadow-glow-gold opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
            <span className="font-condensed text-xs text-clark-text-muted w-10 tabular-nums">{formatTime(trackDuration)}</span>
          </div>
        </div>

        {/* Volume — right (hidden on mobile) */}
        <div className="hidden sm:flex items-center justify-end gap-2 w-56 flex-shrink-0">
          {sleepTimer && (
            <span className="font-body text-xs bg-clark-steel/20 px-2 py-1 rounded text-clark-text-muted border border-clark-steel/30">
              {'\u23FE'} {t('sleepBtn')}
            </span>
          )}
          <button className="font-body text-clark-text-muted hover:text-clark-sky transition-colors" aria-label={t('lyricsBtn')}>
            <FileText className="w-4 h-4" />
          </button>
          <button className="font-body text-clark-text-muted hover:text-clark-sky transition-colors" aria-label={t('queue')}>
            <ListOrdered className="w-4 h-4" />
          </button>
          {/* Volume slider — vertical */}
          <div className="flex flex-col items-center justify-center gap-1">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="appearance-none cursor-pointer rounded-full bg-clark-bg-secondary"
              style={{
                transform: 'rotate(-90deg)',
                width: '72px',
                height: '4px',
                margin: '42px 0 26px 0',
                background: `linear-gradient(to right, #F5C518 ${volume * 100}%, #0D1B4B ${volume * 100}%)`,
              }}
              aria-label={t('volumeLabel')}
            />
            <Volume2 className="w-4 h-4 text-clark-text-muted mt-2" />
          </div>
        </div>

        {/* Close (X) button — right edge of player bar */}
        <button
          onClick={() => setPlayerVisible(false)}
          className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-clark-text-muted/50 hover:text-clark-accent hover:bg-clark-steel/20 transition-colors"
          aria-label={t('hidePlayer')}
          title={t('hidePlayer')}
        >
          <X className="w-4 h-4" />
        </button>
      </footer>

      {/* Arrow-up toggle — shown when player is hidden */}
      <button
        onClick={() => setPlayerVisible(true)}
        className={cn(
          'fixed bottom-0 left-1/2 -translate-x-1/2 z-30 pointer-events-auto flex items-center justify-center',
          'w-12 sm:w-10 h-8 sm:h-6 rounded-t-lg bg-clark-bg-card/80 backdrop-blur-md border border-clark-steel/30 border-b-0',
          'text-clark-text-muted hover:text-clark-gold hover:bg-clark-bg-card transition-all duration-200',
          'shadow-lg shadow-black/20',
          isPlayerVisible ? 'opacity-0 pointer-events-none translate-y-full' : 'opacity-100 translate-y-0',
          'transition-all duration-300',
        )}
        aria-label={t('showPlayer')}
        title={t('showPlayer')}
      >
        <ArrowUp className="w-4 h-4" />
      </button>
    </div>
  )
}
