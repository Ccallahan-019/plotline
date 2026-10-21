'use client'

import type { LibraryItem } from '@plotline/payload-types'

import { Fragment } from 'react/jsx-runtime'

import type { MediaDisplay } from '@/features/media-grid/types'

import { AnimatedStatusBadge } from '@/components/utils/AnimatedStatusBadge'
import { AddToLibraryPopover } from '@/features/library/add-to-list/components/AddToLibraryPopover'
import { MediaGridItem } from '@/features/media-grid/grid/components/MediaGridItem'

type TrackableMediaGridItemProps = {
  existingLibraryItem: LibraryItem | undefined
  media: MediaDisplay
}

export function TrackableMediaGridItem({
  existingLibraryItem,
  media,
}: TrackableMediaGridItemProps) {
  return (
    <MediaGridItem
      media={media}
      posterOverlay={(isHovered) => (
        <Fragment>
          <div className="absolute top-1 left-1">
            <AnimatedStatusBadge
              animationKey={existingLibraryItem?.id?.toString() ?? ''}
              className="shadow-sm h-6.5 rounded-md"
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
