'use client'

import type { LibraryItem, Media, Watchlist, WatchlistMembership } from '@plotline/payload-types'

import { useSortable } from '@dnd-kit/react/sortable'
import Link from 'next/link'

import { MediaBackdropCard } from '@/components/media/MediaBackdropCard'
import { MediaPoster } from '@/components/media/MediaPoster'
import { RatingBadge } from '@/components/ratings/RatingsBadge'
import { CardContent } from '@/components/ui/card'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'
import { ShowIf } from '@/components/utils/ShowIf'
import { StatusBadge } from '@/components/utils/StatusBadge'
import { titleBackdropUrl } from '@/features/media-detail/services/media-image-url'
import {
  getPosterUrl,
  getTitleHref,
} from '@/features/media-grid/grid/services/media-display-helpers'
import { useTitleBreadcrumbLinkProps } from '@/features/navigation/breadcrumbs/components/TitleBreadcrumbParentProvider'
import { cn } from '@/lib/utils'

import {
  formatAddedToListLabel,
  formatMembershipDescription,
  formatMembershipMediaLabel,
} from '../services/format-membership-metadata'
import {
  getMembershipLibraryItem,
  getMembershipMedia,
  toMembershipMediaDisplay,
} from '../services/membership-media'
import { MembershipCountsControl } from './MembershipCountsControl'
import { WatchlistMembershipDragButton } from './WatchlistMembershipDragButton'
import { WatchlistMembershipMenu } from './WatchlistMembershipMenu'

type WatchlistMembershipRowProps = {
  challenge: null | Watchlist['challenge']
  index: number
  membership: WatchlistMembership
  onLogWatch: (membership: WatchlistMembership) => void
  onRemove: (membership: WatchlistMembership) => void
  reorderDisabled: boolean
  showDragHandle: boolean
  showGoalCounts: boolean
  slug: string
}

export function WatchlistMembershipRow({
  challenge,
  index,
  membership,
  onLogWatch,
  onRemove,
  reorderDisabled,
  showDragHandle,
  showGoalCounts,
  slug,
}: WatchlistMembershipRowProps) {
  const media = getMembershipMedia(membership)
  const backdropUrl = titleBackdropUrl(media?.backdropPath)
  const libraryItem = getMembershipLibraryItem(membership)
  const title = media?.title ?? 'Untitled'
  const mediaLabel = formatMembershipMediaLabel(media)
  const addedLabel = formatAddedToListLabel(membership.addedAt)
  // `handleRef` is the only drag source, so the title link and menu stay clickable.
  const { handleRef, isDragging, ref } = useSortable({
    disabled: reorderDisabled || !showDragHandle,
    id: membership.id,
    index,
  })

  const description = formatMembershipDescription(mediaLabel, addedLabel)

  return (
    <div
      className={cn('w-full', isDragging && 'relative z-10 opacity-70')}
      data-membership-id={membership.id}
      ref={ref}
      role="listitem"
    >
      <MediaBackdropCard
        backdropUrl={backdropUrl}
        imageSizes="340px"
        size="sm"
        wrapperClassName="lg:w-1/3"
      >
        <CardContent>
          <Item className="flex-nowrap gap-3 p-0">
            <ShowIf condition={showDragHandle}>
              <WatchlistMembershipDragButton
                disabled={reorderDisabled}
                handleRef={handleRef}
                title={title}
              />
            </ShowIf>

            <ItemMedia>
              <MediaPoster
                className="w-16 shrink-0 rounded-sm"
                fallbackIconClassName="size-4"
                ratio={2 / 3}
                sizes="64px"
                src={getPosterUrl(media?.posterPath)}
              />
            </ItemMedia>

            <ItemContent className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <MembershipTitle media={media} title={title} />
                <RatingBadge className="relative top-0 right-0" rating={media?.voteAverage} />
              </div>
              <ShowIf condition={description != null}>
                <ItemDescription className="text-xs line-clamp-1">{description}</ItemDescription>
              </ShowIf>
              <ShowIf condition={showGoalCounts}>
                <div className="mt-0.5">
                  <MembershipCountsControl
                    challenge={challenge}
                    membership={membership}
                    slug={slug}
                    title={title}
                  />
                </div>
              </ShowIf>
            </ItemContent>

            <ItemActions className="ml-auto shrink-0">
              <LibraryItemStatus libraryItem={libraryItem} />

              <WatchlistMembershipMenu
                membership={membership}
                onLogWatch={onLogWatch}
                onRemove={onRemove}
                slug={slug}
                title={title}
              />
            </ItemActions>
          </Item>
        </CardContent>
      </MediaBackdropCard>
    </div>
  )
}

function LibraryItemStatus({ libraryItem }: { libraryItem: LibraryItem | null }) {
  if (!libraryItem) {
    return null
  }

  return <StatusBadge status={libraryItem.status} />
}

function MembershipTitle({ media, title }: { media: Media | null; title: string }) {
  const titleLinkProps = useTitleBreadcrumbLinkProps()

  if (!media) {
    return <ItemTitle className="line-clamp-1">{title}</ItemTitle>
  }

  return (
    <Link className="w-fit hover:underline" href={membershipTitleHref(media)} {...titleLinkProps}>
      <ItemTitle className="line-clamp-1">{title}</ItemTitle>
    </Link>
  )
}

function membershipTitleHref(media: Media): string {
  return getTitleHref(toMembershipMediaDisplay(media))
}
