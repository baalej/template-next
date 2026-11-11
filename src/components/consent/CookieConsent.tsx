'use client'

import React from 'react'

import { openConsentSettings, setConsent, useConsentBannerOpen } from './consentStore'
import { consentCopy } from './copy'
import './CookieConsent.css'

export function CookieConsent(props: { policyHref?: string }) {
  const open = useConsentBannerOpen()

  if (!open) return null

  return (
    <div aria-label={consentCopy.region} className="cookie-consent" role="region">
      <p>
        {consentCopy.message}
        {props.policyHref && (
          <>
            {' '}
            <a href={props.policyHref}>{consentCopy.policy}</a>
          </>
        )}
      </p>
      <div className="cookie-consent__actions">
        {/* Rejecting must be as easy as accepting, so both get the same button. */}
        <button onClick={() => setConsent('denied')} type="button">
          {consentCopy.reject}
        </button>
        <button onClick={() => setConsent('granted')} type="button">
          {consentCopy.accept}
        </button>
      </div>
    </div>
  )
}

// Withdrawing consent has to be as easy as giving it, so the layout's footer
// renders this whenever the banner can appear.
export function CookieSettingsButton(props: { className?: string }) {
  return (
    <button className={props.className} onClick={openConsentSettings} type="button">
      {consentCopy.settings}
    </button>
  )
}
