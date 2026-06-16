import type { Endpoint, PayloadRequest } from 'payload'

import { recalculateWatchlistStatsById } from '@/utilities/recalculateWatchlistStatsById'

import { getRelationId, relationIdsMatch } from '../utilities/relations'
import { parseId, requireProfileContext, requireServiceAuth } from './helpers'

export const recalculateWatchlistStatsEndpoint: Endpoint = {
  handler: async (req: PayloadRequest) => {
    const unauthorized = await requireServiceAuth(req)

    if (unauthorized) {
      return unauthorized
    }

    const profileResult = await requireProfileContext(req)

    if (profileResult instanceof Response) {
      return profileResult
    }

    const watchlistId = parseId(req.routeParams?.id as number | string | undefined)

    if (watchlistId === null) {
      return Response.json({ error: 'Watchlist id is required' }, { status: 400 })
    }

    const watchlist = await req.payload.findByID({
      collection: 'watchlists',
      depth: 0,
      id: watchlistId,
      overrideAccess: true,
    })

    if (!watchlist) {
      return Response.json({ error: 'Watchlist not found' }, { status: 404 })
    }

    if (!relationIdsMatch(getRelationId(watchlist.owner), profileResult.profileId)) {
      return Response.json({ error: 'Watchlist not found' }, { status: 404 })
    }

    await recalculateWatchlistStatsById(req.payload, watchlistId, req)

    const updated = await req.payload.findByID({
      collection: 'watchlists',
      depth: 0,
      id: watchlistId,
      overrideAccess: true,
    })

    return Response.json({
      statsCache: updated?.statsCache ?? null,
      watchlist: updated,
    })
  },
  method: 'post',
  path: '/watchlists/:id/recalculate-stats',
}
