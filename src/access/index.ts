import type { Access, AccessArgs, FieldAccess } from 'payload'

import type { User } from '@/payload-types'

// Reusable access rules. Collections should compose these rather than writing
// inline checks, so who-can-do-what stays readable in one place.
//
// Roles live on the user (see collections/Users.ts) and are saved to the JWT,
// so these checks never hit the database.

export const isAdminUser = (user: unknown): boolean => (user as User | null)?.role === 'admin'

export const anyone: Access = () => true

// Typed as returning a plain boolean so it also fits places that don't take a
// query constraint, such as a collection's `access.admin`.
export const authenticated = ({ req: { user } }: AccessArgs): boolean => Boolean(user)

export const admins = ({ req: { user } }: AccessArgs): boolean => isAdminUser(user)

// Admins see every document; everyone else only their own. Only meaningful on
// the users collection, where a document's id is the user's id.
export const adminsOrSelf: Access = ({ req: { user } }) => {
  if (!user) return false
  if (isAdminUser(user)) return true
  return { id: { equals: user.id } }
}

export const adminsField: FieldAccess = ({ req: { user } }) => isAdminUser(user)
