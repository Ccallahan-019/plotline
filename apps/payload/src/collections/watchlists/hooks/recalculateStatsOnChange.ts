import type { CollectionAfterChangeHook } from 'payload'

import { recalculateWatchlistStatsById } from '@/utilities/recalculateWatchlistStatsById'

import { SKIP_WATCHLIST_STATS_RECALC } from '../context'

export const recalculateStatsAfterWatchlistChange: CollectionAfterChangeHook = async ({
  context,
  doc,
  operation,
  previousDoc,
  req,
}) => {
  req.context ??= {}

  if (context[SKIP_WATCHLIST_STATS_RECALC] || req.context[SKIP_WATCHLIST_STATS_RECALC]) {
    return doc
  }

  const challengeChanged =
    JSON.stringify(previousDoc?.challenge ?? null) !== JSON.stringify(doc.challenge ?? null)

  if (operation !== 'update' || !challengeChanged) {
    return doc
  }

  await recalculateWatchlistStatsById(req.payload, doc.id, req)

  return doc
}
