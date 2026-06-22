'use client'

import { useRef, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

/* ── Remove ALL browser default focus styles from the search input ── */
/* The visual focus indicator is handled by the parent container.      */
const focusResetStyle = {
  outline: 'none',
  outlineWidth: 0,
  WebkitOutline: 'none',
  MozOutline: 'none',
} as React.CSSProperties

interface GenreSearchBarProps {
  /** Current raw input value */
  value: string
  /** Input change handler */
  onChange: (value: string) => void
  /** Focus state */
  isFocused: boolean
  /** Focus setter */
  onFocusChange: (focused: boolean) => void
  /** Clear button handler */
  onClear: () => void
  /** Keyboard handler (Escape) */
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  /** Placeholder text */
  placeholder?: string
}

/**
 * Professional search bar with glassmorphism styling.
 *
 * Design inspired by Spotify / Apple Music / YouTube Music.
 * Fully controlled — parent manages state via the useGenreFilter hook.
 */
export function GenreSearchBar({
  value,
  onChange,
  isFocused,
  onFocusChange,
  onClear,
  onKeyDown,
  placeholder = 'Pesquisar gêneros...',
}: GenreSearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onFocusChange(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onFocusChange])

  return (
    <>
      {/* Kill every possible browser default focus ring */}
      <style>{`
        .genre-search-input:focus,
        .genre-search-input:focus-visible,
        .genre-search-input:focus-within {
          outline: none !important;
          outline-width: 0 !important;
          outline-style: none !important;
          box-shadow: none !important;
          -webkit-box-shadow: none !important;
          -moz-box-shadow: none !important;
        }
        .genre-search-input::-moz-focus-inner {
          border: 0 !important;
        }
      `}</style>
    <div
      ref={containerRef}
      className={cn(
        'relative w-full max-w-lg mx-auto transition-all duration-300',
        isFocused && 'max-w-xl',
      )}
    >
      {/* Glassmorphism background layer + custom focus ring */}
      <div
        className={cn(
          'absolute inset-0 rounded-2xl transition-all duration-300',
          'bg-clark-bg-secondary/40 backdrop-blur-xl border',
          isFocused
            ? 'border-clark-accent/60 shadow-[0_0_0_2px_rgba(224,32,32,0.35)]'
            : 'border-clark-steel/20 hover:border-clark-steel/40',
        )}
      />

      {/* Inner glow when focused */}
      {isFocused && (
        <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-clark-accent/10 via-transparent to-clark-accent/5 opacity-60 blur-sm -z-10" />
      )}

      {/* Input row */}
      <div className="relative flex items-center h-12 px-4">
        {/* Search icon */}
        <Search
          className={cn(
            'w-5 h-5 flex-shrink-0 transition-colors duration-200',
            isFocused ? 'text-clark-gold' : 'text-clark-text-muted/50',
          )}
        />

        {/* Input — all browser focus styles removed; container handles the focus ring */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => onFocusChange(true)}
          onBlur={() => {
            // Small delay so click-outside can fire first
            setTimeout(() => {
              if (!value) onFocusChange(false)
            }, 150)
          }}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          aria-label="Pesquisar gêneros"
          style={focusResetStyle}
          className={cn(
            'genre-search-input flex-1 bg-transparent border-none px-3 font-body text-sm',
            'text-clark-text-primary placeholder:text-clark-text-muted/40',
          )}
        />

        {/* Clear button (visible when typing) */}
        {value && (
          <button
            type="button"
            onClick={() => {
              onClear()
              inputRef.current?.focus()
            }}
            aria-label="Limpar pesquisa"
            className={cn(
              'flex items-center justify-center w-7 h-7 rounded-full',
              'text-clark-text-muted/50 hover:text-clark-text-primary hover:bg-clark-bg-card/50',
              'transition-all duration-200',
            )}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
    </>
  )
}
