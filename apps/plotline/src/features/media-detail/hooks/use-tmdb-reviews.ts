'use client'

import type { MediaType } from '@plotline/shared/constants'

import { useInfiniteQuery } from '@tanstack/react-query'

import type { TmdbCommunityReviewPage } from '../types'

import { fetchTmdbReviews } from '../services/fetch-tmdb-reviews'
import { mediaTitleQueryKeys } from '../services/query-keys'

const STALE_TIME_MS = 1000 * 60 * 60

type UseTmdbReviewsOptions = {
  enabled?: boolean
}

/**
 * Loads TMDB community reviews for a title, one page at a time.
 *
 * The query stays off until the ratings tab is selected. Each page is cached
 * for about an hour. `fetchNextPage` appends the next TMDB page.
 *
 * @param mediaType - `movie` or `tv`
 * @param tmdbId - TMDB title id
 * @param options.enabled - When `false`, the query does not run
 * @returns An infinite query result whose pages are `TmdbCommunityReviewPage`
 */
export function useTmdbReviews(
  mediaType: MediaType,
  tmdbId: number,
  options?: UseTmdbReviewsOptions,
) {
  return useInfiniteQuery({
    enabled: (options?.enabled ?? true) && tmdbId > 0,
    getNextPageParam: (lastPage: TmdbCommunityReviewPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
    queryFn: ({ pageParam }) => fetchTmdbReviews(mediaType, tmdbId, pageParam),
    queryKey: mediaTitleQueryKeys.tmdbReviews(mediaType, tmdbId),
    staleTime: STALE_TIME_MS,
  })
}
