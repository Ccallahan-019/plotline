import type { MediaType } from '@plotline/shared/constants'

import { monthDayLabel, parseCalendarDateKey } from './calendar'

/** January through December, used by the monthly chart and heatmap. */
export const DASHBOARD_MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const

/**
 * Title page path for a poster or row on the dashboard.
 *
 * @param mediaType - `movie` or `tv`
 * @param tmdbId - TMDB id
 * @returns The `/dashboard/title/...` href
 */
export function dashboardTitleHref(mediaType: MediaType, tmdbId: number): string {
  return `/dashboard/title/${mediaType}/${tmdbId}`
}

/**
 * Clock time for an activity row in the viewer's zone.
 *
 * @param iso - Event timestamp
 * @param timeZone - IANA zone for the clock
 * @returns A short time such as `3:04 PM`, or an empty string when `iso` is not a date
 */
export function formatActivityClock(iso: string, timeZone: string): string {
  const time = Date.parse(iso)

  if (Number.isNaN(time)) {
    return ''
  }

  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone,
  })
    .format(time)
    .replace(/[\u202f\u00a0]/g, ' ')
}

/**
 * Integer count with thousands separators.
 *
 * @param value - Count to show
 * @returns The `en-US` grouped number
 */
export function formatDashboardCount(value: number): string {
  return new Intl.NumberFormat('en-US').format(value)
}

/**
 * Hours rounded to one decimal, without a trailing `.0`.
 *
 * @param value - Hour total from the summary
 * @returns Text such as `5` or `5.5`
 */
export function formatDashboardHours(value: number): string {
  const rounded = Math.round(value * 10) / 10

  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1)
}

/**
 * Groups a count with its noun.
 *
 * @param value - Count to show
 * @param singular - Noun used when `value` is 1
 * @param plural - Noun used otherwise. Defaults to `singular` plus `s`
 * @returns Text such as `1 day` or `4 days`
 */
export function formatDashboardQuantity(
  value: number,
  singular: string,
  plural = `${singular}s`,
): string {
  return `${formatDashboardCount(value)} ${value === 1 ? singular : plural}`
}

/**
 * Lifetime average, or an em dash when the profile has no reviews.
 *
 * @param value - Average rating, or null
 * @returns One decimal, or `—`
 */
export function formatDashboardRating(value: null | number): string {
  if (value == null) {
    return '—'
  }

  return value.toFixed(1)
}

/**
 * Hover and accessible label for one heatmap day.
 *
 * @param date - `YYYY-MM-DD` key
 * @param count - Titles logged that day
 * @returns Text such as `Oct 4, 2 titles`
 */
export function formatHeatmapDayLabel(date: string, count: number): string {
  const parsed = parseCalendarDateKey(date)
  const day = parsed ? monthDayLabel(parsed) : date
  const titles = count === 1 ? '1 title' : `${formatDashboardCount(count)} titles`

  return `${day}, ${titles}`
}
