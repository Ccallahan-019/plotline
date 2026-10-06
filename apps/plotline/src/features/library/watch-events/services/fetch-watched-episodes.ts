import type { WatchedEpisodePair } from '@plotline/shared/log-watch'

import { buildSearchParams } from '@/lib/api/build-search-params'
import { fetchJson } from '@/lib/api/fetch-json'

/**
 * Fetches unique watched TV episodes for a library item from the Plotline BFF.
 *
 * @param libraryItemId - Library item to read episode coverage for
 * @returns Unique `{ season, episode }` pairs
 */
export function fetchWatchedEpisodes(libraryItemId: number): Promise<WatchedEpisodePair[]> {
  return fetchJson<WatchedEpisodePair[]>(
    `/api/library/watched-episodes${buildSearchParams({ libraryItemId })}`,
  )
}
