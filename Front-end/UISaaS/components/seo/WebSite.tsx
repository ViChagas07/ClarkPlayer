import { StructuredData } from './StructuredData'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://clark-player.vercel.app'

/**
 * WebSite + SearchAction structured data for the root layout.
 * Enables the Google Search sitelinks search box.
 */
export function WebSiteStructuredData() {
  const data = {
    '@type': 'WebSite',
    url: SITE_URL,
    name: 'ClarkPlayer',
    description:
      'Your personal Fortress of Sound. Upload, organize, and stream your music collection with heroic style.',
    inLanguage: 'en-US',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }

  return <StructuredData data={data} id="website-structured-data" />
}
