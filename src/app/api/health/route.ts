import configPromise from '@payload-config'
import type { PostgresAdapter } from '@payloadcms/db-postgres'
import { getPayload } from 'payload'

// Liveness check for Docker (see `healthcheck` in docker-compose.prod.yml).
// "Healthy" means the app can serve a request and reach Postgres.
//
// It is not public: Caddy answers this path with a 404, and Docker calls it from
// inside the container on localhost. Even so it reveals nothing — no version,
// no error detail — in case it's ever exposed by mistake.
export async function GET() {
  try {
    const payload = await getPayload({ config: configPromise })
    await (payload.db as unknown as PostgresAdapter).pool.query('SELECT 1')
    return Response.json({ status: 'ok' }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return Response.json(
      { status: 'error' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    )
  }
}
