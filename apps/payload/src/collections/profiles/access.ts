import type { AccessArgs } from 'payload'

import { isAdmin, isServiceRole, resolveProfileFromRequest } from '@/access'
import { relationIdsMatch } from '@/utilities/relations'

export const profilesAccess = {
  create: ({ req }: AccessArgs) => isServiceRole(req) || isAdmin({ req }),
  delete: ({ req }: AccessArgs) => isServiceRole(req) || isAdmin({ req }),
  read: async ({ id, req }: AccessArgs) => {
    if (isAdmin({ req })) {
      return true
    }

    const profileId = await resolveProfileFromRequest(req)

    if (profileId !== null && id !== undefined && relationIdsMatch(id, profileId)) {
      return true
    }

    return false
  },
  update: async ({ id, req }: AccessArgs) => {
    if (isServiceRole(req) || isAdmin({ req })) {
      return true
    }

    const profileId = await resolveProfileFromRequest(req)

    return Boolean(profileId !== null && id !== undefined && relationIdsMatch(id, profileId))
  },
}
