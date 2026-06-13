import type { FC } from 'react'

/**
 * StructuredData — Renders JSON-LD structured data as a <script> tag.
 * Safe to use in both Server and Client Components.
 *
 * @see https://schema.org/
 * @see https://developers.google.com/search/docs/appearance/structured-data/article
 */
interface StructuredDataProps {
  /** The JSON-LD data object. Will be serialized with secure escaping. */
  data: Record<string, unknown>
  /** Optional unique ID per page (avoid duplicate script injection) */
  id?: string
}

export const StructuredData: FC<StructuredDataProps> = ({ data, id }) => {
  return (
    <script
      id={id}
      type="application/ld+json"
      // Use dangerouslySetInnerHTML to avoid React escaping quotes in JSON
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          ...data,
        }),
      }}
    />
  )
}
