'use client'

import React from 'react'

import { openConsentSettings, setConsent, useConsentBannerOpen } from './consentStore'
import './CookieConsent.css'

export function CookieConsent() {
  const open = useConsentBannerOpen()

  if (!open) return null

  return (
    <div aria-label="Cookie consent" className="cookie-consent" role="region">
      <p>
        We use analytics cookies to understand how this site is used. They&apos;re only set if you
        accept.
      </p>
      <div className="cookie-consent__actions">
        {/* Rejecting must be as easy as accepting, so both get the same button. */}
        <button onClick={() => setConsent('denied')} type="button">
          Reject
        </button>
        <button onClick={() => setConsent('granted')} type="button">
          Accept
        </button>
      </div>
    </div>
  )
}

// Withdrawing consent has to be as easy as giving it: put this in the footer.
export function CookieSettingsButton(props: { className?: string }) {
  return (
    <button className={props.className} onClick={openConsentSettings} type="button">
      Cookie settings
    </button>
  )
}
