import type { AccessArgs } from 'payload'

import { isAdmin } from '@/access'
import { isServiceRole } from '@/access'

export const mediaAccess = {
  create: ({ req }: AccessArgs) => isServiceRole(req) || isAdmin({ req }),
  delete: ({ req }: AccessArgs) => isAdmin({ req }),
  read: () => true,
  update: ({ req }: AccessArgs) => isServiceRole(req) || isAdmin({ req }),
}
