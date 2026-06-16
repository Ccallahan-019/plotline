import type { Access, CollectionSlug } from 'payload'

import { getRelationId, relationIdsMatch } from '../utilities/relations'
import { isAdmin } from './isAdmin'
import { resolveProfileFromRequest } from './resolveProfileFromRequest'

type OwnerField = 'owner' | 'profile'

export function isOwner(ownerField: OwnerField = 'profile', collection?: CollectionSlug): Access {
  return async ({ data, id, req }) => {
    if (isAdmin({ req })) {
      return true
    }

    const profileId = await resolveProfileFromRequest(req)

    if (profileId === null) {
      return false
    }

    if (data?.[ownerField]) {
      return relationIdsMatch(getRelationId(data[ownerField]), profileId)
    }

    if (id && collection) {
      const doc = await req.payload.findByID({
        collection,
        depth: 0,
        id,
        overrideAccess: true,
      })

      if (!doc) {
        return false
      }

      if (ownerField === 'profile' && 'profile' in doc) {
        return relationIdsMatch(getRelationId(doc.profile), profileId)
      }

      if (ownerField === 'owner' && 'owner' in doc) {
        return relationIdsMatch(getRelationId(doc.owner), profileId)
      }

      return false
    }

    return {
      [ownerField]: {
        equals: profileId,
      },
    }
  }
}
