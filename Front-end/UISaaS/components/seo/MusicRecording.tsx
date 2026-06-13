import { StructuredData } from './StructuredData'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://clark-player.vercel.app'

interface MusicRecordingProps {
  name: string
  url: string
  byArtist?: string
  duration?: string // ISO 8601 duration (PT4M30S)
  image?: string
  genre?: string[]
  mbid?: string
  datePublished?: string
}

/**
 * MusicRecording structured data for Track detail pages.
 */
export function MusicRecordingStructuredData({
  name,
  url,
  byArtist,
  duration,
  image,
  genre,
  mbid,
  datePublished,
}: MusicRecordingProps) {
  const data: Record<string, unknown> = {
    '@type': 'MusicRecording',
    name,
    url: url.startsWith('http') ? url : `${SITE_URL}${url}`,
  }

  if (byArtist) {
    data.byArtist = {
      '@type': 'MusicGroup',
      name: byArtist,
    }
  }

  if (duration) {
    data.duration = duration
  }

  if (image) {
    data.image = image
  }

  if (genre && genre.length > 0) {
    data.genre = genre
  }

  if (mbid) {
    data['@id'] = `https://musicbrainz.org/recording/${mbid}`
  }

  if (datePublished) {
    data.datePublished = datePublished
  }

  return <StructuredData data={data} id="musicrecording-structured-data" />
}
