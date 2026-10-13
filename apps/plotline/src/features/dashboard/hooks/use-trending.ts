'use client'

import { useQuery } from '@tanstack/react-query'

import type { TrendingTitles } from '../types'

import { fetchTrendingTitles } from '../services/fetch-trending'
import { trendingQueryKeys } from '../services/query-keys'

const STALE_TIME_MS = 1000 * 60 * 60

type UseTrendingTitlesOptions = {
  initialData?: TrendingTitles
}

/**
 * Loads the mixed weekly trending list.
 *
 * Results stay fresh for about an hour. The query key is not under `dashboard`,
 * so library and review writes do not refetch it.
 *
 * @param options.initialData - Server-prefetched trending list
 * @returns A React Query result for `TrendingTitles`
 */
export function useTrendingTitles(options?: UseTrendingTitlesOptions) {
  return useQuery({
    initialData: options?.initialData,
    queryFn: () => fetchTrendingTitles(),
    queryKey: trendingQueryKeys.week(),
    staleTime: STALE_TIME_MS,
  })
}
