import type { ContinueWatchingItem } from './continue-watching'

const UP_NEXT_LIMIT = 6

/**
 * Posters for the overview Up next row.
 *
 * Most recently watched comes first. A missing `lastWatchedAt` sorts last.
 * This does not promote the stalled continue-watching hero ahead of newer titles.
 *
 * @param items - Watching rows from `toContinueWatchingItems`, in any order
 * @returns At most five rows, newest watch first
 */
export function selectUpNextItems(items: readonly ContinueWatchingItem[]): ContinueWatchingItem[] {
  return [...items].sort(compareRecentlyWatched).slice(0, UP_NEXT_LIMIT)
}

// Newer watches first. Missing timestamps sort after any real watch time.
function compareRecentlyWatched(left: ContinueWatchingItem, right: ContinueWatchingItem): number {
  const leftTime = watchedAtTime(left.lastWatchedAt)
  const rightTime = watchedAtTime(right.lastWatchedAt)

  if (leftTime == null && rightTime == null) {
    return 0
  }

  if (leftTime == null) {
    return 1
  }

  if (rightTime == null) {
    return -1
  }

  return rightTime - leftTime
}

// Epoch milliseconds, or null when the timestamp is missing or invalid.
function watchedAtTime(value: null | string): null | number {
  if (!value) {
    return null
  }

  const time = Date.parse(value)

  return Number.isNaN(time) ? null : time
}
