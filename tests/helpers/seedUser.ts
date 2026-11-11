import { getPayload } from 'payload'

import config from '../../src/payload.config'

// Lives only in the test database (see tests/setup/testDatabase.ts).
export const testUser = {
  email: 'e2e@example.com',
  password: 'test',
  role: 'admin' as const,
}

const byEmail = { email: { equals: testUser.email } }

/** Seeds a fresh admin user for e2e admin tests. */
export async function seedTestUser(): Promise<void> {
  const payload = await getPayload({ config })
  await payload.delete({ collection: 'users', where: byEmail })
  await payload.create({ collection: 'users', data: testUser })
}

export async function cleanupTestUser(): Promise<void> {
  const payload = await getPayload({ config })
  await payload.delete({ collection: 'users', where: byEmail })
}
