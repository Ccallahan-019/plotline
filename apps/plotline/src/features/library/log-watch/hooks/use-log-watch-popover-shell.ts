'use client'

import type { LibraryItem, Media } from '@plotline/payload-types'
import type { WatchedEpisodePair } from '@plotline/shared/log-watch'

import { useWatchedEpisodes } from '@/features/library/watch-events/hooks/use-watched-episodes'

import { useLogWatchPopover } from '../providers/LogWatchPopoverProvider'
import { syncQuickLogEpisode } from '../services/episode-field'
import { useLogWatchForm } from './use-log-watch-form'

const EMPTY_WATCHED_EPISODES: readonly WatchedEpisodePair[] = []

type UseLogWatchPopoverShellOptions = {
  libraryItem: LibraryItem
  media: Media
}

/**
 * Log-watch form and dialog handlers for one popover.
 *
 * Episode coverage loads only while the popover or dialog is open for a TV title.
 * A successful log closes both surfaces. Opening the full dialog keeps a single
 * episode selection, and closing the dialog collapses a multi-select back to the
 * quick-log episode so submit still keys off `episodes.length`.
 *
 * @param options.libraryItem - Library row used for progress defaults and watched-episode lookup
 * @param options.media - Title being logged; TV titles enable the coverage query
 * @returns The shared form, submit state, dialog open flag, dialog handlers, and watched coverage
 */
export function useLogWatchPopoverShell({ libraryItem, media }: UseLogWatchPopoverShellOptions) {
  const { isDialogOpen, isPopoverOpen, setDialogOpen, setPopoverOpen } = useLogWatchPopover()

  // The popover stays mounted on every library card. Fetch episode coverage only while
  // TV log-watch is open so the dialog can label episodes that are already watched.
  const { data: watchedEpisodes } = useWatchedEpisodes(libraryItem.id, {
    enabled: (isPopoverOpen || isDialogOpen) && media.mediaType === 'tv',
  })
  const watchedCoverage = {
    showCompleted: libraryItem.status === 'completed',
    watchedEpisodes: watchedEpisodes ?? EMPTY_WATCHED_EPISODES,
  }

  function handleLogWatchSuccess() {
    setPopoverOpen(false)
    setDialogOpen(false)
  }

  const { form, isSubmitting } = useLogWatchForm({
    libraryItem,
    media,
    onSuccess: handleLogWatchSuccess,
  })

  // Dialog cancel/dismiss must not leave a hidden multi-select; the popover only edits
  // `episode`, and submit keys off `episodes.length`. Collapse back to the quick-log row.
  function handleDialogOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      syncQuickLogEpisode(form)
    }

    setDialogOpen(nextOpen)
  }

  function handleMoreOptions() {
    if (form.getFieldValue('episodes').length <= 1) {
      syncQuickLogEpisode(form)
    }

    setDialogOpen(true)
    setPopoverOpen(false)
  }

  return {
    form,
    handleDialogOpenChange,
    handleMoreOptions,
    isDialogOpen,
    isSubmitting,
    watchedCoverage,
  }
}
