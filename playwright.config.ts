import 'dotenv/config'

import { defineConfig, devices } from '@playwright/test'

import { pointAtTestDatabase } from './tests/setup/testDatabase'

// Its own port, so a `pnpm dev` you already have running on 3000 (against the
// dev database) is never mistaken for the test server and reused.
const PORT = 3100
const baseURL = `http://localhost:${PORT}`

// The server under test and the seed helpers both use the test database (and
// test media dir). This
// file is evaluated in the runner and in every worker, so setting it here
// reaches all of them.
pointAtTestDatabase()

export default defineConfig({
  testDir: './tests/e2e',
  globalSetup: './tests/setup/globalSetup.ts',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  // 'list' locally; the HTML report is kept for CI artifacts and never
  // auto-opens a browser.
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], channel: 'chromium' },
    },
  ],
  webServer: {
    // CI tests the production build, as deployed; locally the dev server is
    // much faster to start and is what you're iterating on anyway.
    command: process.env.CI ? `pnpm build && pnpm start -p ${PORT}` : `pnpm dev -p ${PORT}`,
    env: { DATABASE_URL: process.env.DATABASE_URL!, MEDIA_DIR: process.env.MEDIA_DIR! },
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
    url: baseURL,
  },
})
