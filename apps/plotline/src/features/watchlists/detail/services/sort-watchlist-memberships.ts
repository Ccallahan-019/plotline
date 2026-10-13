import type { WatchlistMembership } from '@plotline/payload-types'

import { DEFAULT_WATCHLIST_MEMBERSHIP_SORT, type WatchlistMembershipSort } from '../types'
import { getMembershipMedia } from './membership-media'

/**
 * Returns a new array of memberships in the requested display order.
 *
 * Manual order follows `sortOrder`, then `addedAt`, then `id`. Missing
 * `sortOrder` values sort last, matching the list the server already returns.
 * The other modes are display-only and do not rewrite `sortOrder`. Title sorts
 * are case-insensitive. Missing titles and release dates sort last. Ties fall
 * back to title, then id, except manual order, which uses `addedAt`, then id.
 *
 * @param memberships - Rows to sort. This array is not modified
 * @param sort - Sort mode. Defaults to manual order
 * @returns A new sorted array
 */
export function sortWatchlistMemberships(
  memberships: readonly WatchlistMembership[],
  sort: WatchlistMembershipSort = DEFAULT_WATCHLIST_MEMBERSHIP_SORT,
): WatchlistMembership[] {
  return [...memberships].sort((left, right) => compareMemberships(left, right, sort))
}

// Descending string order. Empty values sort after values that are present.
function compareDescMissingLast(left: null | string, right: null | string): number {
  if (left == null && right == null) {
    return 0
  }

  if (left == null) {
    return 1
  }

  if (right == null) {
    return -1
  }

  return right.localeCompare(left)
}

// Manual list order: `sortOrder`, then `addedAt`, then id. Missing `sortOrder` is last.
function compareManual(left: WatchlistMembership, right: WatchlistMembership): number {
  return (
    compareSortOrder(left.sortOrder, right.sortOrder) ||
    left.addedAt.localeCompare(right.addedAt) ||
    left.id - right.id
  )
}

// Sort comparator for one membership sort mode.
function compareMemberships(
  left: WatchlistMembership,
  right: WatchlistMembership,
  sort: WatchlistMembershipSort,
): number {
  switch (sort) {
    case 'manual':
      return compareManual(left, right)
    case 'recently-added':
      return right.addedAt.localeCompare(left.addedAt) || compareTitles(left, right, 'asc')
    case 'release-date':
      return (
        compareDescMissingLast(membershipReleaseDate(left), membershipReleaseDate(right)) ||
        compareTitles(left, right, 'asc')
      )
    case 'title-asc':
      return compareTitles(left, right, 'asc')
    case 'title-desc':
      return compareTitles(left, right, 'desc')
    default: {
      const exhaustive: never = sort
      return exhaustive
    }
  }
}

// Ascending `sortOrder`. Null and non-finite values sort last.
function compareSortOrder(
  left: null | number | undefined,
  right: null | number | undefined,
): number {
  const leftOrder = finiteSortOrder(left)
  const rightOrder = finiteSortOrder(right)

  if (leftOrder == null && rightOrder == null) {
    return 0
  }

  if (leftOrder == null) {
    return 1
  }

  if (rightOrder == null) {
    return -1
  }

  return leftOrder - rightOrder
}

// Case-insensitive title order. Missing titles sort last. Id breaks ties.
function compareTitles(
  left: WatchlistMembership,
  right: WatchlistMembership,
  direction: 'asc' | 'desc',
): number {
  const leftTitle = membershipTitle(left)
  const rightTitle = membershipTitle(right)

  if (leftTitle == null && rightTitle == null) {
    return left.id - right.id
  }

  if (leftTitle == null) {
    return 1
  }

  if (rightTitle == null) {
    return -1
  }

  const byTitle = leftTitle.localeCompare(rightTitle, 'en', { sensitivity: 'base' })
  const directed = direction === 'asc' ? byTitle : -byTitle

  return directed || left.id - right.id
}

// Finite `sortOrder`, or `null` when the row has not been placed.
function finiteSortOrder(value: null | number | undefined): null | number {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

// Trimmed release date, or `null` when media or the date is missing.
function membershipReleaseDate(membership: WatchlistMembership): null | string {
  const releaseDate = getMembershipMedia(membership)?.releaseDate?.trim()

  return releaseDate ? releaseDate : null
}

// Trimmed media title, or `null` when the row has no title to show.
function membershipTitle(membership: WatchlistMembership): null | string {
  const title = getMembershipMedia(membership)?.title.trim()

  return title ? title : null
}
