import type { AccessArgs } from 'payload'

import { isAdmin, resolveProfileFromRequest } from '@/access'
import { relationIdsMatch } from '@/utilities/relations'

async function readOwnProfile({ id, req }: AccessArgs) {
  if (isAdmin({ req })) {
    return true
  }

  const profileId = await resolveProfileFromRequest(req)

  if (profileId === null) {
    return false
  }

  if (id !== undefined) {
    return relationIdsMatch(id, profileId)
  }

  return {
    id: {
      equals: profileId,
    },
  }
}

export const profilesAccess = {
  create: ({ req }: AccessArgs) => isAdmin({ req }),
  delete: ({ req }: AccessArgs) => isAdmin({ req }),
  read: readOwnProfile,
  update: async ({ id, req }: AccessArgs) => {
    if (isAdmin({ req })) {
      return true
    }

    const profileId = await resolveProfileFromRequest(req)

    return Boolean(profileId !== null && id !== undefined && relationIdsMatch(id, profileId))
  },
}
