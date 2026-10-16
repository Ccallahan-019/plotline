'use client'

import { useState } from 'react'

import type { ActivityRangeValue } from '../components/activity/ActivityFilters'
import type { DashboardActivityKind, DashboardActivityMediaType } from '../types'

import {
  DASHBOARD_ACTIVITY_DEFAULT_KIND,
  DASHBOARD_ACTIVITY_DEFAULT_MEDIA_TYPE,
  DASHBOARD_ACTIVITY_DEFAULT_RANGE,
} from '../services/query-keys'
import { useDashboardActivity } from './use-dashboard-activity'

/**
 * Filter state and pages for the recent-activity feed.
 *
 * Starts on all kinds, all media, and the last 30 days. Changing a filter
 * changes the activity query key, so the feed loads that selection from the start.
 *
 * @param timeZone - IANA zone used for the activity day boundaries
 * @returns The selected filters, their setters, the flattened rows, and the infinite-query status
 */
export function useRecentActivityFeed(timeZone: string) {
  const [kind, setKind] = useState<DashboardActivityKind>(DASHBOARD_ACTIVITY_DEFAULT_KIND)
  const [mediaType, setMediaType] = useState<DashboardActivityMediaType>(
    DASHBOARD_ACTIVITY_DEFAULT_MEDIA_TYPE,
  )
  const [range, setRange] = useState<ActivityRangeValue>(DASHBOARD_ACTIVITY_DEFAULT_RANGE)
  const query = useDashboardActivity({ kind, mediaType, range, timeZone })
  const rows = query.data == null ? null : query.data.pages.flatMap((page) => page.rows)

  return {
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isError: query.isError,
    isFetching: query.isFetching,
    isFetchingNextPage: query.isFetchingNextPage,
    isFetchNextPageError: query.isFetchNextPageError,
    isLoading: query.isLoading,
    kind,
    mediaType,
    range,
    refetch: query.refetch,
    rows,
    setKind,
    setMediaType,
    setRange,
  }
}
