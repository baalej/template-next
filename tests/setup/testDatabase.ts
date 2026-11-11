import { execFileSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import path from 'node:path'

import pg from 'pg'

// Tests never touch the dev database. They run against a sibling database with
// a `_test` suffix on the same Postgres server (`myproject` → `myproject_test`),
// created on demand and brought up to date with the project's own migrations —
// the same path production takes, so a broken migration fails the tests too.

export function testDatabaseUrl(databaseUrl = process.env.DATABASE_URL): string {
  if (!databaseUrl) throw new Error('DATABASE_URL is not set (see .env)')
  const url = new URL(databaseUrl)
  const name = url.pathname.slice(1)
  if (!name) throw new Error('DATABASE_URL has no database name')
  // Already pointing at a test database (CI sets it directly): use as is.
  if (name.endsWith('_test')) return databaseUrl
  url.pathname = `/${name}_test`
  return url.toString()
}

// Uploads made by tests go here, never into the project's media folder.
export const testMediaDir = path.join(tmpdir(), 'template-next-test-media')

/** Points this process at the test database and media dir. Call before Payload is imported. */
export function pointAtTestDatabase(): string {
  const url = testDatabaseUrl()
  process.env.DATABASE_URL = url
  process.env.MEDIA_DIR = testMediaDir
  return url
}

/** Creates the test database if needed and applies every migration to it. */
export async function prepareTestDatabase(url: string): Promise<void> {
  const target = new URL(url)
  const name = decodeURIComponent(target.pathname.slice(1))

  // CREATE DATABASE has to be issued from another database on the server.
  const admin = new URL(url)
  admin.pathname = '/postgres'
  const client = new pg.Client({ connectionString: admin.toString() })
  await client.connect()
  try {
    const { rowCount } = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [name])
    if (!rowCount) await client.query(`CREATE DATABASE "${name.replaceAll('"', '""')}"`)
  } finally {
    await client.end()
  }

  execFileSync('pnpm', ['payload', 'migrate'], {
    env: { ...process.env, DATABASE_URL: url },
    stdio: 'inherit',
  })
}
