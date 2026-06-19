import { api } from '@/lib/api'
import { usePlayerStore } from '@/store/playerStore'
import type { CatalogTrackItem, Track } from '@/types'

function toTrack(item: CatalogTrackItem, idx: number): Track {
  return {
    id: item.id ?? `track-${idx}`,
    title: item.title,
    artist: item.artist_name,
    album: item.album_title ?? '',
    duration: item.duration_ms ? Math.round(item.duration_ms / 1000) : 30,
    format: 'MP3',
    coverUrl: item.album_cover ?? undefined,
    previewUrl: item.preview_url ?? null,
    isPreview: true,
  }
}

/**
 * Play a track preview AND auto-populate the queue with sibling tracks
 * from the same album.  If the track has no album, just plays it solo.
 */
export async function playWithAlbumQueue(item: CatalogTrackItem, idx: number) {
  if (!item.preview_url) return

  const store = usePlayerStore.getState()

  // 1. Play the track immediately
  store.playPreview(item.preview_url, toTrack(item, idx))

  // 2. If the track belongs to an album, fetch album tracks for the queue
  if (item.album_id) {
    try {
      const albumTracks = await api.catalogAlbumTracks(item.album_id)
      if (albumTracks.length > 0) {
        const queue: Track[] = albumTracks
          .filter((t) => t.preview_url) // only tracks with preview
          .map((t, i) => toTrack(t, i))

        if (queue.length > 0) {
          // Find this track's position in the album queue
          const currentIndex = queue.findIndex((t) => t.id === item.id)
          store.setQueue(queue, currentIndex >= 0 ? currentIndex : 0)
        }
      }
    } catch {
      // Album fetch failed — just play the single track, no queue
    }
  }
}
