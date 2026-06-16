import type { CollectionAfterChangeHook } from 'payload'

import { recalculateWatchlistStatsById } from '@/utilities/recalculateWatchlistStatsById'

import { getRelationId } from '../../../utilities/relations'
import { SKIP_WATCHLIST_STATS_RECALC } from '../../watchlists/context'

export const recalculateStatsAfterMembershipChange: CollectionAfterChangeHook = async ({
  context,
  doc,
  req,
}) => {
  req.context ??= {}

  if (context[SKIP_WATCHLIST_STATS_RECALC] || req.context[SKIP_WATCHLIST_STATS_RECALC]) {
    return doc
  }

  const watchlistId = getRelationId(doc.watchlist)

  if (watchlistId != null) {
    await recalculateWatchlistStatsById(req.payload, watchlistId, req)
  }

  return doc
}
