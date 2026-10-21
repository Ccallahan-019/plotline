'use client'

import { useState } from 'react'

import { calendarDateInTimeZone, recentCalendarYears } from '../services/calendar'
import { useDashboardSummary } from './use-dashboard-summary'

/**
 * Year summary for the viewing-year heatmap under the activity feed.
 *
 * The year starts as the current calendar year in `timeZone`. Changing it loads
 * that summary, and the previous year stays on screen until the next one arrives.
 * Which day filters the feed is owned by the activity filters, not this hook.
 *
 * @param timeZone - IANA zone for the summary request and the default year
 * @returns The summary query state, the selected year, a setter, and the years in the select
 */
export function useActivityViewingYear(timeZone: string) {
  const currentYear = calendarDateInTimeZone(new Date(), timeZone).year
  const [year, setYear] = useState(currentYear)
  const query = useDashboardSummary({ timeZone, year }, { keepPrevious: true })

  return {
    isError: query.isError,
    isFetching: query.isFetching,
    isPending: query.isPending,
    refetch: query.refetch,
    setYear,
    summary: query.data ?? null,
    year,
    years: recentCalendarYears(currentYear),
  }
}
