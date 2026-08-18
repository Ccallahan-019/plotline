import type { TmdbTvSeasonDetails } from '@plotline/shared/tmdb'

import { useQuery } from '@tanstack/react-query'

import { fetchTvSeasonEpisodes } from '../services/fetch-tv-season-episodes'

const STALE_TIME_MS = 1000 * 60 * 60

type UseTvSeasonEpisodesOptions = {
  enabled?: boolean
}

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
