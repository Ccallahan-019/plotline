import type { WatchlistMembership } from '@plotline/payload-types'

import { getLibraryItemLookupKey } from '@/features/search/services/build-library-item-lookup'

import { getMembershipMedia } from './membership-media'

/**
 * Lookup keys for titles already on a watchlist.
 *
 * Detail memberships are loaded with `libraryItem.media` populated. A row whose
 * media is only an id is skipped, so it cannot disable a search result.
 * `pendingRemoveKeys` are included even though those rows are already gone from
 * the cache: the delete has not settled, and a re-add would race it.
 *
 * @param memberships - Memberships from the watchlist detail query
 * @param pendingRemoveKeys - Lookup keys for deletes still in flight on this list
 * @returns `movie:550` style keys for the title-search dialog
 */
export function buildWatchlistOnListKeys(
  memberships: readonly WatchlistMembership[],
  pendingRemoveKeys?: ReadonlySet<string>,
): ReadonlySet<string> {
  const keys = new Set<string>(pendingRemoveKeys)

  for (const membership of memberships) {
    const key = getWatchlistMembershipOnListKey(membership)

    if (key == null) {
      continue
    }

    keys.add(key)
  }

  return keys
}

/**
 * Lookup key for one membership, when its media was populated.
 *
 * @param membership - Membership row from the detail query
 * @returns A `movie:550` style key, or null when media is only an id
 */
export function getWatchlistMembershipOnListKey(membership: WatchlistMembership): null | string {
  const media = getMembershipMedia(membership)

  if (media?.tmdbId == null) {
    return null
  }

  return getLibraryItemLookupKey(media.mediaType, media.tmdbId)
}
