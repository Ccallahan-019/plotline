import type { LibraryItem } from '@plotline/payload-types'
import type { QueryKey } from '@tanstack/react-query'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { LogWatchInput, LogWatchResult } from '../../types/mutations'
import type { LibraryItemsResponse } from '../types/library-items'

import { invalidateAfterLibraryMutation } from '../../services/invalidate-library-queries'
import { postLogWatch } from '../services/fetch-log-watch'

type LogWatchContext = {
  previousGridItems: ReadonlyArray<readonly [QueryKey, LibraryItemsResponse | undefined]>
  previousLookupItems: ReadonlyArray<readonly [QueryKey, LibraryItem[] | undefined]>
}

export function useLogWatch() {
  const queryClient = useQueryClient()

  return useMutation<LogWatchResult, Error, LogWatchInput, LogWatchContext>({
    mutationFn: (input: LogWatchInput) => postLogWatch(input),
    onError: (_error, _input, context) => {
      if (context?.previousGridItems) {
        for (const [queryKey, data] of context.previousGridItems) {
          queryClient.setQueryData(queryKey, data)
        }
      }

      if (context?.previousLookupItems) {
        for (const [queryKey, data] of context.previousLookupItems) {
          queryClient.setQueryData(queryKey, data)
        }
      }
    },
    onMutate: async (input): Promise<LogWatchContext> => {
      await queryClient.cancelQueries({ queryKey: ['library-items'] })

      const previousGridItems = queryClient
        .getQueriesData<LibraryItemsResponse>({
          queryKey: ['library-items', 'grid'],
        })
        .map(([queryKey, data]) => [queryKey, data] as const)

      const previousLookupItems = queryClient
        .getQueriesData<LibraryItem[]>({
          queryKey: ['library-items', 'lookup'],
        })
        .map(([queryKey, data]) => [queryKey, data] as const)

      if (input.libraryItemStatus) {
        queryClient.setQueriesData<LibraryItemsResponse>(
          { queryKey: ['library-items', 'grid'] },
          (response) => {
            if (!response) {
              return response
            }

            return {
              ...response,
              docs: response.docs.map((item) => updateLibraryItemStatus(item, input)),
            }
          },
        )

        queryClient.setQueriesData<LibraryItem[]>(
          { queryKey: ['library-items', 'lookup'] },
          (items) => items?.map((item) => updateLibraryItemStatus(item, input)),
        )
      }

      return { previousGridItems, previousLookupItems }
    },
    onSettled: () => {
      invalidateAfterLibraryMutation(queryClient)
    },
  })
}

function updateLibraryItemStatus(item: LibraryItem, input: LogWatchInput): LibraryItem {
  if (
    String(item.media) === String(input.mediaId) ||
    (typeof item.media === 'object' && item.media.id === Number(input.mediaId))
  ) {
    return { ...item, status: input.libraryItemStatus! }
  }

  return item
}
