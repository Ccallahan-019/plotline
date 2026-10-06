import type { LibraryItem } from '@plotline/payload-types'
import type { QueryKey } from '@tanstack/react-query'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { LibraryItemsResponse } from '../../library-grid/types'

import { invalidateAfterLibraryMutation } from '../../services/invalidate-library-queries'
import { cachedWatchedEpisodeKeys } from '../services/optimistic-library-item'

type OptimisticLogWatchContext = {
  previousGridItems: ReadonlyArray<readonly [QueryKey, LibraryItemsResponse | undefined]>
  previousLookupItems: ReadonlyArray<readonly [QueryKey, LibraryItem[] | undefined]>
}

type UseOptimisticLogWatchMutationOptions<TInput, TResult> = {
  mutationFn: (input: TInput) => Promise<TResult>
  patchItem: (
    item: LibraryItem,
    input: TInput,
    watchedEpisodeKeys: ReadonlySet<string>,
  ) => LibraryItem
}

/**
 * Shared optimistic flow for single and batch log-watch mutations.
 *
 * Cancels in-flight library queries, snapshots the grid and lookup caches, applies
 * `patchItem` to every cached library item (with that item's cached watched-episode keys),
 * restores the snapshots on error, and invalidates library queries when the request settles.
 *
 * @param options.mutationFn - Request that performs the log
 * @param options.patchItem - Pure cache patch for one library item
 * @returns A React Query mutation for `TInput` → `TResult`
 */
export function useOptimisticLogWatchMutation<TInput, TResult>({
  mutationFn,
  patchItem,
}: UseOptimisticLogWatchMutationOptions<TInput, TResult>) {
  const queryClient = useQueryClient()

  return useMutation<TResult, Error, TInput, OptimisticLogWatchContext>({
    mutationFn,
    onError: (_error, _input, context) => {
      for (const [queryKey, data] of context?.previousGridItems ?? []) {
        queryClient.setQueryData(queryKey, data)
      }

      for (const [queryKey, data] of context?.previousLookupItems ?? []) {
        queryClient.setQueryData(queryKey, data)
      }
    },
    onMutate: async (input): Promise<OptimisticLogWatchContext> => {
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

      const patch = (item: LibraryItem) =>
        patchItem(item, input, cachedWatchedEpisodeKeys(queryClient, item.id))

      queryClient.setQueriesData<LibraryItemsResponse>(
        { queryKey: ['library-items', 'grid'] },
        (response) => (response ? { ...response, docs: response.docs.map(patch) } : response),
      )

      queryClient.setQueriesData<LibraryItem[]>(
        { queryKey: ['library-items', 'lookup'] },
        (items) => items?.map(patch),
      )

      return { previousGridItems, previousLookupItems }
    },
    onSettled: () => {
      invalidateAfterLibraryMutation(queryClient)
    },
  })
}
