'use client'

import type { MediaType } from '@plotline/shared/constants'
import type { TmdbSearchResponse } from '@plotline/shared/tmdb'

import { useQuery } from '@tanstack/react-query'

import { fetchTmdbSimilar } from '../services/fetch-tmdb-similar'
import { mediaTitleQueryKeys } from '../services/query-keys'

const STALE_TIME_MS = 1000 * 60 * 60

type UseTmdbSimilarOptions = {
  enabled?: boolean
}

/**
 * Loads similar titles for the title page Similar tab.
 *
 * The query stays off until the tab is selected and `tmdbId` is positive. Results are
 * cached for about an hour.
 *
 * @param mediaType - `movie` or `tv`
 * @param tmdbId - TMDB title id; values that are not positive skip the fetch
 * @param options.enabled - When not `true`, the query does not run even if `tmdbId` is set
 * @returns A React Query result for `TmdbSearchResponse`
 */
export function useTmdbSimilar(
  mediaType: MediaType,
  tmdbId: number,
  options?: UseTmdbSimilarOptions,
) {
  return useQuery<TmdbSearchResponse>({
    enabled: (options?.enabled ?? false) && tmdbId > 0,
    queryFn: () => fetchTmdbSimilar(mediaType, tmdbId),
    queryKey: mediaTitleQueryKeys.tmdbSimilar(mediaType, tmdbId),
    staleTime: STALE_TIME_MS,
  })
}
