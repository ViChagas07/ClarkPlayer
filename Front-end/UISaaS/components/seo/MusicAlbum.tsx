import { StructuredData } from './StructuredData'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://clark-player.vercel.app'

interface MusicAlbumProps {
  name: string
  url: string
  byArtist?: string
  image?: string
  genre?: string[]
  numTracks?: number
  datePublished?: string
  mbid?: string
}

/**
 * MusicAlbum structured data for Album pages.
 */
export function MusicAlbumStructuredData({
  name,
  url,
  byArtist,
  image,
  genre,
  numTracks,
  datePublished,
  mbid,
}: MusicAlbumProps) {
  const data: Record<string, unknown> = {
    '@type': 'MusicAlbum',
    name,
    url: url.startsWith('http') ? url : `${SITE_URL}${url}`,
  }

  if (byArtist) {
    data.byArtist = {
      '@type': 'MusicGroup',
      name: byArtist,
    }
  }

  if (image) {
    data.image = image
  }

  if (genre && genre.length > 0) {
    data.genre = genre
  }

  if (numTracks !== undefined) {
    data.numTracks = numTracks
  }

  if (datePublished) {
    data.datePublished = datePublished
  }

  if (mbid) {
    data['@id'] = `https://musicbrainz.org/release/${mbid}`
  }

  return <StructuredData data={data} id="musicalbum-structured-data" />
}
