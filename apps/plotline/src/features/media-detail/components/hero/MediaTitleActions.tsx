'use client'

import { LibraryItem, Media } from '@plotline/payload-types'
import { Check, ChevronDown, Star } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { StatusDot } from '@/components/utils/StatusDot'
import { AddToLibraryPopover } from '@/features/library/add-to-list/components/AddToLibraryPopover'
import { LibraryStatusMenuItems } from '@/features/library/library-item/components/LibraryStatusMenuItems'
import { formatLibraryItemStatus } from '@/features/library/library-item/services/format-library-item-status'
import { LibraryLogWatchDialog } from '@/features/library/log-watch/components/LibraryLogWatchDialog'
import { toMediaDisplayFromMedia } from '@/features/media-grid/grid/services/media-display-helpers'
import { OpenStateProvider } from '@/providers/OpenStateProvider'

import type { MediaTitlePageData } from '../../types'

import { useMediaTitleActions } from '../../hooks/use-media-title-actions'

type MediaTitleActionsProps = {
  data: MediaTitlePageData
}

type MediaTitleLogWatchDialogProps = {
  libraryItem: LibraryItem | null
  media: Media
  onOpenChange: (open: boolean) => void
  open: boolean
}

export function MediaTitleActions({ data }: MediaTitleActionsProps) {
  const {
    handleMarkWatched,
    handleStatusChange,
    isPending,
    libraryItem,
    logWatchOpen,
    setLogWatchOpen,
  } = useMediaTitleActions(data)
  const mediaDisplay = toMediaDisplayFromMedia(data.media)

  return (
    <>
      <div className="flex flex-col gap-2 md:flex-row md:flex-wrap md:items-center">
        <div className="flex flex-wrap w-full gap-2 md:w-auto">
          <Button
            className="w-full md:w-auto"
            disabled={isPending}
            onClick={handleMarkWatched}
            type="button"
          >
            <Check />
            Mark Watched
          </Button>
          <OpenStateProvider>
            <AddToLibraryPopover
              appearance="button"
              className="min-w-0 flex-1 md:flex-none"
              existingLibraryItem={libraryItem ?? undefined}
              media={mediaDisplay}
            />
          </OpenStateProvider>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  className="min-w-0 flex-1 md:flex-none"
                  disabled={isPending}
                  type="button"
                  variant="secondary"
                />
              }
            >
              <StatusDot data-icon="inline-start" status={libraryItem?.status ?? 'untracked'} />
              {libraryItem?.status ? formatLibraryItemStatus(libraryItem.status) : 'Set Status'}
              <ChevronDown data-icon="inline-end" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-48">
              <LibraryStatusMenuItems
                currentStatus={libraryItem?.status}
                disabled={isPending}
                onStatusChange={handleStatusChange}
              />
            </DropdownMenuContent>
          </DropdownMenu>

          <Button className="hidden md:inline-flex" disabled type="button" variant="outline">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star data-icon="inline-start" key={`star-${index}`} />
            ))}
            Rate
          </Button>
        </div>
      </div>

      <MediaTitleLogWatchDialog
        libraryItem={libraryItem}
        media={data.media}
        onOpenChange={setLogWatchOpen}
        open={logWatchOpen}
      />
    </>
  )
}

function MediaTitleLogWatchDialog({
  libraryItem,
  media,
  onOpenChange,
  open,
}: MediaTitleLogWatchDialogProps) {
  if (!libraryItem) {
    return null
  }

  return (
    <LibraryLogWatchDialog
      libraryItem={libraryItem}
      media={media}
      onOpenChange={onOpenChange}
      open={open}
    />
  )
}
