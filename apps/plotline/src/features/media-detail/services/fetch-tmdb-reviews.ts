import type { MediaType } from '@plotline/shared/constants'

import { fetchJson } from '@/lib/api/fetch-json'

import type { TmdbCommunityReviewPage } from '../types'

/**
 * Loads one page of TMDB community reviews for a title.
 *
 * @param mediaType - `movie` or `tv`
 * @param tmdbId - TMDB title id
 * @param page - 1-based page
 * @returns The mapped review page
 */
export function fetchTmdbReviews(
  mediaType: MediaType,
  tmdbId: number,
  page: number,
): Promise<TmdbCommunityReviewPage> {
  return fetchJson<TmdbCommunityReviewPage>(`/api/tmdb/${mediaType}/${tmdbId}/reviews?page=${page}`)
}
