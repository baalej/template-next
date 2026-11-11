import path from 'node:path'

import type { Payload } from 'payload'

// A backup is one uncompressed .tar file:
//
//   manifest.json              what's inside, and what made it (Manifest below)
//   database.dump              pg_dump custom format; Postgres compresses it itself
//   uploads/<slug>/<file>      every file of each upload collection stored on disk
//
// Media is left uncompressed on purpose: images, video and PDFs are already
// compressed, so gzipping them would cost CPU for almost no gain. Plain tar also
// opens with the system archive tool on macOS, Windows and Linux.

export const FORMAT = 'template-next-backup'
export const FORMAT_VERSION = 1

export const MANIFEST_ENTRY = 'manifest.json'
export const DATABASE_ENTRY = 'database.dump'
export const UPLOADS_PREFIX = 'uploads/'

export type Manifest = {
  format: typeof FORMAT
  version: number
  createdAt: string
  site: string
  postgres: string
  // Applied migrations. A restore refuses a backup whose schema is newer than
  // the code (a migration the code doesn't have), and migrates older ones up.
  migrations: string[]
  uploads: Record<string, { files: number; bytes: number }>
}

export type UploadDir = { slug: string; dir: string }

/**
 * Upload collections whose files live on this server's disk. Collections
 * stored elsewhere (an S3 storage plugin, say) aren't part of the backup.
 */
export function uploadDirs(payload: Payload): UploadDir[] {
  return Object.values(payload.collections)
    .map(({ config }) => config)
    .filter((config) => config.upload && !config.upload.disableLocalStorage)
    .map((config) => ({
      slug: config.slug,
      // Payload resolves a relative staticDir against the working directory.
      dir: path.resolve(process.cwd(), config.upload.staticDir || config.slug),
    }))
}
