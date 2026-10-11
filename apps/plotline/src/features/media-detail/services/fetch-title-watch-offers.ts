import type { MediaType } from '@plotline/shared/constants'

import { fetchJson } from '@/lib/api/fetch-json'

import type { TitleWatchOffers } from '../types'

/**
 * Loads the country map of watch offers for one TMDB title.
 *
 * @param mediaType - `movie` or `tv`
 * @param tmdbId - TMDB title id
 * @returns Offer groups keyed by country code
 */
export function fetchTitleWatchOffers(
  mediaType: MediaType,
  tmdbId: number,
): Promise<TitleWatchOffers> {
  return fetchJson<TitleWatchOffers>(`/api/tmdb/${mediaType}/${tmdbId}/watch-providers`)
}
