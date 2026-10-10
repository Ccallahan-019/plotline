import type { CollectionBeforeValidateHook, PayloadRequest } from 'payload'

import { lockWatchlistMemberships } from '../../../utilities/lockWatchlistMemberships'
import { getRelationId } from '../../../utilities/relations'
import { setWatchlistMembershipOrder } from '../../../utilities/setWatchlistMembershipOrder'

/**
 * Assigns the next `sortOrder` when a membership is created without one.
 *
 * New titles append after every membership already on the watchlist. Ascending
 * `sortOrder` places nulls last, so legacy null rows would otherwise stay
 * behind a new `0`. Those rows are numbered in their current order (`addedAt`,
 * then `id`), continuing after the highest existing value, and the new row
 * takes the following value. An explicit `sortOrder`, including `0`, is left
 * alone.
 *
 * The read-then-insert runs under the watchlist's membership lock, which is
 * held until the surrounding transaction commits. A concurrent add to the same
 * watchlist waits for it and then sees the new row, so two adds cannot take
 * the same value.
 */
export const initializeMembershipSortOrder: CollectionBeforeValidateHook = async ({
  data,
  operation,
  req,
}) => {
  if (operation !== 'create' || !data) {
    return data
  }

  if (typeof data.sortOrder === 'number' && Number.isFinite(data.sortOrder)) {
    return data
  }

  const watchlistId = getRelationId(data.watchlist)

  if (watchlistId == null) {
    return data
  }

  await lockWatchlistMemberships(req, watchlistId)

  const [highestSortOrder, unorderedIds] = await Promise.all([
    findHighestSortOrder(req, watchlistId),
    findUnorderedMembershipIds(req, watchlistId),
  ])
  const start = highestSortOrder == null ? 0 : highestSortOrder + 1

  await setWatchlistMembershipOrder(req, watchlistId, unorderedIds, start)

  return {
    ...data,
    sortOrder: start + unorderedIds.length,
  }
}

// Highest finite `sortOrder` on the watchlist. Nulls are excluded so they do not win a descending sort.
async function findHighestSortOrder(
  req: PayloadRequest,
  watchlistId: number | string,
): Promise<null | number> {
  const existing = await req.payload.find({
    collection: 'watchlist-memberships',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    req,
    sort: '-sortOrder',
    where: {
      and: [{ watchlist: { equals: watchlistId } }, { sortOrder: { exists: true } }],
    },
  })
  const currentMax = existing.docs[0]?.sortOrder

  return typeof currentMax === 'number' && Number.isFinite(currentMax) ? currentMax : null
}

// Membership ids whose `sortOrder` is null, in the order they already appear (`addedAt`, then `id`).
async function findUnorderedMembershipIds(
  req: PayloadRequest,
  watchlistId: number | string,
): Promise<number[]> {
  const result = await req.payload.find({
    collection: 'watchlist-memberships',
    depth: 0,
    limit: 0,
    overrideAccess: true,
    pagination: false,
    req,
    sort: 'addedAt,id',
    where: {
      and: [{ watchlist: { equals: watchlistId } }, { sortOrder: { exists: false } }],
    },
  })

  return result.docs.map((membership) => membership.id)
}
