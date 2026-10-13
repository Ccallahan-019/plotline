'use client'

import { useQuery } from '@tanstack/react-query'

import type { DashboardSummary, DashboardSummaryFilters } from '../types'

import { fetchDashboardSummary } from '../services/fetch-dashboard-summary'
import { dashboardQueryKeys } from '../services/query-keys'

type UseDashboardSummaryOptions = {
  initialData?: DashboardSummary
}

/**
 * Loads the dashboard year summary.
 *
 * `initialData` is used only when its year and timezone match `filters`, so a
 * server prefetch for another year is not shown under the wrong key.
 *
 * @param filters - Calendar year and IANA timezone sent to the summary BFF
 * @param options.initialData - Server-prefetched summary for these filters
 * @returns A React Query result for `DashboardSummary`
 */
export function useDashboardSummary(
  filters: DashboardSummaryFilters,
  options?: UseDashboardSummaryOptions,
) {
  const initialData =
    options?.initialData &&
    options.initialData.year === filters.year &&
    options.initialData.timeZone === filters.timeZone
      ? options.initialData
      : undefined

  return useQuery({
    initialData,
    queryFn: () => fetchDashboardSummary(filters),
    queryKey: dashboardQueryKeys.summary(filters),
  })
}
