'use client'

import type { LibraryItem } from '@plotline/payload-types'

import { Fragment } from 'react'

import { StatusBadge } from '@/components/utils/StatusBadge'
import { LogWatchButton } from '@/features/library/library-grid/components/grid/LogWatchButton'
import { getMediaFromLibraryItem } from '@/features/library/services/get-media-from-library-item'
import { MediaGridItem } from '@/features/media-grid/grid/components/MediaGridItem'

import { toMediaDisplayFromLibraryItem } from '../../services/to-media-display-from-library-item'

type LibraryGridItemProps = {
  item: LibraryItem
}

export function LibraryGridItem({ item }: LibraryGridItemProps) {
  const mediaDisplay = toMediaDisplayFromLibraryItem(item)
  const media = getMediaFromLibraryItem(item)

  if (!mediaDisplay || !media) {
    return null
  }

  return (
    <MediaGridItem
      actions={<LogWatchButton media={media} />}
      media={mediaDisplay}
      posterOverlay={(isHovered) => (
        <Fragment>
          <div className="absolute top-1 left-1">
            <StatusBadge
              animationKey={item.id.toString()}
              className="shadow-sm h-7 rounded-md"
              status={item.status}
              triggerAnimation={isHovered}
            />
          </div>
        </Fragment>
      )}
    />
  )
}
