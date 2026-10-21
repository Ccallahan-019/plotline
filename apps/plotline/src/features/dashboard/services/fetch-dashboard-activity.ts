import { buildSearchParams } from '@/lib/api/build-search-params'
import { fetchJson } from '@/lib/api/fetch-json'

import type { DashboardActivityFilters, DashboardActivityPage } from '../types'

import { normalizeDashboardActivityFilters } from './query-keys'

/**
 * Loads one page of the activity feed.
 *
 * @param filters - Kind, media, range, timezone, limit, and the cursor for older rows
 * @returns The page of rows and the cursor for the next page
 */
export function fetchDashboardActivity(
  filters: DashboardActivityFilters,
): Promise<DashboardActivityPage> {
  const normalized = normalizeDashboardActivityFilters(filters)

  return fetchJson<DashboardActivityPage>(
    `/api/dashboard/activity${buildSearchParams({
      cursor: filters.cursor,
      kind: normalized.kind,
      limit: normalized.limit,
      mediaType: normalized.mediaType,
      range: normalized.range,
      timeZone: normalized.timeZone,
    })}`,
  )
}
