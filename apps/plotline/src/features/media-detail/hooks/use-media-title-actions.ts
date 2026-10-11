'use client'

import type { LibraryItem } from '@plotline/payload-types'
import type { MediaStatus } from '@plotline/shared/constants'

import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { useCreateLibraryItem } from '@/features/library/library-item/hooks/use-create-library-item'
import { useUpdateLibraryItem } from '@/features/library/library-item/hooks/use-update-library-item'
import { getErrorMessage } from '@/utils/get-error-message'

import type { MediaTitlePageData } from '../types'

import { mediaTitleQueryKeys } from '../services/query-keys'

/**
 * Log-watch and status actions for the title hero.
 *
 * A title that is not in the library is created before those actions run.
 * The title query is patched with the returned row so the hero updates before
 * the shared library invalidation refetch finishes. Status updates reuse
 * `useUpdateLibraryItem`, which toasts and rolls back on failure.
 *
 * @param data - Loaded title page, including catalog media and the library row when present
 * @returns The library row to render, whether a write is in flight, log-watch dialog
 * state, and the mark-watched and status handlers
 */
export function useMediaTitleActions(data: MediaTitlePageData) {
  const queryClient = useQueryClient()
  const createLibraryItem = useCreateLibraryItem()
  const updateLibraryItem = useUpdateLibraryItem()
  const [draftLibraryItem, setDraftLibraryItem] = useState<LibraryItem | null>(null)
  const [logWatchOpen, setLogWatchOpen] = useState(false)
  const [openLogWatchAfterCreate, setOpenLogWatchAfterCreate] = useState(false)
  const inFlightRef = useRef(false)
  const libraryItem = data.libraryItem ?? draftLibraryItem
  const isPending = createLibraryItem.isPending || updateLibraryItem.isPending

  // Mount the dialog closed, then open it. Opening in the same render that creates
  // the library row can leave the dialog mounted already-open and invisible.
  useEffect(() => {
    if (!openLogWatchAfterCreate || !libraryItem) {
      return
    }

    setLogWatchOpen(true)
    setOpenLogWatchAfterCreate(false)
  }, [libraryItem, openLogWatchAfterCreate])

  const rememberLibraryItem = (next: LibraryItem) => {
    const populated: LibraryItem = {
      ...next,
      media: typeof next.media === 'object' ? next.media : data.media,
    }

    setDraftLibraryItem(populated)
    queryClient.setQueryData<MediaTitlePageData>(
      mediaTitleQueryKeys.detail(data.media.mediaType, data.media.tmdbId),
      (current) => (current ? { ...current, libraryItem: populated } : current),
    )

    return populated
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

    if (libraryItem) {
      setLogWatchOpen(true)
      return
    }

    inFlightRef.current = true

    void createWithStatus('planned')
      .then(() => {
        setOpenLogWatchAfterCreate(true)
      })
      .catch((error: unknown) => {
        toast.error('Could not add this title', {
          description: error instanceof Error ? (getErrorMessage(error) ?? undefined) : undefined,
        })
      })
      .finally(() => {
        inFlightRef.current = false
      })
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
    handleMarkWatched,
    handleStatusChange,
    isPending,
    libraryItem,
    logWatchOpen,
    setLogWatchOpen,
  }
}
