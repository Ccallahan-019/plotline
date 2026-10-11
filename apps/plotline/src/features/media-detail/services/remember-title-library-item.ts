import type { LibraryItem, Media } from '@plotline/payload-types'

import type { MediaTitlePageData } from '../types'

/**
 * Library row to store on the title page after a create, status change, or log.
 *
 * Mutation payloads sometimes return `media` as an id. The hero and log-watch
 * dialog need the catalog document, so a numeric relation is replaced with the
 * title page's media.
 *
 * @param next - Library row from the mutation or the post-log form
 * @param media - Catalog document for this title page
 * @returns The same row with `media` populated when the payload only had an id
 */
export function rememberTitleLibraryItem(next: LibraryItem, media: Media): LibraryItem {
  return {
    ...next,
    media: typeof next.media === 'object' ? next.media : media,
  }
}

/**
 * Title-page cache after a library write.
 *
 * An empty query is left untouched. Otherwise `libraryItem` becomes the logged
 * or created row, which replaces a missing row or an id-0 log-watch placeholder.
 *
 * @param current - Cached title page, when the query has data
 * @param next - Library row from the mutation or the post-log form
 * @param media - Catalog document for this title page
 * @returns The page with `libraryItem` set, or `current` when there is no cache
 */
export function titlePageWithLibraryItem(
  current: MediaTitlePageData | undefined,
  next: LibraryItem,
  media: Media,
): MediaTitlePageData | undefined {
  if (!current) {
    return current
  }

  return {
    ...current,
    libraryItem: rememberTitleLibraryItem(next, media),
  }
}
