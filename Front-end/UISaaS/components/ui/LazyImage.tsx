'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface LazyImageProps {
  src: string | null | undefined
  alt: string
  /** Explicit width in px (required for CLS prevention) */
  width?: number
  /** Explicit height in px (required for CLS prevention) */
  height?: number
  /** Fill container (use with parent that has position:relative and explicit dimensions) */
  fill?: boolean
  /** CSS classes for the wrapper div */
  className?: string
  /** CSS classes for the img element */
  imgClassName?: string
  /** Priority loading for above-the-fold images (LCP optimization) */
  priority?: boolean
  /** Sizes attribute for responsive images */
  sizes?: string
  /** Quality (1-100, default 75) */
  quality?: number
  /** Blur placeholder color */
  placeholderColor?: string
}

/**
 * LazyImage — CLS-safe image component with lazy loading, blur-up placeholder,
 * and intersection observer for below-fold images.
 *
 * Always provides explicit dimensions or fill mode to prevent layout shifts.
 * Uses next/image for automatic optimization.
 */
export function LazyImage({
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
  placeholderColor = 'var(--clark-bg-secondary)',
}: LazyImageProps) {
  const [isInView, setIsInView] = useState(priority)
  const [hasError, setHasError] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (priority || isInView) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      {
        rootMargin: '200px', // Start loading 200px before visible
        threshold: 0,
      }
    )

    const el = ref.current
    if (el) observer.observe(el)

    return () => observer.disconnect()
  }, [priority, isInView])

  // Fallback placeholder when no image or error
  if (!src || hasError) {
    return (
      <div
        ref={ref}
        className={cn('flex items-center justify-center', className)}
        style={{
          width: fill ? '100%' : width ? `${width}px` : undefined,
          height: fill ? '100%' : height ? `${height}px` : undefined,
          backgroundColor: placeholderColor,
        }}
      >
        <span className="font-display text-4xl text-white/20 select-none" aria-hidden="true">
          {alt?.charAt(0)?.toUpperCase() ?? '?'}
        </span>
      </div>
    )
  }

  return (
    <div
      ref={ref}
      className={cn('relative overflow-hidden', className)}
      style={{
        width: fill ? '100%' : width ? `${width}px` : undefined,
        height: fill ? '100%' : height ? `${height}px` : undefined,
        backgroundColor: placeholderColor,
      }}
    >
      {isInView && (
        <Image
          src={src}
          alt={alt}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          fill={fill}
          priority={priority}
          sizes={sizes}
          quality={quality}
          loading={priority ? 'eager' : 'lazy'}
          className={cn('object-cover', imgClassName)}
          onError={() => setHasError(true)}
          draggable={false}
        />
      )}
    </div>
  )
}
