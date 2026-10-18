import type { LibraryItem } from '@plotline/payload-types'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { LibraryItemsResponse } from '../../library-grid/types'

import { invalidateAfterLibraryMutation } from '../../services/invalidate-library-queries'
import {
  type LibraryItemQuerySnapshot,
  restoreLibraryItemQuerySnapshot,
  snapshotLibraryItemQueries,
} from '../../services/library-query-snapshot'
import {
  applyOptimisticWatchedEpisodes,
  cachedWatchedEpisodeKeys,
  loggedTvEpisodes,
  restoreWatchedEpisodeQueries,
  type WatchedEpisodeQuerySnapshot,
} from '../services/optimistic-library-item'

type OptimisticLogWatchContext = {
  previousWatchedEpisodes: WatchedEpisodeQuerySnapshot
} & LibraryItemQuerySnapshot

type OptimisticLogWatchVariables = {
  episodes?: ReadonlyArray<{ episode: number; season: number }>
  mediaId: number | string
  tvContext?: {
    episode?: number
    season?: number
  }
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
 * then appends newly logged TV pairs onto loaded watched-episodes caches. Restores those
 * snapshots on error, and invalidates library queries when the request settles.
 *
 * Library rows are patched first so `episodesWatched` still sees the prior key set.
 * The watched-episodes cache is updated after that, so season pips can mark the logged
 * episode watched while the hero already shows the new up-next episode.
 *
 * @param options.mutationFn - Request that performs the log
 * @param options.patchItem - Pure cache patch for one library item
 * @returns A React Query mutation for `TInput` → `TResult`
 */
export function useOptimisticLogWatchMutation<TInput extends OptimisticLogWatchVariables, TResult>({
  mutationFn,
  patchItem,
}: UseOptimisticLogWatchMutationOptions<TInput, TResult>) {
  const queryClient = useQueryClient()

  return useMutation<TResult, Error, TInput, OptimisticLogWatchContext>({
    mutationFn,
    onError: (_error, _input, context) => {
      restoreLibraryItemQuerySnapshot(queryClient, context)
      restoreWatchedEpisodeQueries(queryClient, context?.previousWatchedEpisodes ?? [])
    },
    onMutate: async (input): Promise<OptimisticLogWatchContext> => {
      const snapshot = await snapshotLibraryItemQueries(queryClient)

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

      return {
        ...snapshot,
        previousWatchedEpisodes: applyOptimisticWatchedEpisodes(
          queryClient,
          input.mediaId,
          loggedTvEpisodes(input),
        ),
      }
    },
    onSettled: () => {
      invalidateAfterLibraryMutation(queryClient)
    },
  })
}
