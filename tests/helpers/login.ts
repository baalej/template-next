import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

/**
 * Logs the user into the admin panel via the login page. Paths are relative to
 * `baseURL` in playwright.config.ts.
 */
export async function login(args: {
  page: Page
  user: { email: string; password: string }
}): Promise<void> {
  const { page, user } = args

  await page.goto('/admin/login')

  await page.fill('#field-email', user.email)
  await page.fill('#field-password', user.password)
  await page.click('button[type="submit"]')

  await page.waitForURL('**/admin')
  await expect(page.locator('span[title="Dashboard"]')).toBeVisible()
}
