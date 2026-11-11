import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import config from '@/payload.config'

let payload: Payload

const email = 'int-first-user@example.com'

describe('users', () => {
  beforeAll(async () => {
    payload = await getPayload({ config })
    await payload.delete({ collection: 'users', where: {} })
  })

  afterAll(async () => {
    await payload.delete({ collection: 'users', where: {} })
  })

  it('makes the first user an admin and later ones editors', async () => {
    const first = await payload.create({
      collection: 'users',
      data: { email, password: 'test', role: 'editor' },
    })
    const second = await payload.create({
      collection: 'users',
      data: { email: `second-${email}`, password: 'test', role: 'editor' },
    })

    expect(first.role).toBe('admin')
    expect(second.role).toBe('editor')
  })

  it("doesn't let an editor promote themselves", async () => {
    const editor = await payload.findByID({
      collection: 'users',
      id: (await payload.find({ collection: 'users', where: { role: { equals: 'editor' } } }))
        .docs[0].id,
    })

    const updated = await payload.update({
      collection: 'users',
      id: editor.id,
      data: { role: 'admin' },
      overrideAccess: false,
      user: editor,
    })

    expect(updated.role).toBe('editor')
  })
})
