'use client'

import { useQuery } from '@tanstack/react-query'

import { fetchDashboardRecommendations } from '../services/fetch-dashboard-recommendations'
import { dashboardQueryKeys } from '../services/query-keys'

/**
 * Loads recommendation seeds and posters for the overview card.
 *
 * An empty `seeds` list is a successful response: the card stays hidden.
 *
 * @returns A React Query result for `DashboardRecommendations`
 */
export function useDashboardRecommendations() {
  return useQuery({
    queryFn: () => fetchDashboardRecommendations(),
    queryKey: dashboardQueryKeys.recommendations(),
  })
}
