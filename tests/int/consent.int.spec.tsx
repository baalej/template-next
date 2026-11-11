import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics'
import { CookieConsent, CookieSettingsButton } from '@/components/consent/CookieConsent'
import { consentCopy } from '@/components/consent/copy'

const GA_ID = 'G-TEST000000'

function renderSite() {
  return render(
    <>
      <CookieSettingsButton />
      <CookieConsent />
      <GoogleAnalytics gaId={GA_ID} />
    </>,
  )
}

const click = (name: string) => fireEvent.click(screen.getByRole('button', { name }))
const banner = () => screen.queryByRole('region', { name: consentCopy.region })
const gaScript = () => document.querySelector('script[src*="googletagmanager.com/gtag/js"]')
const trackingBlocked = () => window[`ga-disable-${GA_ID}`]

describe('cookie consent and analytics', () => {
  beforeEach(() => {
    localStorage.clear()
    // Stands in for gtag.js, which jsdom never runs.
    window.gtag = vi.fn()
  })

  afterEach(() => {
    cleanup()
    document.querySelectorAll('script').forEach((script) => script.remove())
    document.cookie.split('; ').forEach((cookie) => {
      document.cookie = `${cookie.split('=')[0]}=; max-age=0; path=/`
    })
  })

  it('asks a first-time visitor and loads nothing until they answer', () => {
    renderSite()

    expect(banner()).not.toBeNull()
    expect(gaScript()).toBeNull()
  })

  it('loads analytics on accept and remembers the answer', async () => {
    renderSite()
    await act(async () => click(consentCopy.accept))

    expect(banner()).toBeNull()
    expect(gaScript()).not.toBeNull()
    expect(trackingBlocked()).toBe(false)

    cleanup()
    renderSite()
    expect(banner()).toBeNull()
  })

  it('never loads analytics after a reject', async () => {
    renderSite()
    await act(async () => click(consentCopy.reject))

    expect(banner()).toBeNull()
    expect(gaScript()).toBeNull()
    expect(trackingBlocked()).toBe(true)
  })

  it('keeps tracking while the visitor reconsiders, and resumes on a re-accept', async () => {
    renderSite()
    await act(async () => click(consentCopy.accept))

    await act(async () => click(consentCopy.settings))
    expect(banner()).not.toBeNull()
    expect(trackingBlocked()).toBe(false)

    await act(async () => click(consentCopy.reject))
    expect(trackingBlocked()).toBe(true)

    await act(async () => click(consentCopy.settings))
    await act(async () => click(consentCopy.accept))
    expect(trackingBlocked()).toBe(false)
    expect(window.gtag).toHaveBeenLastCalledWith('consent', 'update', {
      analytics_storage: 'granted',
    })
  })

  it('removes the analytics cookies when consent is withdrawn', async () => {
    renderSite()
    await act(async () => click(consentCopy.accept))
    document.cookie = '_ga=GA1.1.123.456; path=/'
    document.cookie = `_ga_${GA_ID.slice(2)}=GS2.1.s1; path=/`
    document.cookie = 'unrelated=keep; path=/'

    await act(async () => click(consentCopy.settings))
    await act(async () => click(consentCopy.reject))

    expect(document.cookie).toBe('unrelated=keep')
  })
})
