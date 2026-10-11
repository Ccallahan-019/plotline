'use client'

import type { MediaType } from '@plotline/shared/constants'

import { useQuery } from '@tanstack/react-query'

import type { TitleWatchOffers } from '../types'

import { fetchTitleWatchOffers } from '../services/fetch-title-watch-offers'
import { mediaTitleQueryKeys } from '../services/query-keys'

const STALE_TIME_MS = 1000 * 60 * 60

/**
 * Loads streaming, free, ad-supported, rent, and buy offers for a title.
 *
 * The query runs when `tmdbId` is positive and caches the full country map for about
 * an hour. Callers filter that map by region; switching region does not refetch.
 *
 * @param mediaType - `movie` or `tv`
 * @param tmdbId - TMDB title id; values that are not positive skip the fetch
 * @returns A React Query result for `TitleWatchOffers`
 */
export function useTitleWatchOffers(mediaType: MediaType, tmdbId: number) {
  return useQuery<TitleWatchOffers>({
    enabled: tmdbId > 0,
    queryFn: () => fetchTitleWatchOffers(mediaType, tmdbId),
    queryKey: mediaTitleQueryKeys.tmdbWatchOffers(mediaType, tmdbId),
    staleTime: STALE_TIME_MS,
  })
}
