import type { LibraryItem, Media, WatchlistMembership } from '@plotline/payload-types'

import type { MediaDisplay } from '@/features/media-grid/types'

import { toMediaDisplayFromMedia } from '@/features/media-grid/grid/services/media-display-helpers'

/**
 * Library item embedded on a membership, when the query populated it.
 *
 * @param membership - Membership row from the detail query
 * @returns The library item, or `null` when the relation is only an id
 */
export function getMembershipLibraryItem(membership: WatchlistMembership): LibraryItem | null {
  const libraryItem = membership.libraryItem

  return typeof libraryItem === 'object' && libraryItem != null ? libraryItem : null
}

/**
 * Media embedded on a membership's library item.
 *
 * @param membership - Membership row from the detail query
 * @returns The media document, or `null` when media was not populated
 */
export function getMembershipMedia(membership: WatchlistMembership): Media | null {
  const libraryItem = getMembershipLibraryItem(membership)

  if (!libraryItem) {
    return null
  }

  return typeof libraryItem.media === 'object' && libraryItem.media != null
    ? libraryItem.media
    : null
}

/**
 * Card fields for a membership title, including the TMDB id the title route needs.
 *
 * `toMediaDisplayFromMedia` omits `tmdbId`, and title links fall back to the library
 * without it.
 *
 * @param media - Populated media for the membership
 * @returns Display fields for grid cards and title links
 */
export function toMembershipMediaDisplay(media: Media): MediaDisplay {
  return {
    ...toMediaDisplayFromMedia(media),
    tmdbId: media.tmdbId,
  }
}
