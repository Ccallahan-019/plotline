import type { Endpoint, PayloadRequest } from 'payload'

import { recalculateWatchlistStatsById } from '@/utilities/recalculateWatchlistStatsById'

import { findOwnedWatchlistBySlug } from './find-owned-watchlist-by-slug'
import { requireProfileContext, requireServiceAuth } from './helpers'
import { readWatchlistSlug } from './watchlist-route-params'

/**
 * Reopens a list-size challenge that finished.
 *
 * `POST /api/watchlists/:slug/reopen-challenge` measures the goal against the
 * titles on the list again, so unfinished titles added after the finish count
 * toward it. A list that is already fully watched keeps its stored finish.
 * Only an owned, enabled list-size challenge that holds a completion can be
 * reopened. Missing and unowned lists are both not found.
 */
export const reopenWatchlistChallengeEndpoint: Endpoint = {
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

    const watchlist = await findOwnedWatchlistBySlug(req, profileResult.profileId, slug)

    if (!watchlist) {
      return Response.json({ error: 'Watchlist not found' }, { status: 404 })
    }

    if (watchlist.challenge?.enabled !== true || watchlist.challenge.goalType !== 'list_size') {
      return Response.json({ error: 'Only a list-size challenge can be reopened' }, { status: 400 })
    }

    if (watchlist.statsCache?.completedAt == null) {
      return Response.json({ error: 'Challenge is not completed' }, { status: 409 })
    }

    await recalculateWatchlistStatsById(req.payload, watchlist.id, req, {
      reopenCompletion: true,
    })

    const reopened = await req.payload.findByID({
      collection: 'watchlists',
      depth: 1,
      id: watchlist.id,
      overrideAccess: true,
      req,
    })

    return Response.json(reopened)
  },
  method: 'post',
  path: '/:slug/reopen-challenge',
}
