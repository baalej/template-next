import 'dotenv/config'

import { prepareTestDatabase, pointAtTestDatabase } from './testDatabase'

// Shared by Vitest and Playwright: runs before any test. Vitest calls it once
// per project, all in the same process, so the work is shared through a global.
const shared = globalThis as { testDatabaseReady?: Promise<void> }

export default async function globalSetup() {
  shared.testDatabaseReady ??= prepareTestDatabase(pointAtTestDatabase())
  await shared.testDatabaseReady
}
