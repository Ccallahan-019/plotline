import type { LibraryItem, Media } from '@plotline/payload-types'

/**
 * Stand-in library row for logging a watch on a title the viewer has not added yet.
 *
 * The log-watch endpoint creates the real row on submit, so cancelling the dialog
 * leaves the library untouched. The `0` id keeps watched-episode lookups off.
 *
 * @param media - Catalog row for the title page
 * @returns A planned, empty library item whose `media` is the catalog document
 */
export function buildPlaceholderLibraryItem(media: Media): LibraryItem {
  const now = new Date().toISOString()

  return {
    createdAt: now,
    id: 0,
    media,
    profile: 0,
    progress: { type: media.mediaType },
    status: 'planned',
    updatedAt: now,
  }
}
