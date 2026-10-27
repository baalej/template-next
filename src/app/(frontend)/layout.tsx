import React from 'react'

import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics'
import { CookieConsent } from '@/components/consent/CookieConsent'
import './styles.css'

// Analytics is the only thing that sets non-essential cookies, so without an ID
// there's nothing to ask consent for and the banner stays out too.
const gaId = process.env.NEXT_PUBLIC_GA_ID || undefined

// A UA- or GTM- ID would load and silently track nothing, so fail the build instead.
if (gaId && !/^G-[A-Z0-9]+$/.test(gaId)) {
  throw new Error(`NEXT_PUBLIC_GA_ID must be a GA4 measurement ID (G-XXXXXXXXXX), got "${gaId}"`)
}

export const metadata = {
  description: 'A blank template using Payload in a Next.js app.',
  title: 'Payload Blank Template',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en">
      <body>
        <main>{children}</main>
        {gaId && (
          <>
            <CookieConsent />
            <GoogleAnalytics gaId={gaId} />
          </>
        )}
      </body>
    </html>
  )
}
