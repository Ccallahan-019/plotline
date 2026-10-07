import type { CollectionBeforeValidateHook, PayloadRequest } from 'payload'

import { getRelationId } from '../../../utilities/relations'
import { SKIP_WATCHLIST_STATS_RECALC } from '../../watchlists/context'

const MAX_MEMBERSHIP_PAGES = 100
const MEMBERSHIP_PAGE_SIZE = 100

/**
 * Assigns the next `sortOrder` when a membership is created without one.
 *
 * New titles append after every membership already on the watchlist. Ascending
 * `sortOrder` places nulls last, so legacy null rows would otherwise stay
 * behind a new `0`. Those rows are numbered in their current order (`addedAt`,
 * then `id`), continuing after the highest existing value, and the new row
 * takes the following value. An explicit `sortOrder`, including `0`, is left
 * alone.
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

  const [highestSortOrder, unorderedIds] = await Promise.all([
    findHighestSortOrder(req, watchlistId),
    findUnorderedMembershipIds(req, watchlistId),
  ])
  const start = highestSortOrder == null ? 0 : highestSortOrder + 1

  await numberUnorderedMemberships(req, unorderedIds, start)

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
  const ids: number[] = []
  let page = 1

  while (page <= MAX_MEMBERSHIP_PAGES) {
    const result = await req.payload.find({
      collection: 'watchlist-memberships',
      depth: 0,
      limit: MEMBERSHIP_PAGE_SIZE,
      overrideAccess: true,
      page,
      req,
      sort: 'addedAt,id',
      where: {
        and: [{ watchlist: { equals: watchlistId } }, { sortOrder: { exists: false } }],
      },
    })

    ids.push(...result.docs.map((membership) => membership.id))

    if (!result.hasNextPage) {
      return ids
    }

    const nextPage = result.nextPage ?? page + 1

    if (nextPage <= page) {
      throw new Error('Unordered membership page did not advance')
    }

    page = nextPage
  }

  throw new Error('Unordered membership page limit exceeded')
}

/**
 * Writes `sortOrder` onto legacy null rows.
 *
 * Stats stay unchanged because order is not challenge progress. The skip flag
 * is removed afterward unless the caller already set it: Payload copies update
 * context onto `req.context`, which would also skip stats for the membership
 * being created.
 */
async function numberUnorderedMemberships(
  req: PayloadRequest,
  membershipIds: readonly number[],
  start: number,
): Promise<void> {
  if (membershipIds.length === 0) {
    return
  }

  const skipWasSet = req.context?.[SKIP_WATCHLIST_STATS_RECALC] === true

  try {
    for (const [index, membershipId] of membershipIds.entries()) {
      await req.payload.update({
        collection: 'watchlist-memberships',
        context: {
          [SKIP_WATCHLIST_STATS_RECALC]: true,
        },
        data: {
          sortOrder: start + index,
        },
        depth: 0,
        id: membershipId,
        overrideAccess: true,
        req,
      })
    }
  } finally {
    if (!skipWasSet && req.context) {
      delete req.context[SKIP_WATCHLIST_STATS_RECALC]
    }
  }
}
