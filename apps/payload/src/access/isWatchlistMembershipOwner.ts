import type { Access } from 'payload'

import { getRelationId, relationIdsMatch } from '../utilities/relations'
import { isAdmin } from './isAdmin'
import { resolveProfileFromRequest } from './resolveProfileFromRequest'

export const isWatchlistMembershipOwner: Access = async ({ data, id, req }) => {
  if (isAdmin({ req })) {
    return true
  }

  const profileId = await resolveProfileFromRequest(req)

  if (profileId === null) {
    return false
  }

  const watchlistId = getRelationId(data?.watchlist)

  if (watchlistId !== null) {
    const watchlist = await req.payload.findByID({
      collection: 'watchlists',
      depth: 0,
      id: watchlistId,
      overrideAccess: true,
    })

    if (!watchlist) {
      return false
    }

    return relationIdsMatch(getRelationId(watchlist.owner), profileId)
  }

  if (id) {
    const membership =
      (await req.payload.findByID({
        collection: 'watchlist-memberships',
        depth: 0,
        id,
        overrideAccess: true,
      })) ?? {}

    const resolvedWatchlistId = getRelationId(membership.watchlist)

    if (resolvedWatchlistId === null) {
      return false
    }

    const watchlist =
      (await req.payload.findByID({
        collection: 'watchlists',
        depth: 0,
        id: resolvedWatchlistId,
        overrideAccess: true,
      })) ?? {}

    return relationIdsMatch(getRelationId(watchlist.owner), profileId)
  }

  return false
}
