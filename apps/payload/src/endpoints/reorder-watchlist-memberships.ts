import type { Endpoint, PayloadRequest } from 'payload'

import { SKIP_WATCHLIST_STATS_RECALC } from '../collections/watchlists/context'
import { runInPayloadTransaction } from '../utilities/runInPayloadTransaction'
import { findOwnedWatchlistBySlug } from './find-owned-watchlist-by-slug'
import { parseJsonBody, requireProfileContext, requireServiceAuth } from './helpers'
import { readWatchlistSlug } from './watchlist-route-params'

const MAX_MEMBERSHIP_PAGES = 100
const MEMBERSHIP_PAGE_SIZE = 100

type ReorderBody = {
  membershipIds?: unknown
}

/**
 * Rewrites `sortOrder` for every membership on one owned watchlist.
 *
 * `PATCH /api/watchlists/:slug/memberships/reorder` takes the full id list in
 * the new order and stores `0..n-1`. A partial list is rejected so a stale
 * client cannot drop a title. Stats are not recalculated: order does not
 * change challenge progress, and each update would otherwise recompute it.
 *
 * The path is relative to the `watchlists` collection. Payload only searches
 * root endpoints when the first URL segment is not a collection slug, so a
 * root path of `/watchlists/...` never matches.
 */
export const reorderWatchlistMembershipsEndpoint: Endpoint = {
  handler: async (req: PayloadRequest) => {
    const unauthorized = await requireServiceAuth(req)

    if (unauthorized) {
      return unauthorized
    }

    const profileResult = await requireProfileContext(req)

    if (profileResult instanceof Response) {
      return profileResult
    }

    const slug = readWatchlistSlug(req)

    if (!slug) {
      return Response.json({ error: 'Watchlist slug is required' }, { status: 400 })
    }

    const body = await parseJsonBody<ReorderBody>(req)

    if (body instanceof Response) {
      return body
    }

    const membershipIds = parseMembershipIds(body.membershipIds)

    if (membershipIds instanceof Response) {
      return membershipIds
    }

    const watchlist = await findOwnedWatchlistBySlug(req, profileResult.profileId, slug)

    if (!watchlist) {
      return Response.json({ error: 'Watchlist not found' }, { status: 404 })
    }

    const existingIds = await loadMembershipIds(req, watchlist.id)

    if (!membershipIdsMatchWatchlist(existingIds, membershipIds)) {
      return Response.json(
        { error: 'membershipIds must list every title on this watchlist once' },
        { status: 409 },
      )
    }

    await runInPayloadTransaction(req, async () => {
      for (const [index, membershipId] of membershipIds.entries()) {
        await req.payload.update({
          collection: 'watchlist-memberships',
          context: {
            [SKIP_WATCHLIST_STATS_RECALC]: true,
          },
          data: {
            sortOrder: index,
          },
          depth: 0,
          id: membershipId,
          overrideAccess: true,
          req,
        })
      }
    })

    return Response.json({ membershipIds })
  },
  method: 'patch',
  path: '/:slug/memberships/reorder',
}

// Every membership id on the watchlist, paging so a long list is not truncated.
async function loadMembershipIds(req: PayloadRequest, watchlistId: number): Promise<number[]> {
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
      sort: 'id',
      where: {
        watchlist: {
          equals: watchlistId,
        },
      },
    })

    ids.push(...result.docs.map((membership) => membership.id))

    if (!result.hasNextPage) {
      return ids
    }

    const nextPage = result.nextPage ?? page + 1

    if (nextPage <= page) {
      throw new Error('Membership page did not advance')
    }

    page = nextPage
  }

  throw new Error('Membership page limit exceeded')
}

// True when `requestedIds` is a permutation of the watchlist's membership ids.
function membershipIdsMatchWatchlist(
  existingIds: readonly number[],
  requestedIds: readonly number[],
): boolean {
  if (existingIds.length !== requestedIds.length) {
    return false
  }

  const existing = new Set(existingIds)

  if (existing.size !== requestedIds.length) {
    return false
  }

  return requestedIds.every((id) => existing.has(id))
}

// Positive unique integers, in the order the client wants saved.
function parseMembershipIds(value: unknown): number[] | Response {
  if (!Array.isArray(value)) {
    return Response.json({ error: 'membershipIds must be an array' }, { status: 400 })
  }

  const ids: number[] = []

  for (const entry of value) {
    if (typeof entry !== 'number' || !Number.isInteger(entry) || entry < 1) {
      return Response.json(
        { error: 'membershipIds must be positive integers' },
        { status: 400 },
      )
    }

    ids.push(entry)
  }

  if (new Set(ids).size !== ids.length) {
    return Response.json({ error: 'membershipIds must be unique' }, { status: 400 })
  }

  return ids
}
