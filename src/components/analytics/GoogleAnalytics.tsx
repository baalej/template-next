'use client'

import Script from 'next/script'
import { useEffect } from 'react'

import { useConsent } from '@/components/consent/consentStore'

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
    // Google's documented opt-out: while true, gtag sends nothing for that ID.
    [key: `ga-disable-${string}`]: boolean | undefined
  }
}

const CONSENT_DENIED = {
  ad_personalization: 'denied',
  ad_storage: 'denied',
  ad_user_data: 'denied',
  analytics_storage: 'denied',
}

// Consent Mode "basic": gtag.js isn't requested at all until the visitor accepts,
// so nothing reaches Google and no cookies are set before that. Only analytics is
// granted; the ad signals stay denied.
export function GoogleAnalytics(props: { gaId: string }) {
  const { gaId } = props
  const consent = useConsent()

  // Once loaded, gtag.js stays for the rest of the page's life, and its inline
  // init never runs twice. So later changes of mind are applied here: the opt-out
  // flag stops every hit (a denied consent signal alone still sends cookieless
  // pings), and the consent update brings tracking back on a re-accept.
  useEffect(() => {
    // `undefined` is the hydration pass, before the stored answer is read.
    if (consent === undefined) return
    const granted = consent === 'granted'
    window[`ga-disable-${gaId}`] = !granted
    window.gtag?.('consent', 'update', { analytics_storage: granted ? 'granted' : 'denied' })
    if (consent === 'denied') deleteGaCookies()
  }, [consent, gaId])

  if (consent !== 'granted') return null

  return (
    <>
      <Script id="ga-init">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('consent', 'default', ${JSON.stringify(CONSENT_DENIED)});
          gtag('consent', 'update', { analytics_storage: 'granted' });
          gtag('js', new Date());
          gtag('config', ${JSON.stringify(gaId)});
        `}
      </Script>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`} />
    </>
  )
}

// gtag sets `_ga` and `_ga_<id>` on the widest domain it can (`.example.com` from
// `www.example.com`), and a cookie only expires when the domain matches, so try
// the host and every parent.
function deleteGaCookies() {
  const names = document.cookie
    .split('; ')
    .map((cookie) => cookie.split('=')[0])
    .filter((name) => name === '_ga' || name.startsWith('_ga_'))
  const labels = location.hostname.split('.')
  const domains = labels.map((_, index) => labels.slice(index).join('.'))

  for (const name of names) {
    document.cookie = `${name}=; max-age=0; path=/`
    for (const domain of domains) document.cookie = `${name}=; max-age=0; path=/; domain=${domain}`
  }
}

// Safe to call anywhere: does nothing until GA has loaded with consent.
export function trackEvent(name: string, params?: Record<string, unknown>) {
  window.gtag?.('event', name, params)
}
