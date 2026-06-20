'use client'

import Image from 'next/image'

interface GenreMosaicProps {
  images: string[]
  genreName: string
  gradientFrom?: string
  gradientTo?: string
  size?: number | string
}

/**
 * Renders a Spotify-style 2×2 mosaic from the top artists' images for a genre.
 *
 * Handles 0, 1, 2, 3, and 4 images gracefully:
 * - 0 images → gradient fallback
 * - 1 image  → full-size single image
 * - 2 images → two equal columns
 * - 3 images → large left + stacked right (2:1:1 ratio)
 * - 4 images → classic 2×2 grid
 *
 * `size` accepts a number (px) or a string percentage (e.g. "100%").
 */
export function GenreMosaic({
  images,
  genreName,
  gradientFrom = '#1a1a2e',
  gradientTo = '#16213e',
  size = 120,
}: GenreMosaicProps) {
  const filled = images.slice(0, 4)

  const isPx = typeof size === 'number'
  const containerSize = isPx ? size : '100%'
  const half = isPx ? Math.floor(size / 2) : '50%'

  // 0 images → gradient fallback
  if (filled.length === 0) {
    return (
      <div
        className="overflow-hidden flex-shrink-0"
        style={{
          width: containerSize,
          height: containerSize,
          background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
        }}
        aria-label={genreName}
      />
    )
  }

  // 1 image → full-size single image — sem bordas
  if (filled.length === 1) {
    return (
      <div
        className="overflow-hidden flex-shrink-0 relative"
        style={{ width: containerSize, height: containerSize, padding: 0 }}
      >
        <Image
          src={filled[0]}
          alt={genreName}
          fill
          sizes={isPx ? `${size}px` : '100vw'}
          className="object-cover"
        />
      </div>
    )
  }

  // 2 images → duas colunas iguais — sem gap
  if (filled.length === 2) {
    return (
      <div
        className="overflow-hidden flex-shrink-0 flex"
        style={{ width: containerSize, height: containerSize, gap: 0, padding: 0 }}
        aria-label={genreName}
      >
        {filled.map((src, i) => (
          <div key={i} className="relative flex-1 h-full w-full">
            <Image
              src={src}
              alt={`${genreName} artist ${i + 1}`}
              fill
              sizes={isPx ? `${half}px` : '50vw'}
              className="object-cover"
            />
          </div>
        ))}
      </div>
    )
  }

  // 3 images → grande à esquerda + duas empilhadas à direita — sem gap
  if (filled.length === 3) {
    return (
      <div
        className="overflow-hidden flex-shrink-0 flex"
        style={{ width: containerSize, height: containerSize, gap: 0, padding: 0 }}
        aria-label={genreName}
      >
        <div className="relative h-full w-1/2">
          <Image
            src={filled[0]}
            alt={`${genreName} artist 1`}
            fill
            sizes={isPx ? `${half}px` : '50vw'}
            className="object-cover"
          />
        </div>
        <div className="flex flex-col flex-1 h-full">
          {filled.slice(1).map((src, i) => (
            <div key={i} className="relative flex-1 w-full">
              <Image
                src={src}
                alt={`${genreName} artist ${i + 2}`}
                fill
                sizes={isPx ? `${half}px` : '50vw'}
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // 4 images → mosaico 2×2 clássico — SEM gap, SEM padding
  return (
    <div
      className="overflow-hidden flex-shrink-0 grid grid-cols-2 grid-rows-2"
      style={{ width: containerSize, height: containerSize, gap: 0, padding: 0 }}
      aria-label={genreName}
    >
      {filled.map((src, i) => (
        <div key={i} className="relative w-full h-full">
          <Image
            src={src}
            alt={`${genreName} artist ${i + 1}`}
            fill
            sizes={isPx ? `${half}px` : '50vw'}
            className="object-cover"
          />
        </div>
      ))}
    </div>
  )
}
