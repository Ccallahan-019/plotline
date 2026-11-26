'use client'

import type { LibraryItem, Media } from '@plotline/payload-types'
import type { WatchedEpisodePair } from '@plotline/shared/log-watch'

import { useEffect, useRef } from 'react'

import { LogWatchDialog } from '@/features/library/log-watch/components/LogWatchDialog'
import { useLogWatchForm } from '@/features/library/log-watch/hooks/use-log-watch-form'
import { useWatchedEpisodes } from '@/features/library/watch-events/hooks/use-watched-episodes'

import type { LogWatchEpisodeInput } from '../services/log-watch-form-schema'

const EMPTY_WATCHED_EPISODES: readonly WatchedEpisodePair[] = []

type LibraryLogWatchDialogProps = {
  episode?: LogWatchEpisodeInput
  libraryItem: LibraryItem
  media: Media
  onLogged?: (libraryItem: LibraryItem) => void
  onOpenChange: (open: boolean) => void
  /** Called when this session's log-watch submit starts or finishes. */
  onSubmittingChange?: (submitting: boolean) => void
  open: boolean
  /** Bumping this remounts the form and season picker so a new episode prefill is read. */
  sessionKey?: number
}

type LibraryLogWatchDialogSessionProps = Omit<LibraryLogWatchDialogProps, 'sessionKey'>

export function LibraryLogWatchDialog({
  episode,
  libraryItem,
  media,
  onLogged,
  onOpenChange,
  onSubmittingChange,
  open,
  sessionKey,
}: LibraryLogWatchDialogProps) {
  return (
    <LibraryLogWatchDialogSession
      episode={episode}
      key={sessionKey}
      libraryItem={libraryItem}
      media={media}
      onLogged={onLogged}
      onOpenChange={onOpenChange}
      onSubmittingChange={onSubmittingChange}
      open={open}
    />
  )
}

function LibraryLogWatchDialogSession({
  episode,
  libraryItem,
  media,
  onLogged,
  onOpenChange,
  onSubmittingChange,
  open,
}: LibraryLogWatchDialogSessionProps) {
  const isMountedRef = useRef(true)
  const { data: watchedEpisodes } = useWatchedEpisodes(libraryItem.id, {
    enabled: open && media.mediaType === 'tv',
  })
  const { form, isSubmitting } = useLogWatchForm({
    episode,
    libraryItem,
    media,
    onSuccess: (logged) => {
      onLogged?.(logged)

      // A newer session owns the dialog after this one unmounts. Closing would dismiss it.
      if (isMountedRef.current) {
        onOpenChange(false)
      }
    },
  })

  useEffect(() => {
    isMountedRef.current = true

    return () => {
      isMountedRef.current = false
    }
  }, [])

  useEffect(() => {
    onSubmittingChange?.(isSubmitting)
  }, [isSubmitting, onSubmittingChange])

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
