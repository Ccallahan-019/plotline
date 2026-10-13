import { buildSearchParams } from '@/lib/api/build-search-params'
import { fetchJson } from '@/lib/api/fetch-json'

import type { DashboardSummary, DashboardSummaryFilters } from '../types'

/**
 * Loads the year summary from the dashboard BFF.
 *
 * @param filters - Calendar year and IANA timezone for day boundaries
 * @returns Titles, hours, streaks, the monthly series, and the heatmap
 */
export function fetchDashboardSummary(filters: DashboardSummaryFilters): Promise<DashboardSummary> {
  return fetchJson<DashboardSummary>(
    `/api/dashboard/summary${buildSearchParams({
      timeZone: filters.timeZone,
      year: filters.year,
    })}`,
  )
}
