import type { Endpoint, PayloadRequest } from 'payload'

import { lockWatchlistMemberships } from '../utilities/lockWatchlistMemberships'
import { recalculateWatchlistStatsById } from '../utilities/recalculateWatchlistStatsById'
import { runInPayloadTransaction } from '../utilities/runInPayloadTransaction'
import { findOwnedWatchlistBySlug } from './find-owned-watchlist-by-slug'
import { requireProfileContext, requireServiceAuth } from './helpers'
import { readMembershipId, readWatchlistSlug } from './watchlist-route-params'

/**
 * Removes one membership from an owned watchlist.
 *
 * `DELETE /api/watchlists/:slug/memberships/:membershipId` does not delete the
 * library item. Membership `afterChange` does not run on delete, so watchlist
 * stats are recalculated in the same transaction after the row is gone.
 *
 * The path is relative to the `watchlists` collection. A root path starting
 * with `/watchlists` is never reached, because Payload routes that prefix to
 * the collection's own endpoints.
 */
export const removeWatchlistMembershipEndpoint: Endpoint = {
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

    const membershipId = readMembershipId(req)

    if (membershipId === null) {
      return Response.json({ error: 'Membership id is required' }, { status: 400 })
    }

    const watchlist = await findOwnedWatchlistBySlug(req, profileResult.profileId, slug)

    if (!watchlist) {
      return Response.json({ error: 'Watchlist not found' }, { status: 404 })
    }

    const memberships = await req.payload.find({
      collection: 'watchlist-memberships',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      req,
      where: {
        and: [{ id: { equals: membershipId } }, { watchlist: { equals: watchlist.id } }],
      },
    })

    if (!memberships.docs[0]) {
      return Response.json({ error: 'Membership not found' }, { status: 404 })
    }

    await runInPayloadTransaction(req, async () => {
      // Waits for an in-flight reorder, which has already validated the id list it is writing.
      await lockWatchlistMemberships(req, watchlist.id)

      await req.payload.delete({
        collection: 'watchlist-memberships',
        id: membershipId,
        overrideAccess: true,
        req,
      })

      await recalculateWatchlistStatsById(req.payload, watchlist.id, req)
    })

    return Response.json({ id: membershipId })
  },
  method: 'delete',
  path: '/:slug/memberships/:membershipId',
}
