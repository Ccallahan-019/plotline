import type { WatchlistMembership } from '@plotline/payload-types'
import type { MediaStatus } from '@plotline/shared/constants'

import { getMembershipLibraryItem } from './membership-media'

/**
 * Reorders memberships to match `orderedIds` and rewrites `sortOrder` to the index.
 *
 * Returns `null` when an id is missing or the lists differ in length, so a
 * partial payload cannot drop a row from the cache.
 *
 * @param memberships - Current membership rows
 * @param orderedIds - Membership ids in the desired order
 * @returns The reordered rows, or `null` when `orderedIds` is not a permutation
 */
export function orderWatchlistMemberships(
  memberships: readonly WatchlistMembership[],
  orderedIds: readonly number[],
): null | WatchlistMembership[] {
  if (memberships.length !== orderedIds.length) {
    return null
  }

  const byId = new Map(memberships.map((membership) => [membership.id, membership]))
  const ordered: WatchlistMembership[] = []

  for (const [index, id] of orderedIds.entries()) {
    const membership = byId.get(id)

    if (!membership) {
      return null
    }

    ordered.push(membership.sortOrder === index ? membership : { ...membership, sortOrder: index })
  }

  return ordered
}

/**
 * Sets the embedded library status on one membership row.
 *
 * The detail badge reads status from the membership query, not the library
 * grid cache. Rows whose library item is only an id are left unchanged.
 *
 * @param memberships - Current membership list
 * @param membershipId - Row to patch
 * @param status - Library status to show
 * @returns A new list with that row's `libraryItem.status` replaced
 */
export function patchMembershipLibraryStatus(
  memberships: readonly WatchlistMembership[],
  membershipId: number,
  status: MediaStatus,
): WatchlistMembership[] {
  return memberships.map((membership) => {
    if (membership.id !== membershipId) {
      return membership
    }

    const libraryItem = getMembershipLibraryItem(membership)

    if (!libraryItem || libraryItem.status === status) {
      return membership
    }

    return {
      ...membership,
      libraryItem: {
        ...libraryItem,
        status,
      },
    }
  })
}

/**
 * Applies newer row data without disturbing an in-progress drag order.
 *
 * Incoming rows replace the current object for the same id, and ids missing
 * from `incoming` are dropped. Other ids that exist only on `incoming` stay
 * out, so a stale refetch cannot put a locally removed title back while a
 * reorder is still saving. Ids in `restoreIds` are the exception: a failed
 * delete already put that row back in the cache, and it is inserted at that
 * cache position.
 *
 * @param current - Rows in the order the user is looking at
 * @param incoming - Latest memberships from the query cache
 * @param restoreIds - Membership ids to put back from `incoming` after a failed delete
 * @returns `current` when nothing changed, otherwise the merged rows
 */
export function reconcilePendingMembershipRows(
  current: readonly WatchlistMembership[],
  incoming: readonly WatchlistMembership[],
  restoreIds?: ReadonlySet<number>,
): WatchlistMembership[] {
  const incomingById = new Map(incoming.map((membership) => [membership.id, membership]))
  const kept = current.flatMap((membership) => {
    const row = incomingById.get(membership.id)

    return row ? [row] : []
  })
  const next = restoreFailedRemovals(kept, incoming, restoreIds)
  const reconciled = withMembershipSortOrder(next)

  if (
    reconciled.length === current.length &&
    reconciled.every((membership, index) => membership === current[index])
  ) {
    return current as WatchlistMembership[]
  }

  return reconciled
}

/**
 * Puts a membership back after a failed delete without reordering other rows.
 *
 * Surviving rows keep their current objects and relative order, so a reorder
 * that happened while the delete was in flight stays. The restored row is
 * inserted before the nearest later snapshot neighbor that is still present,
 * or after the nearest earlier one when those later neighbors are gone.
 *
 * @param current - Rows in the cache when the delete fails
 * @param previous - Rows captured when the delete started
 * @param membershipId - Membership the delete tried to remove
 * @returns The current list with that membership inserted again
 */
export function restoreMembershipAfterFailedRemove(
  current: readonly WatchlistMembership[],
  previous: readonly WatchlistMembership[],
  membershipId: number,
): WatchlistMembership[] {
  if (current.some((membership) => membership.id === membershipId)) {
    return withMembershipSortOrder([...current])
  }

  const removed = previous.find((membership) => membership.id === membershipId)

  if (!removed) {
    return withMembershipSortOrder([...current])
  }

  const previousIds = previous.map((membership) => membership.id)
  const removedIndex = previousIds.indexOf(membershipId)
  const next = [...current]
  let insertAt = next.length

  for (const neighborId of previousIds.slice(removedIndex + 1)) {
    const neighborIndex = next.findIndex((membership) => membership.id === neighborId)

    if (neighborIndex !== -1) {
      insertAt = neighborIndex
      break
    }
  }

  if (insertAt === next.length) {
    for (let index = removedIndex - 1; index >= 0; index -= 1) {
      const neighborId = previousIds[index]

      if (neighborId === undefined) {
        continue
      }

      const neighborIndex = next.findIndex((membership) => membership.id === neighborId)

      if (neighborIndex !== -1) {
        insertAt = neighborIndex + 1
        break
      }
    }
  }

  next.splice(insertAt, 0, removed)

  return withMembershipSortOrder(next)
}

/**
 * Puts the current rows back into the order they had before a reorder.
 *
 * Rows removed from `current` since the snapshot are left out, so a delete
 * that landed during the request is not undone. Rows added since the snapshot
 * are appended. Field updates on surviving rows come from `current`.
 *
 * @param current - Rows in the cache when the reorder fails
 * @param previous - Rows captured when the reorder started
 * @returns Surviving rows in their previous order
 */
export function restoreMembershipOrderAfterReorder(
  current: readonly WatchlistMembership[],
  previous: readonly WatchlistMembership[],
): WatchlistMembership[] {
  const currentById = new Map(current.map((membership) => [membership.id, membership]))
  const previousIds = new Set(previous.map((membership) => membership.id))
  const restored = previous.flatMap((membership) => {
    const row = currentById.get(membership.id)

    return row ? [row] : []
  })
  const addedSince = current.filter((membership) => !previousIds.has(membership.id))

  return withMembershipSortOrder([...restored, ...addedSince])
}

/**
 * True when both lists contain the same membership ids in the same order.
 *
 * @param left - Memberships before a drag
 * @param right - Memberships after a drag
 * @returns `true` when the id sequence is unchanged, so a reorder request can be skipped
 */
export function sameMembershipIdOrder(
  left: readonly { id: number }[],
  right: readonly { id: number }[],
): boolean {
  return left.length === right.length && left.every((item, index) => item.id === right[index]?.id)
}

/**
 * True when every submitted membership id is still in the current list.
 *
 * A reorder saved against a list that lost a row cannot roll the whole
 * snapshot back, and the failure toast would claim an order restore that
 * did not happen.
 *
 * @param current - Rows in the cache when the reorder request fails
 * @param submittedIds - Membership ids the reorder tried to save
 * @returns `false` when a submitted id is already gone; `true` when `current` is missing
 */
export function submittedMembershipIdsStillPresent(
  current: readonly { id: number }[] | undefined,
  submittedIds: readonly number[],
): boolean {
  if (!current) {
    return true
  }

  const currentIds = new Set(current.map((membership) => membership.id))

  return submittedIds.every((id) => currentIds.has(id))
}

/**
 * Rewrites `sortOrder` so it matches each row's index.
 *
 * Rows that already have that index keep their object identity.
 *
 * @param memberships - Memberships already arranged in list order
 * @returns The same sequence with `sortOrder` set to the index
 */
export function withMembershipSortOrder(
  memberships: readonly WatchlistMembership[],
): WatchlistMembership[] {
  return memberships.map((membership, index) =>
    membership.sortOrder === index ? membership : { ...membership, sortOrder: index },
  )
}

/**
 * Inserts failed-delete rows at the position the cache already chose.
 *
 * Rows already in `current` stay put. Each id in `restoreIds` is taken from
 * `incoming` and placed with {@link restoreMembershipAfterFailedRemove}, so
 * the list matches the restored cache without adopting a stale refetch.
 *
 * @param current - Rows kept from the in-progress drag order
 * @param incoming - Cache order, including rows a failed delete put back
 * @param restoreIds - Membership ids a failed delete should show again
 * @returns `current` when there is nothing to restore
 */
function restoreFailedRemovals(
  current: WatchlistMembership[],
  incoming: readonly WatchlistMembership[],
  restoreIds: ReadonlySet<number> | undefined,
): WatchlistMembership[] {
  if (!restoreIds || restoreIds.size === 0) {
    return current
  }

  let next = current

  for (const membership of incoming) {
    if (!restoreIds.has(membership.id) || next.some((row) => row.id === membership.id)) {
      continue
    }

    next = restoreMembershipAfterFailedRemove(next, incoming, membership.id)
  }

  return next
}
