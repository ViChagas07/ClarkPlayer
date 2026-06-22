'use client'

import { useTranslation } from '@/hooks/useTranslation'
import Link from 'next/link'

const NAV_KEYS = [
  { key: 'ppNavIntro', anchor: 'intro' },
  { key: 'ppNavData', anchor: 'data' },
  { key: 'ppNavUsage', anchor: 'usage' },
  { key: 'ppNavCookies', anchor: 'cookies' },
  { key: 'ppNavSecurity', anchor: 'security' },
  { key: 'ppNavLgpdRights', anchor: 'lgpd-rights' },
  { key: 'ppNavTerms', anchor: 'terms' },
] as const

export default function PrivacyPolicyContent() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-clark-bg-primary text-clark-text-primary">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-b from-clark-bg-secondary to-clark-bg-primary border-b border-clark-steel/20">
        <div className="absolute inset-0 overflow-hidden pointer-events-none"><div className="absolute inset-0 aurora-gradient opacity-30" /></div>
        <div className="relative max-w-4xl mx-auto px-6 py-16 sm:py-24">
          <p className="font-condensed text-xs tracking-widest text-clark-gold uppercase mb-4">{t('legalLabel')}</p>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl tracking-widest uppercase mb-4">{t('privacyTitle')} <span className="text-clark-accent">{t('policyAccent')}</span></h1>
          <p className="font-body text-lg text-clark-text-muted max-w-2xl">{t('privacySubtitle')}</p>
        </div>
      </div>

      {/* Quick nav */}
      <nav className="sticky top-0 z-40 bg-clark-bg-primary/95 backdrop-blur-md border-b border-clark-steel/20">
        <div className="max-w-4xl mx-auto px-6 flex gap-6 overflow-x-auto py-3 scrollbar-hide">
          {NAV_KEYS.map((item) => (
            <a key={item.key} href={`#${item.anchor}`} className="font-body text-sm text-clark-text-muted hover:text-clark-gold whitespace-nowrap transition-colors">{t(item.key)}</a>
          ))}
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-16">
        {/* Introduction */}
        <section id="intro">
          <h2 className="font-display text-2xl tracking-widest uppercase mb-4">{t('ppS1Title')}</h2>
          {t('ppS1Body').split('\n\n').map((para, i) => (
            <p key={i} className="font-body text-clark-text-muted leading-relaxed mb-4">{para}</p>
          ))}
        </section>

        {/* Data Collected */}
        <section id="data">
          <h2 className="font-display text-2xl tracking-widest uppercase mb-4">{t('ppS2Title')}</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-body font-semibold text-clark-text-primary mb-2">{t('ppS2AccountTitle')}</h3>
              <p className="font-body text-sm text-clark-text-muted leading-relaxed">{t('ppS2AccountBody')}</p>
            </div>
            <div>
              <h3 className="font-body font-semibold text-clark-text-primary mb-2">{t('ppS2UsageTitle')}</h3>
              <p className="font-body text-sm text-clark-text-muted leading-relaxed">{t('ppS2UsageBody')}</p>
            </div>
            <div>
              <h3 className="font-body font-semibold text-clark-text-primary mb-2">{t('ppS2TechnicalTitle')}</h3>
              <p className="font-body text-sm text-clark-text-muted leading-relaxed">{t('ppS2TechnicalBody')}</p>
            </div>
          </div>
        </section>

        {/* Usage Purpose */}
        <section id="usage">
          <h2 className="font-display text-2xl tracking-widest uppercase mb-4">{t('ppS3Title')}</h2>
          <ul className="space-y-3 font-body text-sm text-clark-text-muted leading-relaxed list-disc pl-5">
            {t('ppS3Body').split('\n').map((item, i) => {
              const [label, ...rest] = item.split(' — ')
              return (
                <li key={i}><span className="text-clark-text-primary font-medium">{label}</span>{rest.length > 0 ? <> — {rest.join(' — ')}</> : null}</li>
              )
            })}
          </ul>
        </section>

        {/* Data Sharing */}
        <section id="sharing">
          <h2 className="font-display text-2xl tracking-widest uppercase mb-4">{t('ppS4Title')}</h2>
          <p className="font-body text-sm text-clark-text-muted leading-relaxed mb-4"><strong className="text-clark-text-primary">{t('ppS4NeverSell')}</strong></p>
          <ul className="space-y-2 font-body text-sm text-clark-text-muted leading-relaxed list-disc pl-5">
            {t('ppS4Body').split('\n').map((item, i) => {
              const [label, ...rest] = item.split(' — ')
              return (
                <li key={i}><span className="text-clark-text-primary font-medium">{label}</span>{rest.length > 0 ? <> — {rest.join(' — ')}</> : null}</li>
              )
            })}
          </ul>
        </section>

        {/* Cookies */}
        <section id="cookies">
          <h2 className="font-display text-2xl tracking-widest uppercase mb-4">{t('ppS5Title')}</h2>
          <ul className="space-y-2 font-body text-sm text-clark-text-muted leading-relaxed list-disc pl-5">
            {t('ppS5Body').split('\n').map((item, i) => {
              const [label, ...rest] = item.split(' — ')
              return (
                <li key={i}><strong className="text-clark-text-primary">{label}</strong>{rest.length > 0 ? <> — {rest.join(' — ')}</> : null}</li>
              )
            })}
          </ul>
          <p className="font-body text-sm text-clark-text-muted leading-relaxed mt-4">{t('ppS5ClearData')}</p>
        </section>

        {/* Security */}
        <section id="security">
          <h2 className="font-display text-2xl tracking-widest uppercase mb-4">{t('ppS6Title')}</h2>
          <p className="font-body text-sm text-clark-text-muted leading-relaxed mb-4">{t('ppS6Body')}</p>
          <ul className="space-y-2 font-body text-sm text-clark-text-muted leading-relaxed list-disc pl-5">
            {t('ppS6Items').split('\n').map((item, i) => {
              const [label, ...rest] = item.split(' — ')
              return (
                <li key={i}><strong className="text-clark-text-primary">{label}</strong>{rest.length > 0 ? <> — {rest.join(' — ')}</> : null}</li>
              )
            })}
          </ul>
        </section>

        {/* LGPD Rights */}
        <section id="lgpd-rights">
          <h2 className="font-display text-2xl tracking-widest uppercase mb-4">{t('ppS7Title')}</h2>
          <p className="font-body text-sm text-clark-text-muted leading-relaxed mb-4">{t('ppS7Intro')}</p>
          <ul className="space-y-3 font-body text-sm text-clark-text-muted leading-relaxed list-disc pl-5">
            {t('ppS7Items').split('\n').map((item, i) => {
              const [label, ...rest] = item.split(' — ')
              return (
                <li key={i}><strong className="text-clark-text-primary">{label}</strong>{rest.length > 0 ? <> — {rest.join(' — ')}</> : null}</li>
              )
            })}
          </ul>
        </section>

        {/* Account Deletion */}
        <section id="deletion">
          <h2 className="font-display text-2xl tracking-widest uppercase mb-4">{t('ppS8Title')}</h2>
          <p className="font-body text-sm text-clark-text-muted leading-relaxed mb-4">{t('ppS8Body')}</p>
          <ol className="space-y-2 font-body text-sm text-clark-text-muted leading-relaxed list-decimal pl-5">
            {t('ppS8Steps').split('\n').map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
          <p className="font-body text-sm text-clark-text-muted leading-relaxed mt-4">{t('ppS8DeletePath')}</p>
        </section>

        {/* Data Retention */}
        <section id="retention">
          <h2 className="font-display text-2xl tracking-widest uppercase mb-4">{t('ppS9Title')}</h2>
          <p className="font-body text-sm text-clark-text-muted leading-relaxed">{t('ppS9Body')}</p>
        </section>

        {/* Terms of Use */}
        <section id="terms">
          <h2 className="font-display text-2xl tracking-widest uppercase mb-4">{t('ppS10Title')}</h2>
          <div className="space-y-4 font-body text-sm text-clark-text-muted leading-relaxed">
            <p>{t('ppS10Body')}</p>
            <h3 className="font-body font-semibold text-clark-text-primary">{t('ppS10PermittedUse')}</h3>
            <p>{t('ppS10PermittedUseBody')}</p>
            <h3 className="font-body font-semibold text-clark-text-primary">{t('ppS10UserResp')}</h3>
            <p>{t('ppS10UserRespBody')}</p>
            <h3 className="font-body font-semibold text-clark-text-primary">{t('ppS10Prohibited')}</h3>
            <ul className="space-y-1 list-disc pl-5">
              {t('ppS10ProhibitedItems').split('\n').map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <h3 className="font-body font-semibold text-clark-text-primary">{t('ppS10IP')}</h3>
            <p>{t('ppS10IPBody')}</p>
            <h3 className="font-body font-semibold text-clark-text-primary">{t('ppS10Liability')}</h3>
            <p>{t('ppS10LiabilityBody')}</p>
            <h3 className="font-body font-semibold text-clark-text-primary">{t('ppS10Changes')}</h3>
            <p>{t('ppS10ChangesBody')}</p>
          </div>
        </section>

        {/* Contact */}
        <section id="contact">
          <h2 className="font-display text-2xl tracking-widest uppercase mb-4">{t('ppS11Title')}</h2>
          <p className="font-body text-sm text-clark-text-muted leading-relaxed">{t('ppS11Body')}</p>
          <p className="font-body text-clark-text-primary mt-3">{t('ppContactEmail')}</p>
        </section>

        {/* Last updated */}
        <p className="font-body text-xs text-clark-text-muted/50 pt-8 border-t border-clark-steel/20">{t('ppLastUpdated')}</p>
      </div>
    </div>
  )
}
