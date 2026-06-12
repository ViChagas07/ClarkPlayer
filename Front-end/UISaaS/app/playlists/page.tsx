'use client'

import { useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { CreatePlaylistModal } from '@/components/playlist/CreatePlaylistModal'
import { usePlaylistStore } from '@/store/playlistStore'
import { usePlayerStore } from '@/store/playerStore'
import { useTranslation } from '@/hooks/useTranslation'
import { Plus, Play, Lock, Clock, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

function formatDuration(totalSeconds: number): string {
  const hrs = Math.floor(totalSeconds / 3600)
  const mins = Math.floor((totalSeconds % 3600) / 60)
  if (hrs > 0) return `${hrs}h ${mins}m`
  return `${mins} min`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

type SortKey = 'name' | 'updated' | 'plays' | 'created'

export default function PlaylistsPage() {
  const { t } = useTranslation()
  const { playlists, createPlaylist } = usePlaylistStore()
  const { setQueue } = usePlayerStore()
  const [showModal, setShowModal] = useState(false)
  const [sortKey, setSortKey] = useState<SortKey>('updated')

  const sorted = [...playlists].sort((a, b) => {
    switch (sortKey) {
      case 'name': return a.name.localeCompare(b.name)
      case 'updated': return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      case 'plays': return b.playCount - a.playCount
      case 'created': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      default: return 0
    }
  })

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl tracking-widest uppercase mb-4">{t('yourPlaylists')}</h1>
        </div>

        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-body text-sm text-clark-text-muted">{t('sortLabel')}</span>
            {([
              ['name', t('sortAZ')],
              ['updated', t('sortRecentlyUpdated')],
              ['plays', t('sortMostPlayed')],
              ['created', t('sortDateCreated')],
            ] as [SortKey, string][]).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setSortKey(key)}
                className={cn(
                  'px-3 py-1.5 rounded-full font-body font-medium text-xs transition-colors',
                  sortKey === key ? 'bg-clark-accent text-white' : 'bg-clark-bg-secondary text-clark-text-muted hover:text-clark-text-primary',
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-clark-accent hover:bg-clark-accent-hover font-body font-semibold text-sm text-white rounded-lg transition-colors flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            {t('newPlaylist')}
          </button>
        </div>

        {playlists.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 rounded-2xl bg-clark-bg-secondary border border-clark-steel/20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-clark-bg-card flex items-center justify-center mb-4">
              <Plus className="w-8 h-8 text-clark-text-muted" />
            </div>
            <h2 className="font-display text-xl tracking-wider text-clark-text-primary mb-2">No playlists yet</h2>
            <p className="font-body text-sm text-clark-text-muted max-w-md mb-6">Create your first playlist</p>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-clark-accent hover:bg-clark-accent-hover font-body font-semibold text-white rounded-lg transition-all hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              {t('createPlaylist')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sorted.map((pl) => (
              <div
                key={pl.id}
                className="group bg-clark-bg-secondary rounded-xl border border-clark-steel/20 overflow-hidden hover:border-clark-steel/60 transition-colors cursor-pointer"
                onClick={() => setQueue(pl.tracks, 0)}
              >
                <div className="relative aspect-square bg-clark-bg-card overflow-hidden">
                  <div className="grid grid-cols-2 grid-rows-2 w-full h-full">
                    {pl.tracks.slice(0, 4).map((t, i) => (
                      <div
                        key={i}
                        className={cn(
                          'flex items-center justify-center',
                          i === 0 ? 'bg-gradient-to-br from-clark-steel to-clark-bg-secondary' :
                          i === 1 ? 'bg-gradient-to-br from-clark-accent/80 to-clark-bg-secondary' :
                          i === 2 ? 'bg-gradient-to-br from-clark-gold/80 to-clark-bg-secondary' :
                          'bg-gradient-to-br from-clark-bg-card to-clark-bg-secondary',
                        )}
                      >
                        <span className="font-display text-white/30 text-2xl">{t.title.charAt(0)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-clark-accent flex items-center justify-center shadow-glow">
                      <Play className="w-6 h-6 text-white ml-0.5" />
                    </div>
                  </div>
                  {pl.isPrivate && (
                    <div className="absolute top-3 right-3 p-1.5 bg-black/50 rounded-full">
                      <Lock className="w-3.5 h-3.5 text-clark-text-muted" />
                    </div>
                  )}
                  {pl.isCollaborative && (
                    <div className="absolute top-3 left-3 flex -space-x-1">
                      {pl.collaborators.slice(0, 3).map((c, i) => (
                        <div key={i} className="w-6 h-6 rounded-full bg-clark-accent border-2 border-clark-bg-secondary flex items-center justify-center text-[10px] font-condensed text-white">
                          {c.displayName.charAt(0)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-display tracking-wider text-clark-text-primary truncate">{pl.name}</h3>
                  <div className="flex items-center gap-3 mt-2 font-body text-xs text-clark-text-muted">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {pl.tracks.length} {t('tracks')} · {formatDuration(pl.totalDuration)}
                    </span>
                  </div>
                  <p className="font-body text-xs text-clark-text-muted mt-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {t('updated')} {formatDate(pl.updatedAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <CreatePlaylistModal
          onClose={() => setShowModal(false)}
          onCreate={(data) => {
            createPlaylist(data)
            setShowModal(false)
          }}
        />
      )}
    </AppShell>
  )
}
