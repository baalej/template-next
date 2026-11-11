import { spawn } from 'node:child_process'
import { createReadStream, createWriteStream } from 'node:fs'
import { cp, mkdir, mkdtemp, readdir, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { pipeline } from 'node:stream/promises'

import type { Payload } from 'payload'
import tar from 'tar-stream'

import { env } from '@/env'

import { writeBackupFile } from './create'
import {
  DATABASE_ENTRY,
  FORMAT,
  FORMAT_VERSION,
  MANIFEST_ENTRY,
  type Manifest,
  UPLOADS_PREFIX,
  uploadDirs,
} from './format'
import { connectionForTools, pgTool, serverInfo } from './pgTools'

export type RestoreOptions = {
  /** The .tar to restore. */
  file: string
  /** Migration names the code knows, oldest first (from src/migrations). */
  knownMigrations: string[]
  /** Where to write the automatic pre-restore backup; `false` skips it. */
  safetyBackupDir: string | false
  /** Brings the restored schema up to date; normally `payload migrate`. */
  migrate: () => Promise<void>
  log?: (message: string) => void
}

// Rejects anything that could land outside the staging directory.
function safeRelative(name: string): string {
  const normalized = path.posix.normalize(name)
  if (path.posix.isAbsolute(normalized) || normalized.startsWith('../') || normalized === '..') {
    throw new Error(`Unsafe path in backup: ${name}`)
  }
  return normalized
}

/** Unpacks the whole backup into `stagingDir`, so a damaged file fails before anything is touched. */
async function unpack(file: string, stagingDir: string): Promise<Manifest> {
  const extract = tar.extract()
  const source = createReadStream(file)
  source.on('error', (error) => extract.destroy(error))
  source.pipe(extract)

  let manifest: Manifest | null = null
  let hasDump = false

  // tar-stream's entries are streamx streams; they're async-iterable, which is
  // all Node's pipeline needs from a source.
  for await (const entry of extract) {
    const { header } = entry
    if (header.type !== 'file') {
      entry.resume()
      continue
    }
    const name = safeRelative(header.name)

    if (name === MANIFEST_ENTRY) {
      const chunks: Buffer[] = []
      for await (const chunk of entry) chunks.push(chunk as Buffer)
      try {
        manifest = JSON.parse(Buffer.concat(chunks).toString('utf8'))
      } catch {
        throw new Error('The backup manifest is not valid JSON')
      }
      continue
    }
    if (name !== DATABASE_ENTRY && !name.startsWith(UPLOADS_PREFIX)) {
      entry.resume()
      continue
    }
    if (name === DATABASE_ENTRY) hasDump = true
    const target = path.join(stagingDir, name)
    await mkdir(path.dirname(target), { recursive: true })
    await pipeline(entry, createWriteStream(target))
  }

  if (!manifest) throw new Error('Not a backup: manifest.json is missing')
  const { format, version } = manifest as Manifest
  if (format !== FORMAT) throw new Error('Not a backup made by this template')
  if (version > FORMAT_VERSION) {
    throw new Error(
      `Backup format ${version} is newer than this code understands (${FORMAT_VERSION})`,
    )
  }
  if (!hasDump) throw new Error('The backup has no database dump')
  return manifest
}

/**
 * Replaces the database in a single transaction: the current schema is dropped
 * and the dump replayed inside it, so if anything fails, Postgres rolls back
 * and the database is exactly as it was.
 */
async function restoreDatabase(dumpFile: string, workDir: string) {
  const server = await serverInfo(env.DATABASE_URL)
  const pgRestore = await pgTool('pg_restore', server.major)
  const psql = await pgTool('psql', server.major)
  const connection = connectionForTools(env.DATABASE_URL)

  // The archive becomes a complete SQL file first, rather than being piped
  // into psql: if pg_restore stopped halfway, psql would see a short but
  // well-formed script and commit it.
  const sqlFile = path.join(workDir, 'restore.sql')
  await run(
    pgRestore,
    ['--no-owner', '--no-privileges', `--file=${sqlFile}`, dumpFile],
    'pg_restore',
    connection.env,
  )

  // -1 wraps the DROP, the CREATE and the whole file in one transaction.
  await run(
    psql,
    [
      '--quiet',
      '--single-transaction',
      '--set=ON_ERROR_STOP=1',
      '--command=DROP SCHEMA public CASCADE',
      '--command=CREATE SCHEMA public',
      `--file=${sqlFile}`,
      connection.url,
    ],
    'psql',
    connection.env,
  )
}

function run(binary: string, args: string[], label: string, childEnv: NodeJS.ProcessEnv) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(binary, args, { env: childEnv, stdio: ['ignore', 'ignore', 'pipe'] })
    const stderr: string[] = []
    child.stderr.on('data', (chunk) => stderr.push(String(chunk)))
    child.on('error', reject)
    child.on('close', (code) =>
      code === 0
        ? resolve()
        : reject(new Error(`${label} failed (exit ${code}):\n${stderr.join('')}`)),
    )
  })
}

/** Empties each upload directory and fills it from the backup. */
async function restoreUploads(payload: Payload, stagingDir: string) {
  for (const { slug, dir } of uploadDirs(payload)) {
    await mkdir(dir, { recursive: true })
    for (const name of await readdir(dir)) {
      await rm(path.join(dir, name), { force: true, recursive: true })
    }
    const source = path.join(stagingDir, UPLOADS_PREFIX, slug)
    await cp(source, dir, { recursive: true }).catch((error: NodeJS.ErrnoException) => {
      if (error.code !== 'ENOENT') throw error // ENOENT: no files for this collection
    })
  }
}

/**
 * Replaces the database and uploads with a backup's. The app must not be
 * serving requests meanwhile (stop it first). Disk needed: about twice the
 * backup's size, for the unpacked copy plus the safety backup.
 */
export async function restoreBackup(
  payload: Payload,
  options: RestoreOptions,
): Promise<{ safetyBackup?: string }> {
  const log = options.log ?? (() => {})
  const stagingDir = await mkdtemp(path.join(tmpdir(), 'restore-'))

  try {
    log(`Unpacking ${options.file}`)
    const manifest = await unpack(options.file, stagingDir)

    const unknown = manifest.migrations.filter((name) => !options.knownMigrations.includes(name))
    if (unknown.length) {
      throw new Error(
        `The backup's schema is newer than this code; it has migrations the code doesn't: ${unknown.join(', ')}. ` +
          'Deploy the code it was made with (or newer) first.',
      )
    }
    log(`Backup of "${manifest.site}" from ${manifest.createdAt} (Postgres ${manifest.postgres})`)

    let safetyBackup: string | undefined
    if (options.safetyBackupDir) {
      log('Saving the current state first')
      safetyBackup = await writeBackupFile(payload, options.safetyBackupDir, {
        prefix: 'pre-restore-',
      })
      log(`  → ${safetyBackup}`)
    }

    log('Restoring the database')
    await restoreDatabase(path.join(stagingDir, DATABASE_ENTRY), stagingDir)

    log('Restoring uploads')
    await restoreUploads(payload, stagingDir)

    log('Applying migrations newer than the backup')
    await options.migrate()

    return { safetyBackup }
  } finally {
    await rm(stagingDir, { force: true, recursive: true })
  }
}
