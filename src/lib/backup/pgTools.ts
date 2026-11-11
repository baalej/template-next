import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

import pg from 'pg'

const run = promisify(execFile)

type Tool = 'pg_dump' | 'pg_restore' | 'psql'

// Backups are made and restored with the Postgres client tools, and their major
// version must match the server's. A newer pg_dump writes archives an older
// pg_restore can't read, so a backup taken on a laptop with Postgres 18 tools
// wouldn't restore on the server, which has 17. Insisting on the server's major
// everywhere keeps every backup restorable everywhere.
//
// Where each environment has them:
// - Docker image: `postgresql17-client` (Dockerfile)
// - macOS: `brew install postgresql@17` (keg-only, found below without PATH changes)
// - CI: PG_BIN_DIR set in the workflow
function candidateDirs(major: number): string[] {
  return [
    process.env.PG_BIN_DIR ?? '',
    `/opt/homebrew/opt/postgresql@${major}/bin`,
    `/usr/local/opt/postgresql@${major}/bin`,
    `/usr/lib/postgresql/${major}/bin`,
    `/usr/libexec/postgresql${major}`,
    '', // bare name, resolved through PATH
  ]
}

async function majorOf(binary: string): Promise<number | null> {
  try {
    const { stdout } = await run(binary, ['--version'])
    const match = stdout.match(/\(PostgreSQL\)\s+(\d+)/)
    return match ? Number(match[1]) : null
  } catch {
    return null
  }
}

const found = new Map<string, string>()

/** Path to a client tool whose major version matches the server's. */
export async function pgTool(tool: Tool, serverMajor: number): Promise<string> {
  const key = `${tool}@${serverMajor}`
  const cached = found.get(key)
  if (cached) return cached

  const seen: string[] = []
  for (const dir of new Set(candidateDirs(serverMajor))) {
    const binary = dir ? `${dir}/${tool}` : tool
    const major = await majorOf(binary)
    if (major === serverMajor) {
      found.set(key, binary)
      return binary
    }
    if (major !== null) seen.push(`${binary} (${major})`)
  }

  throw new Error(
    `${tool} for PostgreSQL ${serverMajor} not found` +
      (seen.length ? `; found other versions: ${seen.join(', ')}` : '') +
      `. On macOS: brew install postgresql@${serverMajor}. Elsewhere, install the ` +
      `PostgreSQL ${serverMajor} client tools or point PG_BIN_DIR at them.`,
  )
}

/**
 * Splits a connection string so the password travels in the child's
 * environment rather than its command line, where `ps` would show it.
 */
export function connectionForTools(databaseUrl: string): { url: string; env: NodeJS.ProcessEnv } {
  const url = new URL(databaseUrl)
  const password = decodeURIComponent(url.password)
  url.password = ''
  return {
    url: url.toString(),
    env: { ...process.env, ...(password ? { PGPASSWORD: password } : {}) },
  }
}

export async function serverInfo(databaseUrl: string): Promise<{ major: number; version: string }> {
  const client = new pg.Client({ connectionString: databaseUrl })
  await client.connect()
  try {
    const { rows } = await client.query<{ num: string; version: string }>(
      `SELECT current_setting('server_version_num') AS num, current_setting('server_version') AS version`,
    )
    return { major: Math.floor(Number(rows[0].num) / 10000), version: rows[0].version }
  } finally {
    await client.end()
  }
}

/** Names of the migrations applied to this database, oldest first. */
export async function appliedMigrations(databaseUrl: string): Promise<string[]> {
  const client = new pg.Client({ connectionString: databaseUrl })
  await client.connect()
  try {
    // batch -1 marks a dev-mode schema push, not a migration.
    const { rows } = await client.query<{ name: string }>(
      `SELECT name FROM payload_migrations WHERE batch > 0 ORDER BY id`,
    )
    return rows.map((row) => row.name)
  } catch {
    return []
  } finally {
    await client.end()
  }
}
