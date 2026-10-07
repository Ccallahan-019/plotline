'use client'

import type { LibraryItem } from '@plotline/payload-types'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRef } from 'react'
import { toast } from 'sonner'

import { getLibraryItemTitle } from '@/features/library/services/get-library-item-title'

import type { RemoveLibraryItemResult } from '../../types/mutations'

import { invalidateAfterLibraryMutation } from '../../services/invalidate-library-queries'
import {
  type LibraryItemQuerySnapshot,
  snapshotLibraryItemQueries,
} from '../../services/library-query-snapshot'
import { deleteLibraryItem } from '../services/fetch-library-item'
import {
  applyOptimisticLibraryItemRemoval,
  findCachedLibraryItem,
  revertOptimisticLibraryItemRemoval,
} from '../services/optimistic-library-item'

export type RemoveLibraryItemVariables = {
  /** Row before removal, used for the toast when it is not in the grid or lookup cache. */
  libraryItem?: LibraryItem
  libraryItemId: number | string
}

type PendingLibraryItemRemoval = {
  title: string | undefined
}

/**
 * Removes a library item from the library grid and lookup caches, then deletes it.
 *
 * The server also deletes that item's watch events and watchlist memberships.
 * Those lists refresh when the mutation settles. On error it re-inserts just this
 * row at its old position, leaving other rows' optimistic edits alone, and toasts
 * the request.
 *
 * @returns A React Query mutation for `RemoveLibraryItemVariables` → `RemoveLibraryItemResult`
 */
export function useRemoveLibraryItem() {
  const queryClient = useQueryClient()
  // Captured before the row leaves the cache, which happens before `mutationFn`.
  const pendingRemovalsRef = useRef(
    new WeakMap<RemoveLibraryItemVariables, PendingLibraryItemRemoval>(),
  )

  return useMutation<
    RemoveLibraryItemResult,
    Error,
    RemoveLibraryItemVariables,
    LibraryItemQuerySnapshot
  >({
    mutationFn: (variables) => {
      const pending = pendingRemovalsRef.current.get(variables)
      pendingRemovalsRef.current.delete(variables)
      const title = pending?.title ?? getLibraryItemTitle(variables.libraryItem)

      return toast
        .promise(deleteLibraryItem(variables.libraryItemId), {
          error: {
            description: 'There was an error removing this title. Please try again.',
            message: 'Error Removing Title',
          },
          loading: 'Removing from your library...',
          success: {
            description: title
              ? `${title} has been removed from your library.`
              : 'This title has been removed from your library.',
            message: 'Removed from Library',
          },
        })
        .unwrap()
    },
    onError: (_error, variables, context) => {
      revertOptimisticLibraryItemRemoval(queryClient, context, variables.libraryItemId)
    },
    onMutate: async (variables) => {
      const snapshot = await snapshotLibraryItemQueries(queryClient)
      const current =
        findCachedLibraryItem(queryClient, variables.libraryItemId) ?? variables.libraryItem

      pendingRemovalsRef.current.set(variables, {
        title: getLibraryItemTitle(current),
      })
      applyOptimisticLibraryItemRemoval(queryClient, variables.libraryItemId)

      return snapshot
    },
    onSettled: (_data, _error, variables) => {
      pendingRemovalsRef.current.delete(variables)
      invalidateAfterLibraryMutation(queryClient)
    },
  })
}

