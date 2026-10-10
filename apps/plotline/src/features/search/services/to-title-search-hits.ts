import type { TmdbSearchResultItem } from '@plotline/shared/tmdb'

import type { AddToListTmdbMediaInput } from '@/features/library/types/mutations'
import type { MediaDisplay } from '@/features/media-grid/types'

import { toAddToListTmdbMediaInput } from '@/features/library/add-to-list/services/to-add-to-list-media-input'
import { toMediaDisplayFromTmdbResult } from '@/features/media-grid/grid/services/media-display-helpers'
import { getLibraryItemLookupKey } from '@/features/search/services/build-library-item-lookup'

export type TitleSearchHit = {
  display: MediaDisplay
  key: string
  media: AddToListTmdbMediaInput
}

/**
 * Maps TMDB search hits into dialog rows and add payloads.
 *
 * Drops results that are not a movie or series. `key` matches library lookup
 * (`movie:550`).
 *
 * @param results - TMDB results already tagged with `media_type`
 * @returns Hits that can be rendered and submitted
 */
export function toTitleSearchHits(results: readonly TmdbSearchResultItem[]): TitleSearchHit[] {
  return results.flatMap((result) => {
    const display = toMediaDisplayFromTmdbResult(result)

    if (display?.tmdbId == null) {
      return []
    }

    return [
      {
        display,
        key: getLibraryItemLookupKey(display.mediaType, display.tmdbId),
        media: toAddToListTmdbMediaInput(display),
      },
    ]
  })
}
