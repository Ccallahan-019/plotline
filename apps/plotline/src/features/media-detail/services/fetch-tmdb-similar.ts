import type { MediaType } from '@plotline/shared/constants'
import type { TmdbSearchResponse } from '@plotline/shared/tmdb'

import { fetchJson } from '@/lib/api/fetch-json'

/**
 * Loads the similar-titles page for one TMDB title.
 *
 * The BFF prefers recommendations and falls back to similar only when that list is empty.
 *
 * @param mediaType - `movie` or `tv`
 * @param tmdbId - TMDB title id
 * @returns A `TmdbSearchResponse` whose results include `media_type`
 */
export function fetchTmdbSimilar(
  mediaType: MediaType,
  tmdbId: number,
): Promise<TmdbSearchResponse> {
  return fetchJson<TmdbSearchResponse>(`/api/tmdb/${mediaType}/${tmdbId}/similar`)
}
