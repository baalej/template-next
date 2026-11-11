import type { CollectionConfig } from 'payload'

import { admins, adminsField, adminsOrSelf, authenticated } from '@/access'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    defaultColumns: ['email', 'role'],
    useAsTitle: 'email',
  },
  auth: true,
  access: {
    // Any logged-in user may open the admin panel; what they can do there is
    // decided per collection.
    admin: authenticated,
    create: admins,
    delete: admins,
    read: adminsOrSelf,
    update: adminsOrSelf,
  },
  hooks: {
    beforeChange: [
      // The first account, made through the admin's "create first user" screen,
      // has to be an admin, or nobody could ever manage users.
      async ({ data, operation, req }) => {
        if (operation !== 'create') return data
        const { totalDocs } = await req.payload.count({ collection: 'users', req })
        if (totalDocs === 0) data.role = 'admin'
        return data
      },
    ],
  },
  fields: [
    // Email and password are added by `auth: true`.
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
      ],
      // In the JWT, so access checks don't need a database lookup.
      saveToJWT: true,
      access: {
        // Otherwise an editor could promote themselves.
        create: adminsField,
        update: adminsField,
      },
      admin: {
        description: 'Admins also manage users. Editors manage content only.',
      },
    },
  ],
}
