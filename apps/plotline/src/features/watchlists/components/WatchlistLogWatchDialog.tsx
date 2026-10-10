'use client'

import type { LibraryItem, Media, WatchlistMembership } from '@plotline/payload-types'
import type { WatchedEpisodePair } from '@plotline/shared/log-watch'

import { LogWatchDialog } from '@/features/library/log-watch/components/LogWatchDialog'
import { useLogWatchForm } from '@/features/library/log-watch/hooks/use-log-watch-form'
import { useWatchedEpisodes } from '@/features/library/watch-events/hooks/use-watched-episodes'

import { getMembershipLibraryItem, getMembershipMedia } from '../services/membership-media'

const EMPTY_WATCHED_EPISODES: readonly WatchedEpisodePair[] = []

type WatchlistLogWatchDialogFormProps = {
  libraryItem: LibraryItem
  media: Media
  onOpenChange: (open: boolean) => void
  open: boolean
}

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
    <WatchlistLogWatchDialogForm
      libraryItem={libraryItem}
      media={media}
      onOpenChange={onOpenChange}
      open={open}
    />
  )
}

function WatchlistLogWatchDialogForm({
  libraryItem,
  media,
  onOpenChange,
  open,
}: WatchlistLogWatchDialogFormProps) {
  const { data: watchedEpisodes } = useWatchedEpisodes(libraryItem.id, {
    enabled: open && media.mediaType === 'tv',
  })
  const { form, isSubmitting } = useLogWatchForm({
    libraryItem,
    media,
    onSuccess: () => onOpenChange(false),
  })

  return (
    <LogWatchDialog
      form={form}
      isSubmitting={isSubmitting}
      media={media}
      onOpenChange={onOpenChange}
      open={open}
      watchedCoverage={{
        showCompleted: libraryItem.status === 'completed',
        watchedEpisodes: watchedEpisodes ?? EMPTY_WATCHED_EPISODES,
      }}
    />
  )
}
