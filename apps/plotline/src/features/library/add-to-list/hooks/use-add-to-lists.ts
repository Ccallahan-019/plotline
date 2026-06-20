import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { AddToListResult } from '../../types/mutations'

import { invalidateAfterLibraryMutation } from '../../services/invalidate-library-queries'
import { postAddToLists } from '../services/fetch-add-to-list'

export function useAddToLists() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: postAddToLists,
    onSuccess: (results: AddToListResult[]) => {
      invalidateAfterLibraryMutation(queryClient, {
        watchlistSlugs: results.map((result) => result.watchlist.slug),
      })
    },
  })
}
