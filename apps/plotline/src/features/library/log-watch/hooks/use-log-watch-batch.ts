import type { LibraryItem } from '@plotline/payload-types'
import type { QueryKey } from '@tanstack/react-query'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { LibraryItemsResponse } from '../../library-grid/types'
import type { LogWatchBatchInput, LogWatchBatchResult } from '../../types/mutations'

import { invalidateAfterLibraryMutation } from '../../services/invalidate-library-queries'
import { postLogWatchBatch } from '../services/fetch-log-watch-batch'
import { patchLibraryItemFromBatch } from '../services/optimistic-library-item'

type LogWatchBatchContext = {
  previousGridItems: ReadonlyArray<readonly [QueryKey, LibraryItemsResponse | undefined]>
  previousLookupItems: ReadonlyArray<readonly [QueryKey, LibraryItem[] | undefined]>
}

/**
 * Mutation that logs multiple TV episodes in one request.
 *
 * Optimistically patches matching library-item status and TV progress (`lastSeason`,
 * `lastEpisode`, `episodesWatched`) in the grid and lookup caches, rolls those writes
 * back on error, and invalidates library queries when the request settles.
 *
 * @returns A React Query mutation for `LogWatchBatchInput` → `LogWatchBatchResult`
 */
export function useLogWatchBatch() {
  const queryClient = useQueryClient()

  return useMutation<LogWatchBatchResult, Error, LogWatchBatchInput, LogWatchBatchContext>({
    mutationFn: (input: LogWatchBatchInput) => postLogWatchBatch(input),
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
    onMutate: async (input): Promise<LogWatchBatchContext> => {
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

      queryClient.setQueriesData<LibraryItemsResponse>(
        { queryKey: ['library-items', 'grid'] },
        (response) => {
          if (!response) {
            return response
          }

          return {
            ...response,
            docs: response.docs.map((item) => patchLibraryItemFromBatch(item, input)),
          }
        },
      )

      queryClient.setQueriesData<LibraryItem[]>(
        { queryKey: ['library-items', 'lookup'] },
        (items) => items?.map((item) => patchLibraryItemFromBatch(item, input)),
      )

      return { previousGridItems, previousLookupItems }
    },
    onSettled: () => {
      invalidateAfterLibraryMutation(queryClient)
    },
  })
}
