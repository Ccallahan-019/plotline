'use client'

import type { WatchlistMembership } from '@plotline/payload-types'

import { LibraryLogWatchDialog } from '@/features/library/log-watch/components/LibraryLogWatchDialog'

import { getMembershipLibraryItem, getMembershipMedia } from '../services/membership-media'

type WatchlistLogWatchDialogProps = {
  membership: null | WatchlistMembership
  onOpenChange: (open: boolean) => void
  open: boolean
}

export function WatchlistLogWatchDialog({
  membership,
  onOpenChange,
  open,
}: WatchlistLogWatchDialogProps) {
  if (!membership) {
    return null
  }

  const libraryItem = getMembershipLibraryItem(membership)
  const media = getMembershipMedia(membership)

  if (!libraryItem || !media) {
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
