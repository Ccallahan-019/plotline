'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'

import type { DashboardSummary, DashboardSummaryFilters } from '../types'

import { fetchDashboardSummary } from '../services/fetch-dashboard-summary'
import { dashboardQueryKeys } from '../services/query-keys'

type UseDashboardSummaryOptions = {
  initialData?: DashboardSummary
  keepPrevious?: boolean
}

/**
 * Loads the dashboard year summary.
 *
 * `initialData` is used only when its year and timezone match `filters`, so a
 * server prefetch for another year is not shown under the wrong key.
 *
 * @param filters - Calendar year and IANA timezone sent to the summary BFF
 * @param options.initialData - Server-prefetched summary for these filters
 * @param options.keepPrevious - When true, the last summary stays visible while another year loads
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
    placeholderData: options?.keepPrevious ? keepPreviousData : undefined,
    queryFn: () => fetchDashboardSummary(filters),
    queryKey: dashboardQueryKeys.summary(filters),
  })
}
