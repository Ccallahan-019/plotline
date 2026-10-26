import type { Watchlist } from '@plotline/payload-types'
import type { CollectionAfterChangeHook } from 'payload'

import { recalculateWatchlistStatsById } from '@/utilities/recalculateWatchlistStatsById'

import { SKIP_WATCHLIST_STATS_RECALC } from '../context'
import { syncMembershipsForChallengeChange } from './syncMembershipsForChallengeChange'

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

  await syncMembershipsForChallengeChange(req, doc)
  await recalculateWatchlistStatsById(req.payload, doc.id, req, {
    resetCompletion: qualifyingRulesChanged(previousDoc?.challenge, doc.challenge),
  })

  return doc
}

// A list-size finish was measured against the titles that qualified then, so a rule that
// changes which titles qualify makes the stored latch stale.
function qualifyingRulesChanged(
  previous: undefined | Watchlist['challenge'],
  next: undefined | Watchlist['challenge'],
): boolean {
  return (
    previous?.includeRewatches !== next?.includeRewatches ||
    previous?.priorCompletionRule !== next?.priorCompletionRule ||
    previous?.tvCountRule !== next?.tvCountRule
  )
}
