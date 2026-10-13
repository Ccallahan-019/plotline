import type { WatchedEpisodePair } from '@plotline/shared/log-watch'

import { useQuery } from '@tanstack/react-query'

import { fetchWatchedEpisodes } from '../services/fetch-watched-episodes'
import { watchedEpisodeQueryKeys } from '../services/query-keys'

type UseWatchedEpisodesOptions = {
  enabled?: boolean
}

/**
 * Loads unique watched season/episode pairs for a library item.
 *
 * The query stays off until `libraryItemId` is a positive id and `options.enabled`
 * is not `false`. Log-watch enables it for TV titles while the popover or dialog is
 * open. Results are cached under `['library-items', id, 'watched-episodes']`.
 *
 * @param libraryItemId - Library item whose watch events to read; falsy values skip the fetch
 * @param options.enabled - When `false`, the query does not run even if `libraryItemId` is set
 * @returns A React Query result for unique `{ season, episode }` pairs
 */
export function useWatchedEpisodes(
  libraryItemId: null | number | undefined,
  options?: UseWatchedEpisodesOptions,
) {
  const canLoad = libraryItemId != null && libraryItemId > 0

  return useQuery<WatchedEpisodePair[]>({
    enabled: (options?.enabled ?? true) && canLoad,
    queryFn: () => fetchWatchedEpisodes(libraryItemId as number),
    queryKey: watchedEpisodeQueryKeys.forLibraryItem(libraryItemId),
  })
}
