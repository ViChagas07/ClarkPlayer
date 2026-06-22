import type { Metadata } from 'next'
import PrivacyPolicyContent from './PrivacyPolicyContent'

export const metadata: Metadata = {
  title: 'Privacy Policy & Terms of Use — ClarkPlayer',
  description: 'ClarkPlayer Privacy Policy, Terms of Use, and LGPD compliance. Learn how we collect, use, and protect your personal data.',
  keywords: ['privacy policy', 'terms of use', 'LGPD', 'data protection', 'ClarkPlayer privacy'],
  openGraph: { title: 'Privacy Policy — ClarkPlayer', description: 'Privacy Policy, Terms of Use & LGPD Compliance' },
  twitter: { card: 'summary', title: 'Privacy Policy — ClarkPlayer' },
  robots: { index: true, follow: true },
}

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyContent />
}
