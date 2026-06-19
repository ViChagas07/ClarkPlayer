'use client'

import Image from 'next/image'

interface GenreMosaicProps {
  images: string[]
  genreName: string
  gradientFrom?: string
  gradientTo?: string
  size?: number
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
 */
export function GenreMosaic({
  images,
  genreName,
  gradientFrom = '#1a1a2e',
  gradientTo = '#16213e',
  size = 120,
}: GenreMosaicProps) {
  const filled = images.slice(0, 4)
  const half = Math.floor(size / 2)

  // 0 images → gradient fallback
  if (filled.length === 0) {
    return (
      <div
        className="overflow-hidden flex-shrink-0"
        style={{
          width: size,
          height: size,
          background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
        }}
        aria-label={genreName}
      />
    )
  }

  // 1 image → full-size single image
  if (filled.length === 1) {
    return (
      <div
        className="overflow-hidden flex-shrink-0 relative"
        style={{ width: size, height: size }}
      >
        <Image
          src={filled[0]}
          alt={genreName}
          fill
          sizes={`${size}px`}
          className="object-cover"
        />
      </div>
    )
  }

  // 2 images → two equal columns
  if (filled.length === 2) {
    return (
      <div
        className="overflow-hidden flex-shrink-0 flex"
        style={{ width: size, height: size }}
        aria-label={genreName}
      >
        {filled.map((src, i) => (
          <div key={i} className="relative flex-1 h-full">
            <Image
              src={src}
              alt={`${genreName} artist ${i + 1}`}
              fill
              sizes={`${half}px`}
              className="object-cover"
            />
          </div>
        ))}
      </div>
    )
  }

  // 3 images → large left + stacked right
  if (filled.length === 3) {
    return (
      <div
        className="overflow-hidden flex-shrink-0 flex"
        style={{ width: size, height: size }}
        aria-label={genreName}
      >
        <div className="relative h-full" style={{ width: half }}>
          <Image
            src={filled[0]}
            alt={`${genreName} artist 1`}
            fill
            sizes={`${half}px`}
            className="object-cover"
          />
        </div>
        <div className="flex flex-col flex-1 h-full">
          {filled.slice(1).map((src, i) => (
            <div key={i} className="relative flex-1">
              <Image
                src={src}
                alt={`${genreName} artist ${i + 2}`}
                fill
                sizes={`${half}px`}
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // 4 images → classic 2×2 grid
  return (
    <div
      className="overflow-hidden flex-shrink-0 grid grid-cols-2"
      style={{ width: size, height: size }}
      aria-label={genreName}
    >
      {filled.map((src, i) => (
        <div key={i} className="relative" style={{ width: half, height: half }}>
          <Image
            src={src}
            alt={`${genreName} artist ${i + 1}`}
            fill
            sizes={`${half}px`}
            className="object-cover"
          />
        </div>
      ))}
    </div>
  )
}
