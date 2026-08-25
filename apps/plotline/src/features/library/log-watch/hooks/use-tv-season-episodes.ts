import type { TmdbTvSeasonDetails } from '@plotline/shared/tmdb'

import { useQuery } from '@tanstack/react-query'

import { fetchTvSeasonEpisodes } from '../services/fetch-tv-season-episodes'

const STALE_TIME_MS = 1000 * 60 * 60

type UseTvSeasonEpisodesOptions = {
  enabled?: boolean
}

/**
 * Loads TMDB episode titles for a TV season when the log-watch UI is open.
 *
 * The query is disabled until both `tmdbId` and `seasonNumber` are present (and
 * `options.enabled` is not `false`). Cached for about an hour.
 *
 * @param tmdbId - TMDB series id; falsy values skip the fetch
 * @param seasonNumber - Season to load; `null`/`undefined` skip the fetch
 * @param options.enabled - When `false`, the query does not run even if ids are set
 * @returns A React Query result for `TmdbTvSeasonDetails`
 */
export function useTvSeasonEpisodes(
  tmdbId: null | number | undefined,
  seasonNumber: null | number | undefined,
  options?: UseTvSeasonEpisodesOptions,
) {
  const hasIds = tmdbId != null && tmdbId > 0 && seasonNumber != null

  return useQuery<TmdbTvSeasonDetails>({
    enabled: (options?.enabled ?? true) && hasIds,
    queryFn: () => fetchTvSeasonEpisodes(tmdbId as number, seasonNumber as number),
    queryKey: ['tmdb-tv-season', tmdbId, seasonNumber],
    staleTime: STALE_TIME_MS,
  })
}
