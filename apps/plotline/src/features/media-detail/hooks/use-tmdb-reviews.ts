'use client'

import type { MediaType } from '@plotline/shared/constants'

import { useInfiniteQuery } from '@tanstack/react-query'

import type { TmdbCommunityReviewPage } from '../types'

import { fetchTmdbReviews } from '../services/fetch-tmdb-reviews'
import { mediaTitleQueryKeys } from '../services/query-keys'

const STALE_TIME_MS = 1000 * 60 * 60

/**
 * Loads TMDB community reviews for a title, one page at a time.
 *
 * The query starts when the caller mounts, which the ratings tab does only once it is
 * selected. Each page is cached for about an hour. `fetchNextPage` appends the next TMDB page.
 *
 * @param mediaType - `movie` or `tv`
 * @param tmdbId - TMDB title id
 * @returns An infinite query result whose pages are `TmdbCommunityReviewPage`
 */
export function useTmdbReviews(mediaType: MediaType, tmdbId: number) {
  return useInfiniteQuery({
    enabled: tmdbId > 0,
    getNextPageParam: (lastPage: TmdbCommunityReviewPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
    queryFn: ({ pageParam }) => fetchTmdbReviews(mediaType, tmdbId, pageParam),
    queryKey: mediaTitleQueryKeys.tmdbReviews(mediaType, tmdbId),
    staleTime: STALE_TIME_MS,
  })
}
