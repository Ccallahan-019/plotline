'use client'

import type { WatchlistMembership } from '@plotline/payload-types'

import { AnimatedStatusBadge } from '@/components/utils/AnimatedStatusBadge'
import { MediaGridItem } from '@/features/media-grid/grid/components/MediaGridItem'

import {
  getMembershipLibraryItem,
  getMembershipMedia,
  toMembershipMediaDisplay,
} from '../services/membership-media'
import { WatchlistMembershipMenu } from './WatchlistMembershipMenu'

type WatchlistMembershipGridItemProps = {
  membership: WatchlistMembership
  onLogWatch: (membership: WatchlistMembership) => void
  onRemove: (membership: WatchlistMembership) => void
  slug: string
}

export function WatchlistMembershipGridItem({
  membership,
  onLogWatch,
  onRemove,
  slug,
}: WatchlistMembershipGridItemProps) {
  const media = getMembershipMedia(membership)
  const libraryItem = getMembershipLibraryItem(membership)
  const mediaDisplay = media ? toMembershipMediaDisplay(media) : null

  if (!media || !mediaDisplay) {
    return null
  }

  return (
    <MediaGridItem
      media={mediaDisplay}
      posterOverlay={(isHovered) => (
        <div className="absolute inset-1">
          <div className="flex h-full flex-col justify-between gap-2">
            <div>
              {libraryItem ? (
                <AnimatedStatusBadge
                  animationKey={libraryItem.id.toString()}
                  className="h-7 rounded-md shadow-sm"
                  status={libraryItem.status}
                  triggerAnimation={isHovered}
                />
              ) : null}
            </div>
            <div className="flex justify-end">
              <WatchlistMembershipMenu
                membership={membership}
                onLogWatch={onLogWatch}
                onRemove={onRemove}
                slug={slug}
                title={media.title}
                triggerSize="icon"
                triggerVariant="secondary"
              />
            </div>
          </div>
        </div>
      )}
    />
  )
}
