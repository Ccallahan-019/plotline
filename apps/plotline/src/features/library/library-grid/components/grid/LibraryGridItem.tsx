'use client'

import type { LibraryItem } from '@plotline/payload-types'

import { AnimatedStatusBadge } from '@/components/utils/AnimatedStatusBadge'
import { LibraryItemDrawer } from '@/features/library/library-grid/components/drawer/LibraryItemDrawer'
import { getMediaFromLibraryItem } from '@/features/library/services/get-media-from-library-item'
import { MediaGridItem } from '@/features/media-grid/grid/components/MediaGridItem'

import { toMediaDisplayFromLibraryItem } from '../../services/to-media-display-from-library-item'
import { AnimatedLogWatchButton } from './AnimatedLogWatchButton'

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
      media={mediaDisplay}
      posterOverlay={(isHovered) => (
        <div className="absolute inset-1">
          <div className="flex flex-col gap-2 justify-between h-full">
            <AnimatedStatusBadge
              animationKey={item.id.toString()}
              className="shadow-sm h-7 rounded-md"
              status={item.status}
              triggerAnimation={isHovered}
            />
            <div className="flex justify-end gap-2">
              <AnimatedLogWatchButton
                animationKey={item.id.toString()}
                media={media}
                triggerAnimation={isHovered}
              />
              <LibraryItemDrawer item={item} />
            </div>
          </div>
        </div>
      )}
    />
  )
}
