/**
 * Genre Image Registry & Gradient Generator
 *
 * Maps genre slugs to local images in public/genres/.
 * Images are served by Next.js from /genres/<filename>.
 *
 * When a genre slug has a matching image, use it.
 * When no image is found, a deterministic gradient is generated
 * based on the slug hash — never falling back to another genre's image.
 *
 * No external API calls. No generated images. Purely static local assets.
 */

// ── Image Map ──────────────────────────────────────────────────────────

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
 * Returns the image URL if available, or null → use gradient fallback.
 */
export function getGenreImage(slug: string): string | null {
  return GENRE_IMAGE_MAP[slug] ?? null
}

// ── Deterministic Gradient Generator ───────────────────────────────────

const GENRE_GRADIENTS: { from: string; to: string }[] = [
  { from: 'from-red-600', to: 'to-orange-500' },
  { from: 'from-blue-600', to: 'to-cyan-400' },
  { from: 'from-purple-600', to: 'to-pink-400' },
  { from: 'from-green-600', to: 'to-emerald-400' },
  { from: 'from-yellow-500', to: 'to-amber-400' },
  { from: 'from-indigo-600', to: 'to-violet-400' },
  { from: 'from-rose-600', to: 'to-red-400' },
  { from: 'from-teal-600', to: 'to-green-400' },
  { from: 'from-orange-600', to: 'to-yellow-400' },
  { from: 'from-sky-600', to: 'to-blue-400' },
  { from: 'from-fuchsia-600', to: 'to-purple-400' },
  { from: 'from-lime-600', to: 'to-green-500' },
  { from: 'from-cyan-600', to: 'to-teal-400' },
  { from: 'from-amber-600', to: 'to-orange-400' },
  { from: 'from-pink-600', to: 'to-rose-400' },
  { from: 'from-violet-600', to: 'to-purple-400' },
  { from: 'from-emerald-600', to: 'to-teal-500' },
  { from: 'from-slate-700', to: 'to-gray-500' },
  { from: 'from-stone-700', to: 'to-neutral-500' },
  { from: 'from-zinc-700', to: 'to-stone-500' },
]

/**
 * Deterministic gradient for a genre slug.
 * Same slug always returns the same gradient — no randomness.
 */
export function getGenreGradient(slug: string): { from: string; to: string } {
  let hash = 0
  for (let i = 0; i < slug.length; i++) {
    hash = ((hash << 5) - hash) + slug.charCodeAt(i)
  }
  return GENRE_GRADIENTS[Math.abs(hash) % GENRE_GRADIENTS.length]
}
