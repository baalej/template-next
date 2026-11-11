// Site-wide settings used by metadata, robots, the sitemap and the layout.
// Change these first in a new project.

export const site = {
  name: 'Website',
  description: '',
  // BCP 47 tag for <html lang>. Also picks the cookie banner's copy
  // (components/consent/copy.ts has 'es' and 'en').
  lang: 'es',
  // Linked from the cookie banner. Leave empty until the site has the page;
  // any site that shows the banner should have one.
  privacyPolicyPath: '',
  // Absolute origin, no trailing slash. NEXT_PUBLIC_* is inlined at build time,
  // so production gets it from the Docker build arg (see the Dockerfile).
  url: (process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000').replace(/\/$/, ''),
} as const

// Analytics is the only thing that sets non-essential cookies, so without an ID
// there's nothing to ask consent for and the banner stays out too.
export const gaId = process.env.NEXT_PUBLIC_GA_ID || undefined

// A UA- or GTM- ID would load and silently track nothing, so fail the build instead.
if (gaId && !/^G-[A-Z0-9]+$/.test(gaId)) {
  throw new Error(`NEXT_PUBLIC_GA_ID must be a GA4 measurement ID (G-XXXXXXXXXX), got "${gaId}"`)
}
