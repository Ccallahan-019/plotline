'use client'

import { useInfiniteQuery } from '@tanstack/react-query'

import type { DashboardActivityFilters, DashboardActivityPage } from '../types'

import { fetchDashboardActivity } from '../services/fetch-dashboard-activity'
import { dashboardQueryKeys, normalizeDashboardActivityFilters } from '../services/query-keys'

type UseDashboardActivityOptions = {
  initialPage?: DashboardActivityPage
  initialQuery?: DashboardActivityFilters
}

/**
 * Loads the activity feed one page at a time.
 *
 * The query key is the kind, media, range, timezone, and limit. The cursor is
 * the page param, so `fetchNextPage` asks for older rows. `initialPage` is used
 * only when `initialQuery` normalizes to the same key and has no cursor.
 *
 * @param filters - Feed filters. `timeZone` is required; other fields have defaults
 * @param options.initialPage - Server-prefetched first page
 * @param options.initialQuery - Filters that produced `initialPage`
 * @returns An infinite query whose pages are `DashboardActivityPage`
 */
export function useDashboardActivity(
  filters: DashboardActivityFilters,
  options?: UseDashboardActivityOptions,
) {
  const initialData =
    options?.initialPage &&
    options.initialQuery &&
    !options.initialQuery.cursor &&
    activityFiltersMatch(filters, options.initialQuery)
      ? { pageParams: [null], pages: [options.initialPage] }
      : undefined

  return useInfiniteQuery({
    getNextPageParam: (lastPage: DashboardActivityPage) => lastPage.nextCursor ?? undefined,
    initialData,
    initialPageParam: null as null | string,
    queryFn: ({ pageParam }) =>
      fetchDashboardActivity({
        ...filters,
        cursor: pageParam ?? undefined,
      }),
    queryKey: dashboardQueryKeys.activity(filters),
  })
}

// True when two filter sets produce the same activity query key.
function activityFiltersMatch(
  left: DashboardActivityFilters,
  right: DashboardActivityFilters,
): boolean {
  const normalizedLeft = normalizeDashboardActivityFilters(left)
  const normalizedRight = normalizeDashboardActivityFilters(right)

  return (
    normalizedLeft.kind === normalizedRight.kind &&
    normalizedLeft.limit === normalizedRight.limit &&
    normalizedLeft.mediaType === normalizedRight.mediaType &&
    normalizedLeft.range === normalizedRight.range &&
    normalizedLeft.timeZone === normalizedRight.timeZone
  )
}
