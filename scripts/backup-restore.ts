// pnpm backup:restore <file.tar>
//
// Replaces the database and uploads with a backup's, then applies any
// migrations newer than it. Stop the app first (Ctrl-C `pnpm dev`, or
// `docker compose -f docker-compose.prod.yml stop payload`).
//
// The current state is saved first as pre-restore-<…>.tar next to the backup,
// so a restore can always be undone by restoring that file.
import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { createInterface } from 'node:readline/promises'

import config from '@payload-config'
import { getPayload } from 'payload'

import { restoreBackup } from '@/lib/backup/restore'
import { migrations } from '@/migrations'

const file = process.argv[2]
if (!file) {
  console.error('Usage: pnpm backup:restore <file.tar>')
  process.exit(1)
}

const database = new URL(process.env.DATABASE_URL ?? '').pathname.slice(1)

// Interactive confirmation, or BACKUP_RESTORE_CONFIRM=<database name> when
// there's no terminal to ask in.
async function confirmed(): Promise<boolean> {
  if (process.env.BACKUP_RESTORE_CONFIRM) return process.env.BACKUP_RESTORE_CONFIRM === database
  if (!process.stdin.isTTY) {
    console.error(`No terminal to confirm in; set BACKUP_RESTORE_CONFIRM=${database} to proceed.`)
    return false
  }
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  const answer = await rl.question(
    `This replaces everything in database "${database}" and the uploads with the backup.\n` +
      `Type the database name to continue: `,
  )
  rl.close()
  return answer.trim() === database
}

try {
  if (!(await confirmed())) {
    console.error('Cancelled.')
    process.exit(1)
  }
  const payload = await getPayload({ config })
  const { safetyBackup } = await restoreBackup(payload, {
    file,
    knownMigrations: migrations.map((migration) => migration.name),
    safetyBackupDir: path.dirname(path.resolve(file)),
    migrate: async () => {
      execFileSync('pnpm', ['payload', 'migrate'], { stdio: 'inherit' })
    },
    log: console.log,
  })
  console.log('Restore complete.')
  if (safetyBackup) console.log(`The previous state is in ${safetyBackup}`)
  process.exit(0)
} catch (error) {
  console.error(`Restore failed: ${error instanceof Error ? error.message : error}`)
  console.error('The database is unchanged if the failure came before "Restoring uploads".')
  process.exit(1)
}
