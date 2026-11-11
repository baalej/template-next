import type { Metadata } from 'next'
import React from 'react'

import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics'
import { CookieConsent, CookieSettingsButton } from '@/components/consent/CookieConsent'
import { gaId, site } from '@/lib/site'
import './styles.css'

export const metadata: Metadata = {
  // Turns relative Open Graph, canonical and icon URLs into absolute ones.
  // Without it they stay relative, and social previews show no image.
  metadataBase: new URL(site.url),
  title: {
    default: site.name,
    template: `%s | ${site.name}`,
  },
  description: site.description || undefined,
  openGraph: {
    siteName: site.name,
    type: 'website',
  },
}

export default function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang={site.lang}>
      <body>
        <main>{children}</main>
        <footer className="site-footer">
          {/* Reopens the banner: once someone has answered, this is the only
              way to change their mind, which consent law requires. */}
          {gaId && <CookieSettingsButton className="site-footer__link" />}
        </footer>
        {gaId && (
          <>
            <CookieConsent policyHref={site.privacyPolicyPath || undefined} />
            <GoogleAnalytics gaId={gaId} />
          </>
        )}
      </body>
    </html>
  )
}
