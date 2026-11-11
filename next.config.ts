import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

// ─── Security headers ──────────────────────────────────────────────
// Set here rather than in the Caddyfile so they apply identically in dev and
// production, and so the third-party allowlist below sits next to the code that
// loads those third parties. HSTS is the exception: it lives in the Caddyfile,
// because it only means something over HTTPS. See AGENTS.md → "Security headers".

// Safe whatever the site embeds or loads.
const baseHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // SAMEORIGIN, not DENY: the admin's live preview frames the site itself.
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
  },
]

// Content Security Policy for the frontend (never the admin, which needs inline
// scripts and styles of its own). Off by default because it depends on what the
// site loads: every third party (analytics, embeds, fonts, maps) has to be
// listed, or the browser blocks it.
//
// To turn it on: list each third party's origins in `cspSources`, set
// `cspMode` to 'report-only', browse the whole site watching the console for
// violations, fix them, then switch to 'enforce'.
const cspMode = 'off' as 'off' | 'report-only' | 'enforce'

const cspSources = {
  script: [
    // Google Analytics 4 (components/analytics/GoogleAnalytics.tsx):
    // 'https://www.googletagmanager.com',
  ],
  connect: [
    // Google Analytics 4:
    // 'https://*.google-analytics.com',
    // 'https://*.analytics.google.com',
    // 'https://*.googletagmanager.com',
  ],
  img: [
    // Google Analytics 4:
    // 'https://*.google-analytics.com',
    // 'https://*.googletagmanager.com',
  ],
  frame: [
    // e.g. YouTube embeds: 'https://www.youtube-nocookie.com',
  ],
  font: [],
  style: [],
} satisfies Record<string, string[]>

const isDev = process.env.NODE_ENV === 'development'

// 'unsafe-inline' for scripts because Next inlines its bootstrap scripts; the
// stricter nonce-based setup makes every page render per request. See
// node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md.
const csp = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline' ${isDev ? `'unsafe-eval'` : ''} ${cspSources.script.join(' ')}`,
  `style-src 'self' 'unsafe-inline' ${cspSources.style.join(' ')}`,
  `img-src 'self' blob: data: ${cspSources.img.join(' ')}`,
  `font-src 'self' ${cspSources.font.join(' ')}`,
  `connect-src 'self' ${isDev ? 'ws:' : ''} ${cspSources.connect.join(' ')}`,
  `frame-src 'self' ${cspSources.frame.join(' ')}`,
  `object-src 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `frame-ancestors 'self'`,
]
  .map((directive) => directive.replace(/\s+/g, ' ').trim())
  .join('; ')

const cspHeaders =
  cspMode === 'off'
    ? []
    : [
        {
          // Everything except the admin panel and the API.
          source: '/((?!admin|api).*)',
          headers: [
            {
              key:
                cspMode === 'enforce'
                  ? 'Content-Security-Policy'
                  : 'Content-Security-Policy-Report-Only',
              value: csp,
            },
          ],
        },
      ]

const nextConfig: NextConfig = {
  // The Dockerfile copies .next/standalone; without this it doesn't exist.
  output: 'standalone',
  images: {
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
    ],
  },
  experimental: {
    // app/global-not-found.tsx: the 404 for URLs matching no route. Needed
    // because the frontend and the admin are two separate root layouts.
    globalNotFound: true,
  },
  async headers() {
    return [{ source: '/:path*', headers: baseHeaders }, ...cspHeaders]
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
