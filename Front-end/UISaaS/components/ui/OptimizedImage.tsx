'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

function generateBlurDataURL(width: number, height: number): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" fill="#1A1F2E"/></svg>`
  return `data:image/svg+xml;base64,${btoa(svg)}`
}

function resolveSizes(
  sizes?: string,
  fill?: boolean,
): string | undefined {
  if (sizes) return sizes
  if (fill) return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
  return undefined
}

interface OptimizedImageProps {
  src: string | null | undefined
  alt: string
  width?: number
  height?: number
  fill?: boolean
  className?: string
  imgClassName?: string
  priority?: boolean
  sizes?: string
  quality?: number
  placeholderColor?: string
  fallbackInitials?: string
}

/**
 * OptimizedImage — wraps next/image with:
 * - Automatic lazy loading for below-fold images
 * - SVG blur placeholder
 * - Auto-calculated sizes attribute for responsive images
 * - Fallback to a styled placeholder on load error
 * - Priority flag for above-fold images (LCP optimization)
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className,
  imgClassName,
  priority = false,
  sizes,
  quality = 80,
  placeholderColor = '#1A1F2E',
  fallbackInitials,
}: OptimizedImageProps) {
  const [hasError, setHasError] = useState(false)

  const blurDataURL = width && height
    ? generateBlurDataURL(width, height)
    : generateBlurDataURL(40, 40)

  const resolvedSizes = resolveSizes(sizes, fill)

  const onError = useCallback(() => {
    setHasError(true)
  }, [])

  if (!src || hasError) {
    const initials = fallbackInitials ?? alt?.charAt(0)?.toUpperCase() ?? '?'
    return (
      <div
        className={cn('flex items-center justify-center', className)}
        style={{
          width: fill ? '100%' : width ? `${width}px` : undefined,
          height: fill ? '100%' : height ? `${height}px` : undefined,
          backgroundColor: placeholderColor,
        }}
      >
        <span className="font-display text-4xl text-white/20 select-none" aria-hidden="true">
          {initials}
        </span>
      </div>
    )
  }

  return (
    <div
      className={cn('relative overflow-hidden', className)}
      style={{
        width: fill ? '100%' : width ? `${width}px` : undefined,
        height: fill ? '100%' : height ? `${height}px` : undefined,
        backgroundColor: placeholderColor,
      }}
    >
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        priority={priority}
        sizes={resolvedSizes}
        quality={quality}
        loading={priority ? 'eager' : 'lazy'}
        placeholder="blur"
        blurDataURL={blurDataURL}
        className={cn('object-cover', imgClassName)}
        onError={onError}
        draggable={false}
      />
    </div>
  )
}
