// pnpm backup:create [dir]
//
// Writes a backup (database + uploads) into `dir`, default ./backups. Set
// BACKUP_KEEP=<n> to keep only the newest n backups there, e.g. for a nightly
// cron job (see README → Backups).
import config from '@payload-config'
import { getPayload } from 'payload'

import { writeBackupFile } from '@/lib/backup/create'

const dir = process.argv[2] || 'backups'
const keep = process.env.BACKUP_KEEP ? Number(process.env.BACKUP_KEEP) : undefined

try {
  const payload = await getPayload({ config })
  const file = await writeBackupFile(payload, dir, { keep })
  console.log(`Backup written to ${file}`)
  process.exit(0)
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
}
