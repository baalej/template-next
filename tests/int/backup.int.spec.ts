import { createReadStream } from 'node:fs'
import { mkdtemp, rm, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { getPayload, type Payload } from 'payload'
import sharp from 'sharp'
import tar from 'tar-stream'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { writeBackupFile } from '@/lib/backup/create'
import { restoreBackup } from '@/lib/backup/restore'
import { migrations } from '@/migrations'
import config from '@/payload.config'

let payload: Payload
let backupsDir: string
let mediaDir: string

const knownMigrations = migrations.map((migration) => migration.name)

async function entriesOf(file: string): Promise<string[]> {
  const extract = tar.extract()
  createReadStream(file).pipe(extract)
  const names: string[] = []
  for await (const entry of extract) {
    names.push(entry.header.name)
    entry.resume()
  }
  return names
}

async function emails(): Promise<string[]> {
  const { docs } = await payload.find({ collection: 'users', sort: 'email' })
  return docs.map((user) => user.email)
}

describe('backups', () => {
  beforeAll(async () => {
    payload = await getPayload({ config })
    mediaDir = path.resolve(payload.collections.media.config.upload.staticDir!)
    backupsDir = await mkdtemp(path.join(tmpdir(), 'backups-test-'))
    await payload.delete({ collection: 'media', where: {} })
    await payload.delete({ collection: 'users', where: {} })
  })

  afterAll(async () => {
    await rm(backupsDir, { force: true, recursive: true })
  })

  it('restores the database and uploads exactly as they were', async () => {
    await payload.create({
      collection: 'users',
      data: { email: 'kept@example.com', password: 'test', role: 'admin' },
    })
    const png = await sharp({
      create: { width: 1000, height: 500, channels: 3, background: '#888' },
    })
      .png()
      .toBuffer()
    const media = await payload.create({
      collection: 'media',
      data: { alt: 'Grey' },
      file: { data: png, mimetype: 'image/png', name: 'grey.png', size: png.length },
    })

    const backup = await writeBackupFile(payload, backupsDir)
    const entries = await entriesOf(backup)
    expect(entries.slice(0, 2)).toEqual(['manifest.json', 'database.dump'])
    expect(entries).toContain(`uploads/media/${media.filename}`)
    expect(entries).toContain(`uploads/media/${media.sizes?.thumbnail?.filename}`)

    // Everything changes after the backup…
    await payload.delete({ collection: 'users', where: { email: { equals: 'kept@example.com' } } })
    await payload.create({
      collection: 'users',
      data: { email: 'added-later@example.com', password: 'test', role: 'admin' },
    })
    await rm(path.join(mediaDir, media.filename!))
    await writeFile(path.join(mediaDir, 'stray.txt'), 'not in the backup')

    const { safetyBackup } = await restoreBackup(payload, {
      file: backup,
      knownMigrations,
      safetyBackupDir: backupsDir,
      migrate: async () => {},
    })

    // …and the restore brings back exactly the backed-up state.
    expect(await emails()).toEqual(['kept@example.com'])
    await expect(stat(path.join(mediaDir, media.filename!))).resolves.toBeTruthy()
    await expect(stat(path.join(mediaDir, 'stray.txt'))).rejects.toThrow()
    expect(safetyBackup).toMatch(/pre-restore-.*\.tar$/)
  })

  it('refuses a backup whose schema is newer than the code, changing nothing', async () => {
    const backup = await writeBackupFile(payload, backupsDir)
    const before = await emails()

    await expect(
      restoreBackup(payload, {
        file: backup,
        knownMigrations: knownMigrations.slice(0, -1),
        safetyBackupDir: false,
        migrate: async () => {},
      }),
    ).rejects.toThrow(/newer than this code/)
    expect(await emails()).toEqual(before)
  })

  it('refuses a file that is not a backup', async () => {
    const file = path.join(backupsDir, 'not-a-backup.tar')
    await writeFile(file, 'definitely not a tar file')

    await expect(
      restoreBackup(payload, {
        file,
        knownMigrations,
        safetyBackupDir: false,
        migrate: async () => {},
      }),
    ).rejects.toThrow()
    expect(await emails()).toEqual(['kept@example.com'])
  })
})
