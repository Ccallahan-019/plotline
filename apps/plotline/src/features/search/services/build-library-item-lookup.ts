import type { LibraryItem } from '@plotline/payload-types'
import type { MediaType } from '@plotline/shared/constants/media'

import type { MediaDisplay } from '@/features/media-grid/types'

import { getMediaFromLibraryItem } from '../../library/services/get-media-from-library-item'

export function buildLibraryItemLookupByTmdb(items: LibraryItem[]): Map<string, LibraryItem> {
  const lookup = new Map<string, LibraryItem>()

  for (const item of items) {
    const media = getMediaFromLibraryItem(item)

    if (!media?.tmdbId) {
      continue
    }

    lookup.set(getLibraryItemLookupKey(media.mediaType, media.tmdbId), item)
  }

  return lookup
}

export function getLibraryItemForMediaDisplay(
  lookup: Map<string, LibraryItem>,
  media: MediaDisplay,
): LibraryItem | undefined {
  if (media.tmdbId === undefined) {
    return undefined
  }

  return lookup.get(getLibraryItemLookupKey(media.mediaType, media.tmdbId))
}

export function getLibraryItemLookupKey(mediaType: MediaType, tmdbId: number): string {
  return `${mediaType}:${tmdbId}`
}
