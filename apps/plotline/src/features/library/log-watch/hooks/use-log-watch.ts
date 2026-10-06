import type { LibraryItem } from '@plotline/payload-types'
import type { QueryKey } from '@tanstack/react-query'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { LibraryItemsResponse } from '../../library-grid/types'
import type { LogWatchInput, LogWatchResult } from '../../types/mutations'

import { invalidateAfterLibraryMutation } from '../../services/invalidate-library-queries'
import { postLogWatch } from '../services/fetch-log-watch'
import {
  cachedWatchedEpisodeKeys,
  patchLibraryItemFromLogWatch,
} from '../services/optimistic-library-item'

type LogWatchContext = {
  previousGridItems: ReadonlyArray<readonly [QueryKey, LibraryItemsResponse | undefined]>
  previousLookupItems: ReadonlyArray<readonly [QueryKey, LibraryItem[] | undefined]>
}

/**
 * Mutation that logs a single movie or TV-episode watch.
 *
 * Optimistically patches matching library-item status, movie `progress.watched` /
 * `rewatchCount` (when the cached item is already watched or completed), and TV progress
 * in the grid and lookup caches. `episodesWatched` increases only for pairs missing from
 * the watched-episodes cache and not repeated in this payload. A completed show does not
 * increase the count. Rolls those writes back on error and invalidates library queries
 * when the request settles.
 *
 * @returns A React Query mutation for `LogWatchInput` → `LogWatchResult`
 */
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

      queryClient.setQueriesData<LibraryItemsResponse>(
        { queryKey: ['library-items', 'grid'] },
        (response) => {
          if (!response) {
            return response
          }

          return {
            ...response,
            docs: response.docs.map((item) =>
              patchLibraryItemFromLogWatch(
                item,
                input,
                cachedWatchedEpisodeKeys(queryClient, item.id),
              ),
            ),
          }
        },
      )

      queryClient.setQueriesData<LibraryItem[]>(
        { queryKey: ['library-items', 'lookup'] },
        (items) =>
          items?.map((item) =>
            patchLibraryItemFromLogWatch(item, input, cachedWatchedEpisodeKeys(queryClient, item.id)),
          ),
      )

      return { previousGridItems, previousLookupItems }
    },
    onSettled: () => {
      invalidateAfterLibraryMutation(queryClient)
    },
  })
}
