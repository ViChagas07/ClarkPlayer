'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertCircle, RefreshCw } from 'lucide-react'

export default function ArtistDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Artist Detail Error]', error)
  }, [error])

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center max-w-md">
        <AlertCircle className="w-14 h-14 text-clark-gold/60 mb-6" />
        <h2 className="font-display text-2xl text-clark-text-primary mb-3">
          Could not load artist
        </h2>
        <p className="font-body text-sm text-clark-text-muted mb-2">
          {error.message.includes('Network') || error.message.includes('fetch')
            ? 'The backend is unreachable. Please check your connection and try again.'
            : error.message.includes('not found') || error.message.includes('404')
              ? 'This artist is not in our catalog yet.'
              : 'An unexpected error occurred while loading this artist.'}
        </p>
        <p className="font-body text-xs text-clark-text-muted/50 mb-6">
          {error.digest ? `Error ID: ${error.digest}` : ''}
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={reset}
            className="flex items-center gap-2 px-5 py-2.5 bg-clark-accent hover:bg-clark-accent-hover text-white rounded-full font-body text-sm transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
          <Link
            href="/artists"
            className="text-clark-gold font-body text-sm hover:underline"
          >
            Back to Artists
          </Link>
        </div>
      </div>
    </div>
  )
}
