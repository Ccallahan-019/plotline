import type { MediaType } from '@plotline/shared/constants'

import type {
  DashboardActivityFilterKind,
  DashboardActivityRow,
  DashboardHeatmap,
  DashboardHeatmapDay,
} from '../types'

import { monthDayLabel, parseCalendarDateKey } from './calendar'
import { formatDashboardCount, formatDashboardQuantity } from './format-dashboard'

/** Preset ranges for the activity time menu. A calendar day is added only while one is selected. */
export const ACTIVITY_RANGE_OPTIONS = [
  { label: 'Last 7 Days', value: '7d' },
  { label: 'Last 30 Days', value: '30d' },
  { label: 'Last 90 Days', value: '90d' },
  { label: 'This Year', value: 'year' },
  { label: 'All Time', value: 'all' },
] as const satisfies readonly { label: string; value: string }[]

export type ActivityRangeOption = { label: string; value: string }

/** One labeled figure under the viewing-year heatmap. */
export type HeatmapFooterFigure = {
  label: string
  value: string
}

type ActivityRowCopy = Pick<DashboardActivityRow, 'detail' | 'filterKind'>

/**
 * Fill percent for a challenge snapshot, from 0 through 100.
 *
 * Reads the row's structured progress, which may be in decimal hours. The bar
 * caps at full when the snapshot is already past the goal.
 *
 * @param row.filterKind - Row kind after classification
 * @param row.progress - Completed and goal from the challenge snapshot
 * @returns The capped percent, or null when the row has no usable goal
 */
export function activityChallengePercent(
  row: Pick<DashboardActivityRow, 'filterKind' | 'progress'>,
): null | number {
  const progress = row.filterKind === 'challenge' ? row.progress : null

  if (!progress || !Number.isFinite(progress.completed) || !(progress.goal > 0)) {
    return null
  }

  return Math.min(100, (progress.completed / progress.goal) * 100)
}

/**
 * Film or TV badge text for an activity row.
 *
 * @param mediaType - `movie` or `tv`
 * @returns `Film` or `TV`
 */
export function activityMediaTypeLabel(mediaType: MediaType): 'Film' | 'TV' {
  return mediaType === 'movie' ? 'Film' : 'TV'
}

/**
 * Range menu entries for the current feed range.
 *
 * A selected calendar day is listed first so the control can show it. Preset
 * ranges omit that entry, which is how choosing a preset clears the day.
 *
 * @param range - Preset (`30d`, `year`, …) or a `YYYY-MM-DD` key
 * @returns Options for the time-range select
 */
export function activityRangeOptions(range: string): ActivityRangeOption[] {
  const day = activitySelectedDay(range)

  if (!day) {
    return [...ACTIVITY_RANGE_OPTIONS]
  }

  return [{ label: formatActivityDayRange(day), value: day }, ...ACTIVITY_RANGE_OPTIONS]
}

/**
 * Text beside the kind label.
 *
 * A challenge uses its name and the completed/goal fraction (`Form Check · 1 / 5`).
 * The goal wording and year stay off the row. Every other kind uses the title.
 *
 * @param row.filterKind - Row kind after classification
 * @param row.progress - Challenge fraction, such as `1 / 5`, when the row has one
 * @param row.title - Challenge, milestone, or media title
 * @returns The headline after the kind label
 */
export function activityRowHeadline(
  row: Pick<DashboardActivityRow, 'filterKind' | 'progress' | 'title'>,
): string {
  if (row.filterKind !== 'challenge' || !row.progress) {
    return row.title
  }

  return `${row.title} · ${row.progress.label}`
}

/**
 * Stars render on rated and reviewed rows that stored a rating.
 *
 * Watched rows keep a rating for other surfaces, and this feed does not draw
 * empty stars for them.
 *
 * @param row.filterKind - Row kind after classification
 * @param row.rating - Stored rating, or null when the row has none
 * @returns Whether the activity row shows stars
 */
export function activityRowShowsRating(row: {
  filterKind: DashboardActivityFilterKind
  rating: null | number
}): boolean {
  return row.rating != null && (row.filterKind === 'rated' || row.filterKind === 'reviewed')
}

/**
 * Muted line under a watch, rating, or review.
 *
 * Episode copy such as `S2 · E4` stays here. A challenge keeps its name on the
 * title line, and a milestone has no second line.
 *
 * @param row.detail - Episode line, or null when the row has none
 * @param row.filterKind - Row kind after classification
 * @returns The second line, or null when the row should not show one
 */
export function activityRowSubtitle(row: ActivityRowCopy): null | string {
  if (row.filterKind !== 'rated' && row.filterKind !== 'reviewed' && row.filterKind !== 'watched') {
    return null
  }

  return row.detail
}

/**
 * The feed range when it is one calendar day.
 *
 * @param range - Preset (`30d`, `year`, …) or a `YYYY-MM-DD` key
 * @returns The day key, or null when `range` is a preset or not a real date
 */
export function activitySelectedDay(range: string): null | string {
  return parseCalendarDateKey(range) ? range : null
}

/**
 * Trigger label for a one-day activity range.
 *
 * @param range - `YYYY-MM-DD` key
 * @returns Text such as `Oct 12, 2026`, or `range` when it is not a real date
 */
export function formatActivityDayRange(range: string): string {
  const date = parseCalendarDateKey(range)

  if (!date) {
    return range
  }

  return `${monthDayLabel(date)}, ${date.year}`
}

/**
 * Footer figures for the viewing-year heatmap.
 *
 * @param heatmap - Year heatmap from the summary
 * @returns Active days, longest streak, busiest day, and titles this year
 */
export function heatmapFooterFigures(heatmap: DashboardHeatmap): HeatmapFooterFigure[] {
  return [
    { label: 'Active Days', value: formatDashboardCount(heatmap.activeDays) },
    { label: 'Longest Streak', value: formatDashboardQuantity(heatmap.longestStreak, 'day') },
    { label: 'Busiest Day', value: formatHeatmapBusiestDay(heatmap.busiestDay) },
    { label: 'Titles This Year', value: formatDashboardCount(heatmap.titlesThisYear) },
  ]
}

// Month and day of the busiest heatmap day, or an em dash when the year has no titles.
function formatHeatmapBusiestDay(day: DashboardHeatmapDay | null): string {
  if (!day) {
    return '—'
  }

  const date = parseCalendarDateKey(day.date)

  return date ? monthDayLabel(date) : '—'
}
