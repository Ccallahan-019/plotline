import type { LibraryItemsQuery } from '@/features/library/library-grid/types'

import type {
  DashboardActivityFilters,
  DashboardActivityKind,
  DashboardActivityMediaType,
  DashboardSummaryFilters,
} from '../types'

export const DASHBOARD_ACTIVITY_DEFAULT_KIND = 'all' as const
export const DASHBOARD_ACTIVITY_DEFAULT_LIMIT = 20
export const DASHBOARD_ACTIVITY_DEFAULT_MEDIA_TYPE = 'all' as const
export const DASHBOARD_ACTIVITY_DEFAULT_RANGE = '30d' as const

/**
 * Library query for continue watching and the overview queue.
 *
 * Status is `watching`, sort is recently watched, and the page is large enough
 * for the hero plus the also-in-progress list.
 */
export const CONTINUE_WATCHING_LIBRARY_QUERY: LibraryItemsQuery = {
  filters: { statuses: ['watching'] },
  page: 1,
  pageSize: 100,
  sort: 'recently-watched',
}

export const dashboardQueryKeys = {
  activity: (filters: DashboardActivityFilters) => {
    const normalized = normalizeDashboardActivityFilters(filters)

    return [
      'dashboard',
      'activity',
      normalized.kind,
      normalized.mediaType,
      normalized.range,
      normalized.timeZone,
      normalized.limit,
    ] as const
  },
  all: ['dashboard'] as const,
  recommendations: () => ['dashboard', 'recommendations'] as const,
  summary: (filters: DashboardSummaryFilters) =>
    ['dashboard', 'summary', filters.year, filters.timeZone] as const,
}

export const trendingQueryKeys = {
  week: () => ['tmdb', 'trending', 'week'] as const,
}

/**
 * True when the feed is still on all activity, all media, and the last 30 days.
 *
 * An empty page in that state means there is no recent activity. Any other
 * combination means the empty page is a filter miss.
 *
 * @param filter.kind - Selected activity kind
 * @param filter.mediaType - Selected media type
 * @param filter.range - Selected time range
 * @returns Whether every filter is still the feed default
 */
export function isDefaultActivityFeedFilter(filter: {
  kind: DashboardActivityKind
  mediaType: DashboardActivityMediaType
  range: string
}): boolean {
  return (
    filter.kind === DASHBOARD_ACTIVITY_DEFAULT_KIND &&
    filter.mediaType === DASHBOARD_ACTIVITY_DEFAULT_MEDIA_TYPE &&
    filter.range === DASHBOARD_ACTIVITY_DEFAULT_RANGE
  )
}

/**
 * Fills the activity filters that participate in the query key.
 *
 * The cursor is not part of the key. Infinite queries keep it as the page param.
 *
 * @param filters - Activity filters from the page, with `timeZone` required
 * @returns Kind, media, range, timezone, and limit with defaults applied
 */
export function normalizeDashboardActivityFilters(filters: DashboardActivityFilters) {
  return {
    kind: filters.kind ?? DASHBOARD_ACTIVITY_DEFAULT_KIND,
    limit: filters.limit ?? DASHBOARD_ACTIVITY_DEFAULT_LIMIT,
    mediaType: filters.mediaType ?? DASHBOARD_ACTIVITY_DEFAULT_MEDIA_TYPE,
    range: filters.range ?? DASHBOARD_ACTIVITY_DEFAULT_RANGE,
    timeZone: filters.timeZone,
  }
}
