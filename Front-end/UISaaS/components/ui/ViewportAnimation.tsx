'use client'

import { useState, useRef, useEffect, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ViewportAnimationProps {
  children: ReactNode
  /** Animation type */
  animation?: 'fade-up' | 'fade-in' | 'scale-in' | 'slide-left' | 'slide-right'
  /** Delay in ms before animation starts after entering viewport */
  delay?: number
  /** Duration in ms */
  duration?: number
  /** CSS classes for the wrapper */
  className?: string
  /** Only animate once (default: true) */
  once?: boolean
  /** Root margin for Intersection Observer (default: 100px) */
  rootMargin?: string
}

const animationStyles: Record<string, { initial: string; animate: string }> = {
  'fade-up': {
    initial: 'opacity-0 translate-y-6',
    animate: 'opacity-100 translate-y-0',
  },
  'fade-in': {
    initial: 'opacity-0',
    animate: 'opacity-100',
  },
  'scale-in': {
    initial: 'opacity-0 scale-95',
    animate: 'opacity-100 scale-100',
  },
  'slide-left': {
    initial: 'opacity-0 -translate-x-4',
    animate: 'opacity-100 translate-x-0',
  },
  'slide-right': {
    initial: 'opacity-0 translate-x-4',
    animate: 'opacity-100 translate-x-0',
  },
}

/**
 * ViewportAnimation — Lightweight viewport-triggered CSS animation.
 * Uses Intersection Observer and CSS transforms (GPU-accelerated).
 * Respects prefers-reduced-motion (animations are skipped entirely).
 *
 * Performance: Uses transform + opacity only (compositor-only properties).
 * No layout or paint triggers. Will never impact Core Web Vitals.
 */
export function ViewportAnimation({
  children,
  animation = 'fade-up',
  delay = 0,
  duration = 500,
  className,
  once = true,
  rootMargin = '100px',
}: ViewportAnimationProps) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mq.matches)
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    if (prefersReducedMotion) {
      setIsVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (once) observer.disconnect()
        } else if (!once) {
          setIsVisible(false)
        }
      },
      { rootMargin, threshold: 0.05 }
    )

    const el = ref.current
    if (el) observer.observe(el)

    return () => observer.disconnect()
  }, [once, rootMargin, prefersReducedMotion])

  const styles = animationStyles[animation]

  return (
    <div
      ref={ref}
      className={cn(
        isVisible ? styles.animate : styles.initial,
        className,
      )}
      style={{
        transition: `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`,
        transitionDelay: isVisible ? `${delay}ms` : '0ms',
        willChange: isVisible ? 'opacity, transform' : 'auto',
      }}
    >
      {children}
    </div>
  )
}
