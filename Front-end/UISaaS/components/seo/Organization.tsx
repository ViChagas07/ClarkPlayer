import { StructuredData } from './StructuredData'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://clark-player.vercel.app'

/**
 * Organization structured data — identifies the brand behind ClarkPlayer.
 * Placed in root layout.
 */
export function OrganizationStructuredData() {
  const data = {
    '@type': 'Organization',
    name: 'ClarkPlayer',
    url: SITE_URL,
    logo: `${SITE_URL}/ClarkPlayer_Favicon.png`,
    sameAs: [],
    description:
      'ClarkPlayer is a music streaming and library management platform built for collectors and power-listeners.',
  }

  return <StructuredData data={data} id="organization-structured-data" />
}
