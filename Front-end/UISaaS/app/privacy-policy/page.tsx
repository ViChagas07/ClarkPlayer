import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy & Terms of Use — ClarkPlayer',
  description: 'ClarkPlayer Privacy Policy, Terms of Use, and LGPD compliance. Learn how we collect, use, and protect your personal data.',
  keywords: ['privacy policy', 'terms of use', 'LGPD', 'data protection', 'ClarkPlayer privacy'],
  openGraph: { title: 'Privacy Policy — ClarkPlayer', description: 'Privacy Policy, Terms of Use & LGPD Compliance' },
  twitter: { card: 'summary', title: 'Privacy Policy — ClarkPlayer' },
  robots: { index: true, follow: true },
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-clark-bg-primary text-clark-text-primary">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-b from-clark-bg-secondary to-clark-bg-primary border-b border-clark-steel/20">
        <div className="absolute inset-0 overflow-hidden pointer-events-none"><div className="absolute inset-0 aurora-gradient opacity-30" /></div>
        <div className="relative max-w-4xl mx-auto px-6 py-16 sm:py-24">
          <p className="font-condensed text-xs tracking-widest text-clark-gold uppercase mb-4">Legal</p>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl tracking-widest uppercase mb-4">Privacy <span className="text-clark-accent">Policy</span></h1>
          <p className="font-body text-lg text-clark-text-muted max-w-2xl">How ClarkPlayer collects, uses, and protects your data. Full LGPD compliance.</p>
        </div>
      </div>

      {/* Quick nav */}
      <nav className="sticky top-0 z-40 bg-clark-bg-primary/95 backdrop-blur-md border-b border-clark-steel/20">
        <div className="max-w-4xl mx-auto px-6 flex gap-6 overflow-x-auto py-3 scrollbar-hide">
          {['Intro', 'Data', 'Usage', 'Cookies', 'Security', 'LGPD Rights', 'Terms'].map((item) => (
            <a key={item} href={`#${item.toLowerCase().replace(/\s+/g, '-')}`} className="font-body text-sm text-clark-text-muted hover:text-clark-gold whitespace-nowrap transition-colors">{item}</a>
          ))}
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-16">
        {/* Introduction */}
        <section id="intro">
          <h2 className="font-display text-2xl tracking-widest uppercase mb-4">1. Introduction</h2>
          <p className="font-body text-clark-text-muted leading-relaxed mb-4">ClarkPlayer is a music streaming platform that delivers personalized musical experiences, artist discovery, and intelligent recommendations. To provide these features, we process certain personal data with transparency and respect.</p>
          <p className="font-body text-clark-text-muted leading-relaxed">This policy explains what data we collect, why we collect it, how we use it, and your rights under the Brazilian General Data Protection Law (LGPD — Lei 13.709/2018).</p>
        </section>

        {/* Data Collected */}
        <section id="data">
          <h2 className="font-display text-2xl tracking-widest uppercase mb-4">2. Data We Collect</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-body font-semibold text-clark-text-primary mb-2">Account Data</h3>
              <p className="font-body text-sm text-clark-text-muted leading-relaxed">When you create an account or sign in via Google OAuth, we collect your name, email address, and avatar image to identify you and personalize your experience.</p>
            </div>
            <div>
              <h3 className="font-body font-semibold text-clark-text-primary mb-2">Usage Data</h3>
              <p className="font-body text-sm text-clark-text-muted leading-relaxed">We track tracks played, artists and albums visited, searches performed, favorites saved, and playlists created. This data powers our recommendation engine and improves your discovery experience.</p>
            </div>
            <div>
              <h3 className="font-body font-semibold text-clark-text-primary mb-2">Technical Data</h3>
              <p className="font-body text-sm text-clark-text-muted leading-relaxed">Browser type, operating system, device information, access logs, performance metrics, and interface preferences (theme, language, sleep timer) are collected to ensure platform stability and security.</p>
            </div>
          </div>
        </section>

        {/* Usage Purpose */}
        <section id="usage">
          <h2 className="font-display text-2xl tracking-widest uppercase mb-4">3. How We Use Your Data</h2>
          <ul className="space-y-3 font-body text-sm text-clark-text-muted leading-relaxed list-disc pl-5">
            <li><span className="text-clark-text-primary font-medium">Personalization</span> — Tailor music recommendations, genre suggestions, and artist discoveries based on your listening history.</li>
            <li><span className="text-clark-text-primary font-medium">Authentication</span> — Securely identify you and protect your account.</li>
            <li><span className="text-clark-text-primary font-medium">Performance</span> — Monitor and improve platform speed, stability, and reliability.</li>
            <li><span className="text-clark-text-primary font-medium">Security</span> — Detect and prevent fraud, abuse, and unauthorized access.</li>
            <li><span className="text-clark-text-primary font-medium">Legal Compliance</span> — Meet regulatory obligations under LGPD and applicable laws.</li>
          </ul>
        </section>

        {/* Data Sharing */}
        <section id="sharing">
          <h2 className="font-display text-2xl tracking-widest uppercase mb-4">4. Data Sharing</h2>
          <p className="font-body text-sm text-clark-text-muted leading-relaxed mb-4"><strong className="text-clark-text-primary">We never sell your personal data.</strong> Your data is only shared when strictly necessary:</p>
          <ul className="space-y-2 font-body text-sm text-clark-text-muted leading-relaxed list-disc pl-5">
            <li><span className="text-clark-text-primary font-medium">Authentication Providers</span> — Google OAuth for secure sign-in.</li>
            <li><span className="text-clark-text-primary font-medium">Infrastructure</span> — Hosting (Vercel, Render), database (Neon PostgreSQL), cache (Redis).</li>
            <li><span className="text-clark-text-primary font-medium">Legal Obligation</span> — When required by law or court order.</li>
          </ul>
        </section>

        {/* Cookies */}
        <section id="cookies">
          <h2 className="font-display text-2xl tracking-widest uppercase mb-4">5. Cookies & Local Storage</h2>
          <p className="font-body text-sm text-clark-text-muted leading-relaxed mb-4">ClarkPlayer uses browser storage for:</p>
          <ul className="space-y-2 font-body text-sm text-clark-text-muted leading-relaxed list-disc pl-5">
            <li><strong className="text-clark-text-primary">Authentication</strong> — JWT tokens stored securely to keep you signed in.</li>
            <li><strong className="text-clark-text-primary">Preferences</strong> — Theme (dark/light), language, sleep timer settings.</li>
            <li><strong className="text-clark-text-primary">Cache</strong> — Music catalog data cached locally for speed and offline resilience.</li>
          </ul>
          <p className="font-body text-sm text-clark-text-muted leading-relaxed mt-4">You can clear this data anytime through your browser settings or by signing out.</p>
        </section>

        {/* Security */}
        <section id="security">
          <h2 className="font-display text-2xl tracking-widest uppercase mb-4">6. Security</h2>
          <p className="font-body text-sm text-clark-text-muted leading-relaxed mb-4">We implement industry-standard security measures:</p>
          <ul className="space-y-2 font-body text-sm text-clark-text-muted leading-relaxed list-disc pl-5">
            <li><strong className="text-clark-text-primary">HTTPS</strong> — All communication is encrypted in transit.</li>
            <li><strong className="text-clark-text-primary">JWT Authentication</strong> — Tokens with short expiration times.</li>
            <li><strong className="text-clark-text-primary">Password Hashing</strong> — Passwords are never stored in plain text.</li>
            <li><strong className="text-clark-text-primary">Rate Limiting</strong> — Protection against brute-force attacks.</li>
            <li><strong className="text-clark-text-primary">Monitoring</strong> — Continuous security monitoring and incident response.</li>
          </ul>
        </section>

        {/* LGPD Rights */}
        <section id="lgpd-rights">
          <h2 className="font-display text-2xl tracking-widest uppercase mb-4">7. Your LGPD Rights</h2>
          <p className="font-body text-sm text-clark-text-muted leading-relaxed mb-4">Under Brazilian law (LGPD), you have the right to:</p>
          <ul className="space-y-3 font-body text-sm text-clark-text-muted leading-relaxed list-disc pl-5">
            <li><strong className="text-clark-text-primary">Access</strong> — Request a copy of all personal data we hold about you.</li>
            <li><strong className="text-clark-text-primary">Correction</strong> — Update incomplete or inaccurate data.</li>
            <li><strong className="text-clark-text-primary">Deletion</strong> — Request permanent deletion of your account and data.</li>
            <li><strong className="text-clark-text-primary">Portability</strong> — Export your data in a structured, machine-readable format (JSON).</li>
            <li><strong className="text-clark-text-primary">Consent Revocation</strong> — Withdraw consent at any time.</li>
            <li><strong className="text-clark-text-primary">Information</strong> — Know which entities your data is shared with.</li>
          </ul>
        </section>

        {/* Account Deletion */}
        <section id="deletion">
          <h2 className="font-display text-2xl tracking-widest uppercase mb-4">8. Account Deletion</h2>
          <p className="font-body text-sm text-clark-text-muted leading-relaxed mb-4">You may delete your account at any time. This process:</p>
          <ol className="space-y-2 font-body text-sm text-clark-text-muted leading-relaxed list-decimal pl-5">
            <li>Marks your account for deletion</li>
            <li>Removes personal identifiers (name, email, avatar)</li>
            <li>Anonymizes listening history and behavioral data</li>
            <li>Retains anonymized data for aggregate analytics only</li>
          </ol>
          <p className="font-body text-sm text-clark-text-muted leading-relaxed mt-4">To delete your account, go to <strong className="text-clark-text-primary">Settings → Account → Delete Account</strong> or contact us directly.</p>
        </section>

        {/* Data Retention */}
        <section id="retention">
          <h2 className="font-display text-2xl tracking-widest uppercase mb-4">9. Data Retention</h2>
          <p className="font-body text-sm text-clark-text-muted leading-relaxed">Personal data is retained only while your account is active. Expired sessions, old logs, and stale cache entries are automatically purged. After account deletion, residual data is removed within 30 days.</p>
        </section>

        {/* Terms of Use */}
        <section id="terms">
          <h2 className="font-display text-2xl tracking-widest uppercase mb-4">10. Terms of Use</h2>
          <div className="space-y-4 font-body text-sm text-clark-text-muted leading-relaxed">
            <p>By using ClarkPlayer, you agree to these terms. If you disagree, please discontinue use immediately.</p>
            <h3 className="font-body font-semibold text-clark-text-primary">Permitted Use</h3>
            <p>ClarkPlayer is a personal music streaming and discovery platform. You may browse, search, play previews, create playlists, and manage your music library.</p>
            <h3 className="font-body font-semibold text-clark-text-primary">User Responsibilities</h3>
            <p>You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account. You agree to provide accurate registration information.</p>
            <h3 className="font-body font-semibold text-clark-text-primary">Prohibited Conduct</h3>
            <ul className="space-y-1 list-disc pl-5">
              <li>Scraping, crawling, or automated data extraction</li>
              <li>Unauthorized API access or reverse engineering</li>
              <li>Abusing preview URLs or downloading content</li>
              <li>Attempting to circumvent security measures</li>
              <li>Using the platform for illegal activities</li>
              <li>Harassing or impersonating other users</li>
            </ul>
            <h3 className="font-body font-semibold text-clark-text-primary">Intellectual Property</h3>
            <p>All music content, previews, and artwork are property of their respective rights holders (Apple/iTunes, Spotify, record labels). ClarkPlayer provides discovery and streaming previews only — no content is hosted or redistributed.</p>
            <h3 className="font-body font-semibold text-clark-text-primary">Limitation of Liability</h3>
            <p>ClarkPlayer is provided "as is" without warranties. We are not liable for damages arising from use or inability to use the platform.</p>
            <h3 className="font-body font-semibold text-clark-text-primary">Changes to Terms</h3>
            <p>We may update these terms. Continued use after changes constitutes acceptance. Material changes will be notified via the platform.</p>
          </div>
        </section>

        {/* Contact */}
        <section id="contact">
          <h2 className="font-display text-2xl tracking-widest uppercase mb-4">11. Contact</h2>
          <p className="font-body text-sm text-clark-text-muted leading-relaxed">For privacy-related inquiries, data requests, or to exercise your LGPD rights, contact:</p>
          <p className="font-body text-clark-text-primary mt-3">privacy@clarkplayer.app</p>
        </section>

        {/* Last updated */}
        <p className="font-body text-xs text-clark-text-muted/50 pt-8 border-t border-clark-steel/20">Last updated: June 18, 2026 — Version 1.0</p>
      </div>
    </div>
  )
}
