'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'

export default function GenresError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { t } = useTranslation()

  useEffect(() => {
    console.error('═══ [Genres Page Error] ═══')
    console.error('Message:', error.message)
    console.error('Stack:', error.stack)
    console.error('Digest:', error.digest)
    console.error('Cause:', error.cause)
    console.error('Full error:', error)
    console.error('═══════════════════════════')
  }, [error])

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center max-w-md">
        <AlertCircle className="w-14 h-14 text-clark-gold/60 mb-6" />
        <h2 className="font-display text-2xl text-clark-text-primary mb-3">
          {t('couldNotLoadGenres')}
        </h2>
        <p className="font-body text-sm text-clark-text-muted mb-2">
          {error.message.includes('Network') || error.message.includes('fetch')
            ? t('backendUnreachable')
            : error.message.length > 0
              ? error.message
              : t('unexpectedErrorGenres')}
        </p>
        <p className="font-body text-xs text-clark-text-muted/50 mb-6">
          {error.digest ? `Error ID: ${error.digest}` : ''}
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={reset}
            className="flex items-center gap-2 px-5 py-2.5 bg-clark-accent hover:bg-clark-accent-hover text-white rounded-full font-body text-sm transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> {t('retry')}
          </button>
          <Link
            href="/"
            className="text-clark-gold font-body text-sm hover:underline"
          >
            {t('backToGenres')}
          </Link>
        </div>
      </div>
    </div>
  )
}
