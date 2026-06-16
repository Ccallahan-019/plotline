import type { AccessArgs } from 'payload'

import { hasAdminRole } from '@/access'
import { User } from '@/payload-types'

export const usersAccess = {
  create: ({ req }: AccessArgs) => hasAdminRole(req.user as null | User),
  delete: ({ req }: AccessArgs) => hasAdminRole(req.user as null | User),
  read: ({ req }: AccessArgs) => hasAdminRole(req.user as null | User),
  update: ({ req }: AccessArgs) => hasAdminRole(req.user as null | User),
}
