import type { LogWatchInput, LogWatchResult } from '../../types/mutations'

import { postLogWatch } from '../services/fetch-log-watch'
import { patchLibraryItemFromLogWatch } from '../services/optimistic-library-item'
import { useOptimisticLogWatchMutation } from './use-optimistic-log-watch-mutation'

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
  return useOptimisticLogWatchMutation<LogWatchInput, LogWatchResult>({
    mutationFn: postLogWatch,
    patchItem: patchLibraryItemFromLogWatch,
  })
}
