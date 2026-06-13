import { StructuredData } from './StructuredData'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://clark-player.vercel.app'

interface MusicGroupProps {
  name: string
  url: string
  image?: string
  description?: string
  genre?: string[]
  /** MusicBrainz ID for disambiguation */
  mbid?: string
}

/**
 * MusicGroup structured data for Artist pages.
 * Schema.org type for bands, solo artists, orchestras, etc.
 */
export function MusicGroupStructuredData({
  name,
  url,
  image,
  description,
  genre,
  mbid,
}: MusicGroupProps) {
  const data: Record<string, unknown> = {
    '@type': 'MusicGroup',
    name,
    url: url.startsWith('http') ? url : `${SITE_URL}${url}`,
  }

  if (image) {
    data.image = image
  }

  if (description) {
    data.description = description
  }

  if (genre && genre.length > 0) {
    data.genre = genre
  }

  if (mbid) {
    data['@id'] = `https://musicbrainz.org/artist/${mbid}`
    data.sameAs = [`https://musicbrainz.org/artist/${mbid}`]
  }

  return <StructuredData data={data} id="musicgroup-structured-data" />
}
