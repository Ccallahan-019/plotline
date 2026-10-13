'use client'

import { useQuery } from '@tanstack/react-query'

import type { DashboardRecommendations } from '../types'

import { fetchDashboardRecommendations } from '../services/fetch-dashboard-recommendations'
import { dashboardQueryKeys } from '../services/query-keys'

type UseDashboardRecommendationsOptions = {
  initialData?: DashboardRecommendations
}

/**
 * Loads recommendation seeds and posters for the overview card.
 *
 * An empty `seeds` list is a successful response: the card stays hidden.
 *
 * @param options.initialData - Server-prefetched recommendation payload
 * @returns A React Query result for `DashboardRecommendations`
 */
export function useDashboardRecommendations(options?: UseDashboardRecommendationsOptions) {
  return useQuery({
    initialData: options?.initialData,
    queryFn: () => fetchDashboardRecommendations(),
    queryKey: dashboardQueryKeys.recommendations(),
  })
}
