'use client'

import type { LibraryItem } from '@plotline/payload-types'
import type { MediaStatus } from '@plotline/shared/constants'

import { useQueryClient } from '@tanstack/react-query'
import { useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

import type { LogWatchEpisodeInput } from '@/features/library/log-watch/services/log-watch-form-schema'

import { useCreateLibraryItem } from '@/features/library/library-item/hooks/use-create-library-item'
import { useUpdateLibraryItem } from '@/features/library/library-item/hooks/use-update-library-item'
import { getErrorMessage } from '@/utils/get-error-message'

import type { MediaTitlePageData } from '../types'

import { buildPlaceholderLibraryItem } from '../services/placeholder-library-item'
import { mediaTitleQueryKeys } from '../services/query-keys'
import {
  rememberTitleLibraryItem,
  titlePageWithLibraryItem,
} from '../services/remember-title-library-item'
import {
  titleLogWatchSessionAfter,
  type TitleLogWatchSessionRequest,
} from '../services/title-log-watch-session'

/**
 * Log-watch and status actions for a title page.
 *
 * A status change on a title that is not in the library creates it first. Mark
 * Watched and an episode log on such a title open log-watch against a placeholder
 * row, and the endpoint creates the real one on submit, so cancelling leaves the
 * library as it was. A successful log patches the title query with the row the
 * form built (real id and progress) so the hero updates before the shared library
 * invalidation refetch finishes. Status updates reuse `useUpdateLibraryItem`,
 * which toasts and rolls back on failure.
 *
 * Episode buttons set `logWatchEpisode` and bump `logWatchSessionKey` so the dialog
 * remounts with that episode selected, including the usual date and platform fields.
 * Mark Watched keeps the mounted form when the session was not opened from an episode,
 * so cancelling and reopening it keeps an in-progress edit. Mark Watched after an
 * episode prefill clears that episode and remounts onto the suggested next episode.
 * Either open is ignored while a log-watch submit or a library write is in flight, so
 * a new session cannot replace the form that is still submitting.
 *
 * @param data - Loaded title page, including catalog media and the library row when present
 * @returns The library row to render, the row and episode the log-watch dialog should use,
 * whether a library write or log-watch submit is in flight, dialog session state, and the
 * mark-watched, episode, log-watch success, submitting, and status handlers
 */
export function useMediaTitleActions(data: MediaTitlePageData) {
  const queryClient = useQueryClient()
  const createLibraryItem = useCreateLibraryItem()
  const updateLibraryItem = useUpdateLibraryItem()
  const [logWatchEpisode, setLogWatchEpisode] = useState<LogWatchEpisodeInput>()
  const [logWatchOpen, setLogWatchOpen] = useState(false)
  const [logWatchSessionKey, setLogWatchSessionKey] = useState(0)
  const [logWatchSubmitting, setLogWatchSubmitting] = useState(false)
  const inFlightRef = useRef(false)
  const { libraryItem, media } = data
  const logWatchLibraryItem = useMemo(
    () => libraryItem ?? buildPlaceholderLibraryItem(media),
    [libraryItem, media],
  )
  const isPending = createLibraryItem.isPending || updateLibraryItem.isPending

  const rememberLibraryItem = (next: LibraryItem) => {
    const { mediaType, tmdbId } = media
    const populated = rememberTitleLibraryItem(next, media)

    queryClient.setQueryData<MediaTitlePageData>(
      mediaTitleQueryKeys.detail(mediaType, tmdbId),
      (current) => titlePageWithLibraryItem(current, next, media),
    )

    return populated
  }

  const handleLogWatchSuccess = (next: LibraryItem) => {
    rememberLibraryItem(next)
  }

  const createWithStatus = async (status: MediaStatus) => {
    const result = await createLibraryItem.mutateAsync({
      mediaId: media.id,
      status,
    })

    return rememberLibraryItem(result.libraryItem)
  }

  const openLogWatchSession = (request: TitleLogWatchSessionRequest) => {
    const blocked = isPending || inFlightRef.current || logWatchSubmitting
    const current = {
      episode: logWatchEpisode,
      open: logWatchOpen,
      sessionKey: logWatchSessionKey,
    }
    const next = titleLogWatchSessionAfter(current, request, blocked)

    if (next === current) {
      return
    }

    setLogWatchEpisode(next.episode)
    setLogWatchOpen(next.open)
    setLogWatchSessionKey(next.sessionKey)
  }

  const handleLogEpisode = (seasonNumber: number, episodeNumber: number) => {
    openLogWatchSession({
      episodeNumber,
      seasonNumber,
      type: 'episode',
    })
  }

  const handleMarkWatched = () => {
    openLogWatchSession({ type: 'mark-watched' })
  }

  const handleStatusChange = (status: MediaStatus) => {
    if (isPending || inFlightRef.current || libraryItem?.status === status) {
      return
    }

    if (!libraryItem) {
      inFlightRef.current = true

      void createWithStatus(status)
        .catch((error: unknown) => {
          toast.error('Could not add this title', {
            description: error instanceof Error ? (getErrorMessage(error) ?? undefined) : undefined,
          })
        })
        .finally(() => {
          inFlightRef.current = false
        })
      return
    }

    inFlightRef.current = true

    void updateLibraryItem
      .mutateAsync({
        libraryItem,
        libraryItemId: libraryItem.id,
        status,
      })
      .then((result) => {
        rememberLibraryItem(result.libraryItem)
      })
      .catch(() => {
        // The update mutation toasts the error and reverts its own optimistic write.
      })
      .finally(() => {
        inFlightRef.current = false
      })
  }

  return {
    handleLogEpisode,
    handleLogWatchSuccess,
    handleMarkWatched,
    handleStatusChange,
    isPending,
    libraryItem,
    logWatchEpisode,
    logWatchLibraryItem,
    logWatchOpen,
    logWatchSessionKey,
    logWatchSubmitting,
    setLogWatchOpen,
    setLogWatchSubmitting,
  }
}
