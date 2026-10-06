import type { TmdbTvSeasonDetails } from '@plotline/shared/tmdb'

import { fetchJson } from '@/lib/api/fetch-json'

export function fetchTvSeasonEpisodes(
  tmdbId: number,
  seasonNumber: number,
): Promise<TmdbTvSeasonDetails> {
  return fetchJson<TmdbTvSeasonDetails>(`/api/tmdb/tv/${tmdbId}/season/${seasonNumber}`)
}
