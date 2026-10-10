'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { CreateLibraryItemInput, CreateLibraryItemResult } from '../../types/mutations'

import { invalidateAfterLibraryMutation } from '../../services/invalidate-library-queries'
import { postLibraryItem } from '../services/fetch-library-item'

/**
 * Creates a library item from catalog media.
 *
 * Posts through the library-items BFF. The server upserts media and inserts the
 * row; status defaults to `planned` when omitted. A title already in the library
 * is rejected. On success, refreshes library queries without a watchlist slug.
 *
 * @returns A React Query mutation for `CreateLibraryItemInput` → `CreateLibraryItemResult`
 */
export function useCreateLibraryItem() {
  const queryClient = useQueryClient()

  return useMutation<CreateLibraryItemResult, Error, CreateLibraryItemInput>({
    mutationFn: postLibraryItem,
    onSuccess: () => {
      invalidateAfterLibraryMutation(queryClient)
    },
  })
}
