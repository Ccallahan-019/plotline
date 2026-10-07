import type { LibraryItem } from '@plotline/payload-types'

import { getMediaFromLibraryItem } from './get-media-from-library-item'

/**
 * Media title for toast copy.
 *
 * @param item - Library item, when one is loaded
 * @returns The populated media title, or `undefined` when the item is missing or its media is an id-only relation
 */
export function getLibraryItemTitle(item: LibraryItem | undefined): string | undefined {
  if (!item) {
    return undefined
  }

  return getMediaFromLibraryItem(item)?.title
}
