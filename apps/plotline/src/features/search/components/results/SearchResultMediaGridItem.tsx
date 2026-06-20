'use client'

import { TmdbSearchResultItem } from '@plotline/shared/tmdb'
import { Fragment } from 'react/jsx-runtime'

import { StatusBadge } from '@/components/utils/StatusBadge'
import { AddToLibraryPopover } from '@/features/library/add-to-list/components/AddToLibraryPopover'
import { MediaGridItem } from '@/features/media-grid/grid/components/MediaGridItem'
import { toMediaDisplayFromTmdbResult } from '@/features/media-grid/grid/services/media-display-helpers'

import { useSearchLibraryItems } from '../../providers/SearchLibraryItemsProvider'

type SearchResultMediaGridItemProps = {
  item: TmdbSearchResultItem
}

export function SearchResultMediaGridItem({ item }: SearchResultMediaGridItemProps) {
  const { getLibraryItemForMedia } = useSearchLibraryItems()

  const media = toMediaDisplayFromTmdbResult(item)

  if (media === null) {
    return null
  }

  const existingLibraryItem = getLibraryItemForMedia(media)

  return (
    <MediaGridItem
      media={media}
      posterOverlay={(isHovered) => (
        <Fragment>
          <div className="absolute top-1 left-1">
            <StatusBadge
              animationKey={existingLibraryItem?.id?.toString() ?? ''}
              className="shadow-sm h-7 rounded-md"
              status={existingLibraryItem?.status ?? 'untracked'}
              triggerAnimation={isHovered}
            />
          </div>
          <div className="absolute bottom-1 right-1">
            <AddToLibraryPopover existingLibraryItem={existingLibraryItem} media={media} />
          </div>
        </Fragment>
      )}
    />
  )
}
