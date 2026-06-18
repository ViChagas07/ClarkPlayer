import Link from 'next/link'

export function GlobalFooter() {
  return (
    <footer className="border-t border-clark-steel/20 mt-12 py-6 px-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link href="/privacy-policy" className="font-body text-xs text-clark-text-muted hover:text-clark-gold transition-colors">
            Privacy Policy
          </Link>
          <Link href="/privacy-policy#terms" className="font-body text-xs text-clark-text-muted hover:text-clark-gold transition-colors">
            Terms of Use
          </Link>
          <Link href="/privacy-policy#contact" className="font-body text-xs text-clark-text-muted hover:text-clark-gold transition-colors">
            Contact
          </Link>
        </div>
        <p className="font-body text-xs text-clark-text-muted/50">
          &copy; {new Date().getFullYear()} ClarkPlayer. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
