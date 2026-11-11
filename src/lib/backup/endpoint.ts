import { Readable } from 'node:stream'

import type { Endpoint } from 'payload'

import { isAdminUser } from '@/access'

import { BackupInProgressError, createBackup } from './create'

// GET /api/backup: streams a full backup (database + uploads) as a download.
// Admins only. Linked from the admin dashboard (components/admin/BackupPanel).
export const backupEndpoint: Endpoint = {
  path: '/backup',
  method: 'get',
  handler: async (req) => {
    if (!isAdminUser(req.user)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    try {
      const { filename, stream } = await createBackup(req.payload)
      req.payload.logger.info({ msg: 'Backup download started', user: req.user?.email, filename })
      return new Response(Readable.toWeb(stream) as ReadableStream, {
        headers: {
          'Cache-Control': 'no-store',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Content-Type': 'application/x-tar',
        },
      })
    } catch (error) {
      if (error instanceof BackupInProgressError) {
        return Response.json({ error: error.message }, { status: 409 })
      }
      req.payload.logger.error({ err: error, msg: 'Backup failed' })
      return Response.json({ error: 'Backup failed; see the server logs' }, { status: 500 })
    }
  },
}
