import { expect, test } from '@playwright/test'

import { site } from '../../src/lib/site'

test.describe('Frontend', () => {
  test('serves the home page', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(site.name)
    await expect(page.locator('h1').first()).toHaveText(site.name)
  })

  test('answers unknown URLs with a 404', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist')
    expect(response?.status()).toBe(404)
  })

  test('sends the security headers', async ({ request }) => {
    const response = await request.get('/')
    expect(response.headers()['x-content-type-options']).toBe('nosniff')
    expect(response.headers()['referrer-policy']).toBe('strict-origin-when-cross-origin')
  })
})
