'use client'

import type { LibraryItem } from '@plotline/payload-types'
import type { MediaStatus } from '@plotline/shared/constants'

import { useQueryClient } from '@tanstack/react-query'
import { useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

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

/**
 * Log-watch and status actions for the title hero.
 *
 * A status change on a title that is not in the library creates it first. Mark
 * Watched on such a title opens log-watch against a placeholder row, and the
 * endpoint creates the real one on submit, so cancelling leaves the library as it
 * was. A successful log patches the title query with the row the form built (real
 * id and progress) so the hero updates before the shared library invalidation
 * refetch finishes. Status updates reuse `useUpdateLibraryItem`, which toasts and
 * rolls back on failure.
 *
 * @param data - Loaded title page, including catalog media and the library row when present
 * @returns The library row to render, the row the log-watch dialog should use, whether a
 * write is in flight, log-watch dialog state, and the mark-watched, log-watch success,
 * and status handlers
 */
export function useMediaTitleActions(data: MediaTitlePageData) {
  const queryClient = useQueryClient()
  const createLibraryItem = useCreateLibraryItem()
  const updateLibraryItem = useUpdateLibraryItem()
  const [logWatchOpen, setLogWatchOpen] = useState(false)
  const inFlightRef = useRef(false)
  const libraryItem = data.libraryItem
  const logWatchLibraryItem = useMemo(
    () => libraryItem ?? buildPlaceholderLibraryItem(data.media),
    [data.media, libraryItem],
  )
  const isPending = createLibraryItem.isPending || updateLibraryItem.isPending

  const rememberLibraryItem = (next: LibraryItem) => {
    const populated = rememberTitleLibraryItem(next, data.media)

    queryClient.setQueryData<MediaTitlePageData>(
      mediaTitleQueryKeys.detail(data.media.mediaType, data.media.tmdbId),
      (current) => titlePageWithLibraryItem(current, next, data.media),
    )

    return populated
  }

  const handleLogWatchSuccess = (next: LibraryItem) => {
    rememberLibraryItem(next)
  }

  const createWithStatus = async (status: MediaStatus) => {
    const result = await createLibraryItem.mutateAsync({
      mediaId: data.media.id,
      status,
    })

    return rememberLibraryItem(result.libraryItem)
  }

  const handleMarkWatched = () => {
    if (isPending || inFlightRef.current) {
      return
    }

    setLogWatchOpen(true)
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
    handleLogWatchSuccess,
    handleMarkWatched,
    handleStatusChange,
    isPending,
    libraryItem,
    logWatchLibraryItem,
    logWatchOpen,
    setLogWatchOpen,
  }
}
