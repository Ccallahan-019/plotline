import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { AddToListInput, AddToListResult } from '../../types/mutations'

import { invalidateAfterLibraryMutation } from '../../services/invalidate-library-queries'
import { postAddToList } from '../services/fetch-add-to-list'

export function useAddToList() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: AddToListInput) => postAddToList(input),
    onSuccess: (result: AddToListResult) => {
      invalidateAfterLibraryMutation(queryClient, {
        watchlistSlug: result.watchlist.slug,
      })
    },
  })
}
