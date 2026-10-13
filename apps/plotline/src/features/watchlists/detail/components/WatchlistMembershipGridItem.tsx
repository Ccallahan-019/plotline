'use client'

import type { Watchlist, WatchlistMembership } from '@plotline/payload-types'

import { AnimatedStatusBadge } from '@/components/utils/AnimatedStatusBadge'
import { MediaGridItem } from '@/features/media-grid/grid/components/MediaGridItem'

import {
  getMembershipLibraryItem,
  getMembershipMedia,
  toMembershipMediaDisplay,
} from '../services/membership-media'
import { MembershipCountsControl } from './MembershipCountsControl'
import { WatchlistMembershipMenu } from './WatchlistMembershipMenu'

type WatchlistMembershipGridItemProps = {
  challenge: null | Watchlist['challenge']
  membership: WatchlistMembership
  onLogWatch: (membership: WatchlistMembership) => void
  onRemove: (membership: WatchlistMembership) => void
  showGoalCounts: boolean
  slug: string
}

export function WatchlistMembershipGridItem({
  challenge,
  membership,
  onLogWatch,
  onRemove,
  showGoalCounts,
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
      actions={
        showGoalCounts ? (
          <MembershipCountsControl
            challenge={challenge}
            membership={membership}
            slug={slug}
            title={media.title}
          />
        ) : null
      }
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
