import type { WatchlistMembership } from '@plotline/payload-types'

import { getWatchlistMembershipOnListKey } from './build-watchlist-on-list-keys'

export type RemoveFromWatchlistVariables = {
  membershipId: number
  /** `movie:550` style key, or null when the membership media was not populated. */
  onListKey: null | string
  slug: string
  title?: string
}

/**
 * Memberships to show while deletes are still in flight.
 *
 * A refetch started by another write can still include a title whose DELETE
 * has not settled. Those rows stay out of the list. A row with no populated
 * media has no lookup key, so it is left in place.
 *
 * @param memberships - Latest memberships from the detail query
 * @param pendingRemoveKeys - `movie:550` style keys for deletes still in flight on this list
 * @returns `memberships` when no row is pending removal, otherwise the rows still shown
 */
export function omitPendingWatchlistRemoves(
  memberships: readonly WatchlistMembership[],
  pendingRemoveKeys: ReadonlySet<string>,
): WatchlistMembership[] {
  if (pendingRemoveKeys.size === 0) {
    return memberships as WatchlistMembership[]
  }

  const visible = memberships.filter((membership) => {
    const key = getWatchlistMembershipOnListKey(membership)

    return key == null || !pendingRemoveKeys.has(key)
  })

  return visible.length === memberships.length ? (memberships as WatchlistMembership[]) : visible
}

/**
 * Lookup keys that must stay on-list while their delete is still in flight.
 *
 * The detail cache drops the row before the DELETE finishes. Search uses this
 * set so a re-add cannot start until that delete settles. Other watchlists and
 * rows with no populated media are ignored.
 *
 * @param pendingVariables - Variables from in-flight remove mutations
 * @param slug - Watchlist whose pending removes should still count as on the list
 * @returns `movie:550` style keys for this slug
 */
export function onListKeysForPendingRemoves(
  pendingVariables: readonly unknown[],
  slug: string,
): ReadonlySet<string> {
  const keys = new Set<string>()

  for (const variables of pendingVariables) {
    if (!isRemoveFromWatchlistVariables(variables)) {
      continue
    }

    if (variables.slug !== slug || variables.onListKey == null) {
      continue
    }

    keys.add(variables.onListKey)
  }

  return keys
}

// True when `variables` is a remove-from-watchlist mutation payload.
function isRemoveFromWatchlistVariables(
  variables: unknown,
): variables is RemoveFromWatchlistVariables {
  if (typeof variables !== 'object' || variables == null) {
    return false
  }

  const candidate = variables as Partial<RemoveFromWatchlistVariables>

  return (
    typeof candidate.membershipId === 'number' &&
    typeof candidate.slug === 'string' &&
    (candidate.onListKey === null || typeof candidate.onListKey === 'string')
  )
}
