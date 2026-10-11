'use client'

import type { LibraryItem } from '@plotline/payload-types'
import type { TmdbSearchResultItem } from '@plotline/shared/tmdb'

import { toMediaDisplayFromTmdbResult } from '@/features/media-grid/grid/services/media-display-helpers'
import { TrackableMediaGridItem } from '@/features/search/components/results/TrackableMediaGridItem'
import { getLibraryItemForMediaDisplay } from '@/features/search/services/build-library-item-lookup'

type MediaSimilarGridItemProps = {
  item: TmdbSearchResultItem
  lookup: Map<string, LibraryItem>
}

export function MediaSimilarGridItem({ item, lookup }: MediaSimilarGridItemProps) {
  const media = toMediaDisplayFromTmdbResult(item)

  if (media === null) {
    return null
  }

  return (
    <TrackableMediaGridItem
      existingLibraryItem={getLibraryItemForMediaDisplay(lookup, media)}
      media={media}
    />
  )
}
