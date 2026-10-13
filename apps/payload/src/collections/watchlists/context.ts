/** When set, skips watchlist stats recalculation to avoid hook loops. */
export const SKIP_WATCHLIST_STATS_RECALC = 'skipWatchlistStatsRecalc'

/** When set, skips membership sync from library-item changes. */
export const SKIP_MEMBERSHIP_SYNC_FROM_LIBRARY = 'skipMembershipSyncFromLibrary'

/**
 * Removes skip flags after the writes they were meant to cover.
 *
 * Payload copies an operation's `context` onto `req.context` for the rest of the
 * request. Leaving these set would also skip the stats recalculation that follows.
 *
 * @param context - Request context the nested writes merged into
 */
export function clearWatchlistSyncSkipFlags(
  context: null | Record<string, unknown> | undefined,
): void {
  if (!context) {
    return
  }

  delete context[SKIP_MEMBERSHIP_SYNC_FROM_LIBRARY]
  delete context[SKIP_WATCHLIST_STATS_RECALC]
}
