import type { MediaType } from '@plotline/shared/constants'
import type { TmdbSearchResponse } from '@plotline/shared/tmdb'

/**
 * Rewrites the paging totals to describe only the results this route returns.
 *
 * The route serves page 1 and has no way to request another, so TMDB's own totals would
 * advertise pages that cannot be fetched.
 *
 * @param page - Recommendations or similar page chosen for the tab
 * @returns The same page reported as the only page, with `total_results` equal to its length
 */
export function asSinglePage(page: TmdbSearchResponse): TmdbSearchResponse {
  return {
    ...page,
    page: 1,
    total_pages: page.results.length > 0 ? 1 : 0,
    total_results: page.results.length,
  }
}

/**
 * Chooses the similar-tab page.
 *
 * Recommendations are used when they include any title. Similar titles are loaded
 * only when that list is empty. A failure from either call is left for the route to map.
 *
 * @param recommendations - Page 1 from the TMDB recommendations endpoint
 * @param loadSimilar - Loads page 1 from the TMDB similar endpoint. Called only when `recommendations` has no results
 * @returns The recommendations page, or the similar page when recommendations are empty
 */
export async function selectSimilarPage(
  recommendations: TmdbSearchResponse,
  loadSimilar: () => Promise<TmdbSearchResponse>,
): Promise<TmdbSearchResponse> {
  if (recommendations.results.length > 0) {
    return recommendations
  }

  return loadSimilar()
}

/**
 * Copies a similar-tab page with `media_type` set on every result.
 *
 * Recommendations and similar responses omit `media_type`. The poster grid drops items
 * that lack it, so the route param is stamped on before the response is sent.
 *
 * @param page - Recommendations or similar page chosen for the tab
 * @param mediaType - `movie` or `tv` from the request path
 * @returns The same page with `media_type` set from `mediaType` on each result
 */
export function withSimilarMediaType(
  page: TmdbSearchResponse,
  mediaType: MediaType,
): TmdbSearchResponse {
  return {
    ...page,
    results: page.results.map((result) => ({
      ...result,
      media_type: mediaType,
    })),
  }
}
