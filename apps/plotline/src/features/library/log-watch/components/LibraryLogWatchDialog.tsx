'use client'

import type { LibraryItem, Media } from '@plotline/payload-types'
import type { WatchedEpisodePair } from '@plotline/shared/log-watch'

import { LogWatchDialog } from '@/features/library/log-watch/components/LogWatchDialog'
import { useLogWatchForm } from '@/features/library/log-watch/hooks/use-log-watch-form'
import { useWatchedEpisodes } from '@/features/library/watch-events/hooks/use-watched-episodes'

const EMPTY_WATCHED_EPISODES: readonly WatchedEpisodePair[] = []

type LibraryLogWatchDialogProps = {
  libraryItem: LibraryItem
  media: Media
  onLogged?: (libraryItem: LibraryItem) => void
  onOpenChange: (open: boolean) => void
  open: boolean
}

export function LibraryLogWatchDialog({
  libraryItem,
  media,
  onLogged,
  onOpenChange,
  open,
}: LibraryLogWatchDialogProps) {
  const { data: watchedEpisodes } = useWatchedEpisodes(libraryItem.id, {
    enabled: open && media.mediaType === 'tv',
  })
  const { form, isSubmitting } = useLogWatchForm({
    libraryItem,
    media,
    onSuccess: (logged) => {
      onLogged?.(logged)
      onOpenChange(false)
    },
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
