import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './store/**/*.{ts,tsx}',
    './types/**/*.{ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ── ClarkPlayer Superman palette ──────────────────────────────────
        // Superman Shadow — page background
        'clark': {
          'bg-primary':   '#070E2B',
          'bg-secondary': '#0D1B4B',
          'bg-card':      '#1A3A8F',
          'accent':       '#E02020',
          'accent-hover': '#FF3333',
          'gold':         '#F5C518',
          'gold-hover':   '#D4A017',
          'steel':        '#2952C4',
          'sky':          '#4A7FE5',
          'text-primary': '#F5F5F5',
          'text-muted':   '#A8B4CC',
          'shadow':       '#070E2B',
          'danger':       '#CC1A1A',
        },
        // Fortress Navy — sidebar, deepest backgrounds (alias for bg-secondary)
        'fortress': {
          DEFAULT: '#0D1B4B',
          light: '#112847',
          dark: '#060F1E',
        },
        // Superman Blue — primary brand
        'superman': {
          DEFAULT: '#005BAD',
          light: '#1E6DD4',
          lighter: '#4D93E8',
          muted: 'rgba(0, 91, 173, 0.15)',
          glow: 'rgba(0, 91, 173, 0.4)',
        },
        // Hero Red — CTAs, hearts, alerts
        'hero': {
          DEFAULT: '#D11D2B',
          light: '#E53E4D',
          dark: '#A31520',
          muted: 'rgba(209, 29, 43, 0.15)',
          glow: 'rgba(209, 29, 43, 0.4)',
        },
        // S-Shield Gold — highlights, progress, premium
        'gold': {
          DEFAULT: '#F5D000',
          light: '#F7D73B',
          dark: '#C9A800',
          muted: 'rgba(245, 208, 0, 0.15)',
          glow: 'rgba(245, 208, 0, 0.4)',
        },
        // Sky Justice — light blue accents
        'sky': {
          DEFAULT: '#1E90FF',
          muted: 'rgba(30, 144, 255, 0.15)',
        },
        // Shell surfaces
        shell: {
          DEFAULT: '#070E2B',
          elevated: '#0D1526',
          raised: '#112847',
          border: '#1B3A6B',
        },
        // Accent palette (swappable via CSS variable)
        accent: {
          DEFAULT: 'var(--clark-accent, #E02020)',
          hover: 'var(--clark-accent-hover, #FF3333)',
          muted: 'var(--clark-accent-muted, rgba(224, 32, 32, 0.15))',
        },
        // Format badges
        format: {
          flac: '#005BAD',
          wav: '#14b8a6',
          mp3: '#71717a',
          aac: '#F5D000',
          ogg: '#22c55e',
          m4a: '#1E90FF',
          opus: '#8b5cf6',
          wma: '#D11D2B',
          midi: '#ec4899',
          aiff: '#06b6d4',
        },
        // UI states
        surface: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#9CA3AF',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
          950: '#09090b',
        },
      },
      fontFamily: {
        display:   ['var(--font-display)', 'Impact', 'sans-serif'],
        body:      ['var(--font-body)', 'system-ui', 'sans-serif'],
        condensed: ['var(--font-condensed)', 'var(--font-body)', 'sans-serif'],
        sans:      ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono:      ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['var(--font-scale, 1rem)', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        'display': ['4rem', { lineHeight: '1', letterSpacing: '-0.02em' }],
      },
      spacing: {
        'sidebar': '240px',
        'player': '96px',
        'header': '64px',
      },
      zIndex: {
        'player-bar': '30',
        'topbar':     '35',
        'sidebar':    '40',
        'drawer':     '45',
        'modal':      '50',
        'toast':      '60',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        'glow': '0 0 20px var(--clark-accent, rgba(224, 32, 32, 0.35))',
        'glow-blue': '0 0 20px rgba(0, 91, 173, 0.4)',
        'glow-gold': '0 0 20px rgba(245, 208, 0, 0.4)',
        'glow-hero': '0 0 20px rgba(209, 29, 43, 0.4)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.5)',
        'modal': '0 24px 48px rgba(0, 0, 0, 0.7)',
        'gold-ring': '0 0 0 2px rgba(245, 208, 0, 0.6)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-out': 'slideOut 0.2s ease-in',
        'fade-in': 'fadeIn 0.3s ease-out',
        'equalizer': 'equalizer 0.8s ease-in-out infinite alternate',
        'gold-pulse': 'goldPulse 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        slideIn: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideOut: {
          '0%': { transform: 'translateX(0)', opacity: '1' },
          '100%': { transform: 'translateX(100%)', opacity: '0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        equalizer: {
          '0%': { height: '4px' },
          '100%': { height: '16px' },
        },
        goldPulse: {
          '0%, 100%': { boxShadow: '0 0 8px rgba(245, 208, 0, 0.4)' },
          '50%': { boxShadow: '0 0 20px rgba(245, 208, 0, 0.7)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
    },
  },
  plugins: [],
}

export default config