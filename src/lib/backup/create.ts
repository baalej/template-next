import { execFile } from 'node:child_process'
import { createReadStream, createWriteStream } from 'node:fs'
import { mkdir, mkdtemp, readdir, rename, rm, stat, unlink } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { promisify } from 'node:util'

import type { Payload } from 'payload'
import tar from 'tar-stream'

import { env } from '@/env'
import { site } from '@/lib/site'

import {
  DATABASE_ENTRY,
  FORMAT,
  FORMAT_VERSION,
  MANIFEST_ENTRY,
  type Manifest,
  UPLOADS_PREFIX,
  type UploadDir,
  uploadDirs,
} from './format'
import { appliedMigrations, connectionForTools, pgTool, serverInfo } from './pgTools'

const run = promisify(execFile)

type UploadFile = { entry: string; file: string; size: number; mtime: Date }

async function listFiles(root: string): Promise<string[]> {
  try {
    const entries = await readdir(root, { recursive: true, withFileTypes: true })
    return entries
      .filter((entry) => entry.isFile())
      .map((entry) => path.join(entry.parentPath, entry.name))
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return []
    throw error
  }
}

async function listUploads(dirs: UploadDir[]): Promise<UploadFile[]> {
  const files: UploadFile[] = []
  for (const { slug, dir } of dirs) {
    for (const file of await listFiles(dir)) {
      const info = await stat(file)
      const relative = path.relative(dir, file).split(path.sep).join('/')
      files.push({
        entry: `${UPLOADS_PREFIX}${slug}/${relative}`,
        file,
        size: info.size,
        mtime: info.mtime,
      })
    }
  }
  return files
}

// tar-stream uses streamx streams, not Node's, so entries are fed by hand.
// Every wait also ends if the pack is destroyed (the download was cancelled),
// or the producer below would wait forever and never clean up.

function addBuffer(pack: tar.Pack, name: string, data: Buffer) {
  return new Promise<void>((resolve, reject) =>
    pack.entry({ name, size: data.length }, data, (error) => (error ? reject(error) : resolve())),
  )
}

// What an entry really is (a streamx Writable); @types/tar-stream calls it a
// Node Writable, whose signatures don't match.
type EntryStream = {
  write(chunk: Buffer): boolean
  end(): void
  once(event: 'drain', listener: () => void): void
}

function untilDrainOrClose(entry: EntryStream, pack: tar.Pack) {
  return new Promise<void>((resolve, reject) => {
    entry.once('drain', resolve)
    pack.once('close', () => reject(new Error('Backup stream closed')))
  })
}

async function addFile(pack: tar.Pack, name: string, file: string, size: number, mtime: Date) {
  let finish!: (error?: Error | null) => void
  const written = new Promise<void>((resolve, reject) => {
    finish = (error) => (error ? reject(error) : resolve())
  })
  const entry = pack.entry({ name, size, mtime }, finish) as unknown as EntryStream
  for await (const chunk of createReadStream(file) as AsyncIterable<Buffer>) {
    if (pack.destroyed) throw new Error('Backup stream closed')
    if (!entry.write(chunk)) await untilDrainOrClose(entry, pack)
  }
  entry.end()
  await written
}

function backupFilename(date: Date): string {
  const slug = site.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  const stamp = date.toISOString().slice(0, 19).replace(/[-:]/g, '').replace('T', '-')
  return `${slug || 'site'}-backup-${stamp}.tar`
}

// One backup at a time per process. A second click while one is streaming
// would double the database load for nothing.
let running = false

export class BackupInProgressError extends Error {
  constructor() {
    super('A backup is already being created')
  }
}

/**
 * Builds a backup and returns it as a stream, for the admin download or for
 * writing to a file. The database dump is written to a temporary file first (a
 * tar entry needs its size up front); uploads are read straight from disk into
 * the stream, so the only extra disk used is about the size of the dump.
 *
 * Everything that can fail before any byte is sent (missing tools, no
 * database) throws here, so callers can still answer with a proper error.
 */
export async function createBackup(
  payload: Payload,
): Promise<{ filename: string; stream: Readable }> {
  if (running) throw new BackupInProgressError()
  running = true

  const workDir = await mkdtemp(path.join(tmpdir(), 'backup-'))
  const cleanup = () => {
    running = false
    return rm(workDir, { force: true, recursive: true })
  }

  try {
    const createdAt = new Date()
    const server = await serverInfo(env.DATABASE_URL)
    const pgDump = await pgTool('pg_dump', server.major)
    const dumpFile = path.join(workDir, DATABASE_ENTRY)
    const connection = connectionForTools(env.DATABASE_URL)

    // --no-owner / --no-privileges: the dump restores under whichever role runs
    // the restore, so it moves freely between dev (postgres) and production.
    await run(
      pgDump,
      ['--format=custom', '--no-owner', '--no-privileges', `--file=${dumpFile}`, connection.url],
      { env: connection.env, maxBuffer: 16 * 1024 * 1024 },
    )

    const dirs = uploadDirs(payload)
    const uploads = await listUploads(dirs)
    const manifest: Manifest = {
      format: FORMAT,
      version: FORMAT_VERSION,
      createdAt: createdAt.toISOString(),
      site: site.name,
      postgres: server.version,
      migrations: await appliedMigrations(env.DATABASE_URL),
      uploads: Object.fromEntries(
        dirs.map(({ slug }) => {
          const own = uploads.filter((upload) =>
            upload.entry.startsWith(`${UPLOADS_PREFIX}${slug}/`),
          )
          return [
            slug,
            { files: own.length, bytes: own.reduce((sum, upload) => sum + upload.size, 0) },
          ]
        }),
      ),
    }
    const dumpInfo = await stat(dumpFile)

    const pack = tar.pack()
    void (async () => {
      await addBuffer(pack, MANIFEST_ENTRY, Buffer.from(JSON.stringify(manifest, null, 2)))
      await addFile(pack, DATABASE_ENTRY, dumpFile, dumpInfo.size, createdAt)
      for (const upload of uploads) {
        // A file deleted since it was listed is skipped rather than failing the
        // whole backup; its database row is gone too, or going.
        const current = await stat(upload.file).catch(() => null)
        if (!current) continue
        await addFile(pack, upload.entry, upload.file, current.size, current.mtime)
      }
      pack.finalize()
    })()
      // Also reached when the client disconnects and the stream is destroyed.
      .catch((error) => pack.destroy(error))
      .finally(cleanup)

    // A Node stream for callers (Response, fs); destroying it destroys the pack.
    return { filename: backupFilename(createdAt), stream: Readable.from(pack) }
  } catch (error) {
    await cleanup()
    throw error
  }
}

/**
 * Writes a backup into `dir` and returns its path. The file appears under its
 * final name only once complete, so a half-written backup is never mistaken for
 * a good one. With `keep`, older backups in `dir` beyond that many are deleted.
 */
export async function writeBackupFile(
  payload: Payload,
  dir: string,
  options: { keep?: number; prefix?: string } = {},
): Promise<string> {
  await mkdir(dir, { recursive: true })
  const { filename, stream } = await createBackup(payload)
  const target = path.join(dir, `${options.prefix ?? ''}${filename}`)
  const partial = `${target}.partial`
  try {
    await pipeline(stream, createWriteStream(partial))
    await rename(partial, target)
  } catch (error) {
    await rm(partial, { force: true })
    throw error
  }

  if (options.keep) {
    // Only regular backups count; pre-restore safety copies are left alone.
    const backups = (await readdir(dir))
      .filter(
        (name) =>
          name.includes('-backup-') && name.endsWith('.tar') && !name.startsWith('pre-restore-'),
      )
      .sort()
    for (const name of backups.slice(0, Math.max(0, backups.length - options.keep))) {
      await unlink(path.join(dir, name))
    }
  }

  return target
}
