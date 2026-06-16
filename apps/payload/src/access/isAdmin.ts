import type { PayloadRequest } from 'payload'

import type { User } from '@/payload-types'

export function isAdmin({ req }: { req: PayloadRequest }): boolean {
  const user = req.user as null | User

  if (!user || user.collection !== 'users') {
    return false
  }

  const roles = user.roles

  return Array.isArray(roles) && roles.includes('admin')
}
