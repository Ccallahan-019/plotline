'use client'

import type { LibraryItem } from '@plotline/payload-types'
import type { TmdbSearchResultItem } from '@plotline/shared/tmdb'

import { Fragment } from 'react/jsx-runtime'

import { AnimatedStatusBadge } from '@/components/utils/AnimatedStatusBadge'
import { AddToLibraryPopover } from '@/features/library/add-to-list/components/AddToLibraryPopover'
import { MediaGridItem } from '@/features/media-grid/grid/components/MediaGridItem'
import { toMediaDisplayFromTmdbResult } from '@/features/media-grid/grid/services/media-display-helpers'
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

  const existingLibraryItem = getLibraryItemForMediaDisplay(lookup, media)

  return (
    <MediaGridItem
      media={media}
      posterOverlay={(isHovered) => {
        const status = existingLibraryItem?.status ?? 'untracked'
        const animationKey = existingLibraryItem?.id?.toString() ?? ''

        return (
          <Fragment>
            <div className="absolute top-1 left-1">
              <AnimatedStatusBadge
                animationKey={animationKey}
                className="shadow-sm h-7 rounded-md"
                status={status}
                triggerAnimation={isHovered}
              />
            </div>
            <div className="absolute bottom-1 right-1">
              <AddToLibraryPopover existingLibraryItem={existingLibraryItem} media={media} />
            </div>
          </Fragment>
        )
      }}
    />
  )
}
