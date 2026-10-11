'use client'

import type { LibraryItem, Media, WatchlistMembership } from '@plotline/payload-types'

import { useSortable } from '@dnd-kit/react/sortable'
import Link from 'next/link'

import { MediaPoster } from '@/components/media/MediaPoster'
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
import {
  getPosterUrl,
  getTitleHref,
} from '@/features/media-grid/grid/services/media-display-helpers'
import { cn } from '@/lib/utils'

import {
  formatAddedToListLabel,
  formatMembershipMediaLabel,
} from '../services/format-membership-metadata'
import {
  getMembershipLibraryItem,
  getMembershipMedia,
  toMembershipMediaDisplay,
} from '../services/membership-media'
import { WatchlistMembershipDragButton } from './WatchlistMembershipDragButton'
import { WatchlistMembershipMenu } from './WatchlistMembershipMenu'

type WatchlistMembershipRowProps = {
  index: number
  membership: WatchlistMembership
  onLogWatch: (membership: WatchlistMembership) => void
  onRemove: (membership: WatchlistMembership) => void
  reorderDisabled: boolean
  showDragHandle: boolean
  slug: string
}

export function WatchlistMembershipRow({
  index,
  membership,
  onLogWatch,
  onRemove,
  reorderDisabled,
  showDragHandle,
  slug,
}: WatchlistMembershipRowProps) {
  const media = getMembershipMedia(membership)
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

  return (
    <div
      className={cn('w-full', isDragging && 'relative z-10 opacity-70')}
      data-membership-id={membership.id}
      ref={ref}
      role="listitem"
    >
      <Item className="flex-nowrap gap-3" variant="outline">
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
          <MembershipTitle media={media} title={title} />
          <ShowIf condition={mediaLabel != null}>
            <ItemDescription className="line-clamp-1">{mediaLabel}</ItemDescription>
          </ShowIf>
          <ShowIf condition={addedLabel != null}>
            <ItemDescription className="line-clamp-1">{addedLabel}</ItemDescription>
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
  if (!media) {
    return <ItemTitle>{title}</ItemTitle>
  }

  return (
    <Link className="w-fit hover:underline" href={membershipTitleHref(media)}>
      <ItemTitle>{title}</ItemTitle>
    </Link>
  )
}

function membershipTitleHref(media: Media): string {
  return getTitleHref(toMembershipMediaDisplay(media))
}
