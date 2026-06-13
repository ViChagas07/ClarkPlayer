import type { NextConfig } from 'next'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://clarkplayer.onrender.com'

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // ── Image Optimization ──────────────────────────────────────
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 768, 1024, 1280, 1536],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 86400, // Cache optimized images for 24h on CDN
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'clarkplayer.onrender.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'is1-ssl.mzstatic.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.scdn.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lastfm.freetls.fastly.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.mzstatic.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.scdn.co',
        pathname: '/**',
      },
    ],
  },

  // ── Performance Optimizations ──────────────────────────────
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,

  // ── Experimental Features ───────────────────────────────────
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@dnd-kit/core',
      '@dnd-kit/sortable',
    ],
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },

  // ── API Rewrites ────────────────────────────────────────────
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${API_URL}/api/:path*`,
      },
      {
        source: '/health',
        destination: `${API_URL}/health`,
      },
    ]
  },

  // ── Security & Cache Headers ────────────────────────────────
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ]
  },
}

export default nextConfig
