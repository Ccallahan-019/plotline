'use client'

import type { LibraryItem } from '@plotline/payload-types'
import type { MediaStatus } from '@plotline/shared/constants'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRef } from 'react'
import { toast } from 'sonner'

import { MEDIA_STATUS_LABELS } from '@/features/library/constants/media-status-options'
import { getMediaFromLibraryItem } from '@/features/library/services/get-media-from-library-item'

import type { UpdateLibraryItemInput, UpdateLibraryItemResult } from '../../types/mutations'

import { invalidateAfterLibraryMutation } from '../../services/invalidate-library-queries'
import { patchLibraryItem } from '../services/fetch-library-item'
import {
  applyOptimisticLibraryItemUpdate,
  findCachedLibraryItem,
  type LibraryItemQuerySnapshot,
  resolveLibraryItemUpdate,
  restoreLibraryItemQuerySnapshot,
  snapshotLibraryItemQueries,
} from '../services/optimistic-library-item'

export type UpdateLibraryItemVariables = {
  /** Row before the edit, used when it is not in the grid or lookup cache. */
  libraryItem?: LibraryItem
  libraryItemId: number | string
  personalNotes?: null | string
  status?: MediaStatus
}

type PendingLibraryItemUpdate = {
  current: LibraryItem | undefined
  request: null | UpdateLibraryItemInput
  title: string | undefined
}

/**
 * Updates a library item's status and personal notes.
 *
 * Optimistically patches matching grid and lookup rows. Status changes stamp
 * `startedAt` / `completedAt` the same way as the server, and a movie that newly
 * becomes completed is marked `progress.watched`. A status-filtered grid drops the
 * row when the new status is outside that filter. An unchanged status is omitted
 * so saving the current status cannot create another completed watch event; when
 * that leaves nothing to send, the mutation resolves without a request or a toast.
 * Rolls the cache back on error, invalidates library queries when the mutation
 * settles, and toasts the network update.
 *
 * @returns A React Query mutation for `UpdateLibraryItemVariables` → `UpdateLibraryItemResult`
 */
export function useUpdateLibraryItem() {
  const queryClient = useQueryClient()
  // Resolved before the optimistic write. `mutationFn` runs after that write, so it
  // must not read the new status back out of the cache.
  const pendingUpdatesRef = useRef(
    new WeakMap<UpdateLibraryItemVariables, PendingLibraryItemUpdate>(),
  )

  return useMutation<
    UpdateLibraryItemResult,
    Error,
    UpdateLibraryItemVariables,
    LibraryItemQuerySnapshot
  >({
    mutationFn: (variables) => {
      const pending = pendingUpdatesRef.current.get(variables)
      pendingUpdatesRef.current.delete(variables)

      const current = pending ? pending.current : variables.libraryItem
      const request = pending
        ? pending.request
        : resolveLibraryItemUpdate(current, toUpdateLibraryItemInput(variables))
      const title = pending?.title ?? libraryItemTitle(current)

      if (!request) {
        if (!current) {
          throw new Error('Library item could not be updated because it is not loaded')
        }

        return Promise.resolve({ libraryItem: current })
      }

      return submitLibraryItemUpdate(variables.libraryItemId, request, title)
    },
    onError: (_error, _variables, context) => {
      restoreLibraryItemQuerySnapshot(queryClient, context)
    },
    onMutate: async (variables) => {
      const snapshot = await snapshotLibraryItemQueries(queryClient)
      const current =
        findCachedLibraryItem(queryClient, variables.libraryItemId) ?? variables.libraryItem
      const request = resolveLibraryItemUpdate(current, toUpdateLibraryItemInput(variables))

      pendingUpdatesRef.current.set(variables, {
        current,
        request,
        title: libraryItemTitle(current),
      })

      if (request) {
        applyOptimisticLibraryItemUpdate(queryClient, variables.libraryItemId, request)
      }

      return snapshot
    },
    onSettled: (_data, _error, variables) => {
      pendingUpdatesRef.current.delete(variables)
      invalidateAfterLibraryMutation(queryClient)
    },
  })
}

// Populated media title for toasts. An id-only relation has no title.
function libraryItemTitle(item: LibraryItem | undefined): string | undefined {
  if (!item) {
    return undefined
  }

  return getMediaFromLibraryItem(item)?.title
}

// Toast copy for a status change, a notes change, or both.
function libraryItemUpdateToast(request: UpdateLibraryItemInput, title: string | undefined) {
  const label = title ?? 'This title'
  const changesStatus = request.status !== undefined
  const changesNotes = request.personalNotes !== undefined

  if (changesStatus && changesNotes) {
    return {
      error: {
        description: 'There was an error updating this title. Please try again.',
        message: 'Error Updating Library',
      },
      loading: 'Saving changes...',
      success: {
        description: `${label} has been updated.`,
        message: 'Library Updated',
      },
    }
  }

  if (changesNotes) {
    return {
      error: {
        description: 'There was an error saving your notes. Please try again.',
        message: 'Error Saving Notes',
      },
      loading: 'Saving notes...',
      success: {
        description:
          request.personalNotes == null
            ? `Notes for ${label} have been cleared.`
            : `Notes for ${label} have been saved.`,
        message: 'Notes Saved',
      },
    }
  }

  const statusLabel = request.status ? MEDIA_STATUS_LABELS[request.status] : 'updated'

  return {
    error: {
      description: 'There was an error updating this status. Please try again.',
      message: 'Error Updating Status',
    },
    loading: 'Updating status...',
    success: {
      description: `${label} is now ${statusLabel}.`,
      message: 'Status Updated',
    },
  }
}

// Shows the update toast and sends the resolved body.
function submitLibraryItemUpdate(
  libraryItemId: number | string,
  request: UpdateLibraryItemInput,
  title: string | undefined,
): Promise<UpdateLibraryItemResult> {
  return toast
    .promise(patchLibraryItem(libraryItemId, request), libraryItemUpdateToast(request, title))
    .unwrap()
}

// Copies the editable fields into the update body. Omitted fields stay unchanged.
function toUpdateLibraryItemInput(variables: UpdateLibraryItemVariables): UpdateLibraryItemInput {
  return {
    ...(variables.personalNotes !== undefined ? { personalNotes: variables.personalNotes } : {}),
    ...(variables.status !== undefined ? { status: variables.status } : {}),
  }
}
