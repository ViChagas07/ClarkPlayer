import { cn } from '@/lib/utils'

interface SkeletonProps {
  /** Width in any CSS unit (px, rem, %, etc.) */
  width?: string
  /** Height in any CSS unit (px, rem, %, etc.) */
  height?: string
  /** Rounded corners. Use 'full' for circles, 'md' for standard. */
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
  /** Additional Tailwind classes */
  className?: string
  /** Number of skeleton items to render in a flex layout */
  count?: number
  /** Gap between items when count > 1 */
  gap?: string
  /** Direction for multi-count */
  direction?: 'row' | 'col'
}

/**
 * Skeleton — A CLS-safe skeleton loader with explicit dimensions.
 * Preloads exact space to prevent layout shifts during content loading.
 */
export function Skeleton({
  width = '100%',
  height = '1rem',
  rounded = 'md',
  className,
}: Omit<SkeletonProps, 'count' | 'gap' | 'direction'>) {
  return (
    <div
      role="status"
      aria-label="Loading"
      aria-busy="true"
      className={cn(
        'animate-pulse bg-clark-bg-secondary',
        rounded === 'full' && 'rounded-full',
        rounded === 'sm' && 'rounded-sm',
        rounded === 'md' && 'rounded-md',
        rounded === 'lg' && 'rounded-lg',
        rounded === 'xl' && 'rounded-xl',
        rounded === 'none' && 'rounded-none',
        className,
      )}
      style={{ width, height }}
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
}

/**
 * SkeletonGrid — Renders a grid of skeleton items.
 * Always reserves exact layout space to prevent CLS.
 */
export function SkeletonGrid({
  count = 6,
  width,
  height,
  rounded = 'md',
  gap = '1rem',
  className,
}: SkeletonProps) {
  return (
    <div
      role="status"
      aria-label="Loading content"
      aria-busy="true"
      className={cn('grid', className)}
      style={{ gap }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton
          key={i}
          width={width}
          height={height}
          rounded={rounded}
        />
      ))}
      <span className="sr-only">Loading content...</span>
    </div>
  )
}

/**
 * SkeletonCard — An opinionated card skeleton with cover image + text lines.
 * Uses explicit dimensions matching the typical track/artist card layout.
 */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      role="status"
      aria-label="Loading card"
      aria-busy="true"
      className={cn('space-y-3', className)}
    >
      <Skeleton width="100%" height="0" rounded="lg" className="aspect-square" />
      <Skeleton width="75%" height="1rem" rounded="md" />
      <Skeleton width="50%" height="0.75rem" rounded="md" />
      <span className="sr-only">Loading card...</span>
    </div>
  )
}

/**
 * SkeletonRow — A horizontal skeleton matching track row layout.
 */
export function SkeletonRow({ className }: { className?: string }) {
  return (
    <div
      role="status"
      aria-label="Loading row"
      aria-busy="true"
      className={cn('flex items-center gap-4 px-4 py-2.5', className)}
    >
      <Skeleton width="1.5rem" height="0.75rem" rounded="sm" />
      <Skeleton width="2.5rem" height="2.5rem" rounded="md" />
      <div className="flex-1 space-y-1.5">
        <Skeleton width="50%" height="0.875rem" rounded="md" />
        <Skeleton width="30%" height="0.75rem" rounded="md" />
      </div>
      <Skeleton width="3rem" height="0.75rem" rounded="md" />
      <span className="sr-only">Loading row...</span>
    </div>
  )
}

/**
 * SkeletonHero — Full-width hero banner skeleton for artist/track pages.
 */
export function SkeletonHero({ className }: { className?: string }) {
  return (
    <div
      role="status"
      aria-label="Loading hero section"
      aria-busy="true"
      className={cn('relative overflow-hidden', className)}
      style={{ height: '18rem' }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-clark-bg-secondary/30 to-clark-bg-primary" />
      <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end gap-6">
        <Skeleton width="11rem" height="11rem" rounded="full" className="flex-shrink-0" />
        <div className="flex-1 space-y-3 pb-2">
          <Skeleton width="6rem" height="0.75rem" rounded="md" />
          <Skeleton width="75%" height="2.5rem" rounded="md" />
          <Skeleton width="40%" height="1rem" rounded="md" />
        </div>
      </div>
      <span className="sr-only">Loading hero section...</span>
    </div>
  )
}
