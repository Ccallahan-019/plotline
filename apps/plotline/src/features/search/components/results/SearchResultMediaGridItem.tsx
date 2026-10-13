'use client'

import { TmdbSearchResultItem } from '@plotline/shared/tmdb'

import { toMediaDisplayFromTmdbResult } from '@/features/media-grid/grid/services/media-display-helpers'

import { useSearchLibraryItems } from '../../providers/SearchLibraryItemsProvider'
import { TrackableMediaGridItem } from './TrackableMediaGridItem'

type SearchResultMediaGridItemProps = {
  item: TmdbSearchResultItem
}

export function SearchResultMediaGridItem({ item }: SearchResultMediaGridItemProps) {
  const { getLibraryItemForMedia } = useSearchLibraryItems()

  const media = toMediaDisplayFromTmdbResult(item)

  if (media === null) {
    return null
  }

  return (
    <TrackableMediaGridItem existingLibraryItem={getLibraryItemForMedia(media)} media={media} />
  )
}
