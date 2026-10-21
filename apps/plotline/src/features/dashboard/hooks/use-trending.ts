'use client'

import { useQuery } from '@tanstack/react-query'

import { fetchTrendingTitles } from '../services/fetch-trending'
import { trendingQueryKeys } from '../services/query-keys'

const STALE_TIME_MS = 1000 * 60 * 60

/**
 * Loads the mixed weekly trending list.
 *
 * Results stay fresh for about an hour. The query key is not under `dashboard`,
 * so library and review writes do not refetch it.
 *
 * @returns A React Query result for `TrendingTitles`
 */
export function useTrendingTitles() {
  return useQuery({
    queryFn: () => fetchTrendingTitles(),
    queryKey: trendingQueryKeys.week(),
    staleTime: STALE_TIME_MS,
  })
}
