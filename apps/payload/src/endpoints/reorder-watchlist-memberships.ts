import type { Endpoint, PayloadRequest } from 'payload'

import { lockWatchlistMemberships } from '../utilities/lockWatchlistMemberships'
import { runInPayloadTransaction } from '../utilities/runInPayloadTransaction'
import { setWatchlistMembershipOrder } from '../utilities/setWatchlistMembershipOrder'
import { findOwnedWatchlistBySlug } from './find-owned-watchlist-by-slug'
import { parseJsonBody, requireProfileContext, requireServiceAuth } from './helpers'
import { readWatchlistSlug } from './watchlist-route-params'

type ReorderBody = {
  membershipIds?: unknown
}

/**
 * Rewrites `sortOrder` for every membership on one owned watchlist.
 *
 * `PATCH /api/watchlists/:slug/memberships/reorder` takes the full id list in
 * the new order and stores `0..n-1`. A partial list is rejected so a stale
 * client cannot drop a title. Stats are not recalculated: order does not
 * change challenge progress, so the write is one statement that skips the
 * collection hooks.
 *
 * The id list is checked and written under the watchlist's membership lock in
 * one transaction. A concurrent add or remove waits instead of slipping in
 * between, so it cannot leave a duplicate `sortOrder` or a missing row.
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

    const matches = await runInPayloadTransaction(req, async () => {
      await lockWatchlistMemberships(req, watchlist.id)

      const existingIds = await loadMembershipIds(req, watchlist.id)

      if (!membershipIdsMatchWatchlist(existingIds, membershipIds)) {
        return false
      }

      await setWatchlistMembershipOrder(req, watchlist.id, membershipIds)

      return true
    })

    if (!matches) {
      return Response.json(
        { error: 'membershipIds must list every title on this watchlist once' },
        { status: 409 },
      )
    }

    return Response.json({ membershipIds })
  },
  method: 'patch',
  path: '/:slug/memberships/reorder',
}

// Every membership id on the watchlist. `pagination: false` loads all rows, so a long list is not truncated.
async function loadMembershipIds(req: PayloadRequest, watchlistId: number): Promise<number[]> {
  const result = await req.payload.find({
    collection: 'watchlist-memberships',
    depth: 0,
    limit: 0,
    overrideAccess: true,
    pagination: false,
    req,
    where: {
      watchlist: {
        equals: watchlistId,
      },
    },
  })

  return result.docs.map((membership) => membership.id)
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
      return Response.json({ error: 'membershipIds must be positive integers' }, { status: 400 })
    }

    ids.push(entry)
  }

  if (new Set(ids).size !== ids.length) {
    return Response.json({ error: 'membershipIds must be unique' }, { status: 400 })
  }

  return ids
}
