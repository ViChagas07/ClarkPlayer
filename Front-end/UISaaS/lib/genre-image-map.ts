/**
 * Genre Image Registry
 *
 * Maps genre slugs to local images in public/genres/.
 * Images are served by Next.js from /genres/<filename>.
 *
 * When a genre slug has a matching image, the genre card will display it.
 * When no image is found, the existing gradient fallback is used instead.
 *
 * No external API calls. No generated images. Purely static local assets.
 */

export const GENRE_IMAGE_MAP: Record<string, string> = {
  rock: '/genres/Rock_Guitar.png',
  jazz: '/genres/Jazz.png',
  classical: '/genres/Classical.png',
  rnb: '/genres/RnB.png',
  'hip-hop': '/genres/HipHop.png',
  ambient: '/genres/Ambient.png',
  electronic: '/genres/Electronic.png',
  reggae: '/genres/Reggae.png',
  samba: '/genres/Samba.png',
  latin: '/genres/Latin.png',
  gospel: '/genres/Gospel.png',
  pagode: '/genres/Pagode.png',
  'heavy-metal': '/genres/HeavyMetal.png',
  rap: '/genres/Rap.png',
  forro: '/genres/Forro.png',
  funk: '/genres/Funk.png',
  sertanejo: '/genres/Sertanejo.png',
  romantic: '/genres/Romantic.png',
  trap: '/genres/Trap.png',
}

/**
 * Look up the local image path for a genre slug.
 * Returns the image URL if available, or null to trigger gradient fallback.
 */
export function getGenreImage(slug: string): string | null {
  return GENRE_IMAGE_MAP[slug] ?? null
}
