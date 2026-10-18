import type { LogWatchBatchInput, LogWatchBatchResult } from '../../types/mutations'

import { postLogWatchBatch } from '../services/fetch-log-watch-batch'
import { patchLibraryItemFromBatch } from '../services/optimistic-library-item'
import { useOptimisticLogWatchMutation } from './use-optimistic-log-watch-mutation'

/**
 * Mutation that logs multiple TV episodes in one request.
 *
 * Optimistically patches matching library-item status and TV progress (`lastSeason`,
 * `lastEpisode`, `episodesWatched`) in the grid and lookup caches. Loaded watched-episodes
 * caches also gain the logged pairs, so season pips match the new up-next episode before
 * the refetch. `episodesWatched` increases only for pairs missing from that cache and not
 * repeated in this payload. A completed show does not increase the count. Rolls those
 * writes back on error and invalidates library queries when the request settles.
 *
 * @returns A React Query mutation for `LogWatchBatchInput` → `LogWatchBatchResult`
 */
export function useLogWatchBatch() {
  return useOptimisticLogWatchMutation<LogWatchBatchInput, LogWatchBatchResult>({
    mutationFn: postLogWatchBatch,
    patchItem: patchLibraryItemFromBatch,
  })
}
