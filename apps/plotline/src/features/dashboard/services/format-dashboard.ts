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

/** Full month names for the titles-per-month tooltip. */
const DASHBOARD_MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const

/** Current-month bar. Other months stay at 35% so the highlight reads. */
const TITLES_PER_MONTH_FILL = 'var(--primary)'

const TITLES_PER_MONTH_FILL_MUTED = 'color-mix(in oklab, var(--primary) 35%, transparent)'

/** Pixel height for a month with no logged titles. */
const EMPTY_MONTH_BAR_HEIGHT = 3

type SparklinePoint = {
  index: number
  value: number
}

type TitlesPerMonthBar = {
  count: number
  fill: string
  month: string
}

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
 * @returns A short time such as `3:04 pm`, or an empty string when `iso` is not a date
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
    .toLowerCase()
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

// First letter of a month name, for the titles-per-month axis (`J`–`D`).
export function monthAxisLetter(month: unknown): string {
  return typeof month === 'string' && month.length > 0 ? month.slice(0, 1) : ''
}

/**
 * Area points for a stat sparkline, in series order.
 *
 * @param series - Monthly values, January first
 * @returns Indexed points the area chart plots
 */
export function sparklinePoints(series: readonly number[]): SparklinePoint[] {
  return series.map((value, index) => ({ index, value }))
}

/**
 * Bar points for the titles-per-month chart.
 *
 * When `highlightMonth` is set, that month uses a stronger fill and the rest
 * stay muted. When it is null, every bar uses the stronger fill.
 *
 * @param counts - Monthly title counts, January first
 * @param highlightMonth - Current month index, or null when the year is not this year
 * @returns One bar per count, with the month name and its fill
 */
export function titlesPerMonthBars(
  counts: readonly number[],
  highlightMonth: null | number,
): TitlesPerMonthBar[] {
  return counts.map((count, index) => ({
    count,
    fill:
      highlightMonth == null || index === highlightMonth
        ? TITLES_PER_MONTH_FILL
        : TITLES_PER_MONTH_FILL_MUTED,
    month: DASHBOARD_MONTH_NAMES[index] ?? '',
  }))
}

/**
 * Minimum bar height for one titles-per-month value.
 *
 * Recharts omits a bar whose height is 0, so an empty month disappears.
 * Empty months get a short stub. A positive count returns 0 so the bar keeps its scaled height.
 *
 * @param value - Title count for the month
 * @returns Pixel `minPointSize` for that bar
 */
export function titlesPerMonthMinPointSize(value: null | number | undefined): number {
  return value == null || value <= 0 ? EMPTY_MONTH_BAR_HEIGHT : 0
}
