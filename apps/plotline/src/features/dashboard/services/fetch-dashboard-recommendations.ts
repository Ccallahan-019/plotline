import { fetchJson } from '@/lib/api/fetch-json'

import type { DashboardRecommendations } from '../types'

/**
 * Loads recommendation seeds and up to four posters.
 *
 * @returns An empty seed list when the profile has nothing to recommend from
 */
export function fetchDashboardRecommendations(): Promise<DashboardRecommendations> {
  return fetchJson<DashboardRecommendations>('/api/dashboard/recommendations')
}
