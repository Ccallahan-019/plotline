import type { DashboardHeatmapDay } from '../types'

import { addCalendarDays, calendarDateKey, parseCalendarDateKey, startOfIsoWeek } from './calendar'
import { DASHBOARD_MONTH_LABELS } from './format-dashboard'

/** One cell in a Monday-start heatmap week. `empty` is a day outside the year. */
export type HeatmapWeekCell = { count: number; date: string; kind: 'day' } | { kind: 'empty' }

/**
 * Heatmap days that logged at least one title.
 *
 * @param days - Year of heatmap cells, in calendar order
 * @returns Days with a positive count, in the same order
 */
export function heatmapDaysWithTitles(days: readonly DashboardHeatmapDay[]): DashboardHeatmapDay[] {
  return days.filter((day) => day.count > 0)
}

/**
 * Month abbreviation for each week column.
 *
 * The label sits on the week that contains the first of the month. Later weeks
 * in that month stay blank so the names do not repeat.
 *
 * @param weeks - Columns from `layoutHeatmapWeeks`
 * @returns One entry per column. Repeats and empty weeks are null
 */
export function heatmapWeekMonthLabels(
  weeks: readonly (readonly HeatmapWeekCell[])[],
): (null | string)[] {
  const labels: (null | string)[] = weeks.map(() => null)
  let previousMonth: null | number = null

  weeks.forEach((week, weekIndex) => {
    for (const cell of week) {
      if (cell.kind !== 'day') {
        continue
      }

      const month = Number(cell.date.slice(5, 7))
      const day = Number(cell.date.slice(8, 10))
      const isMonthStart = day === 1 || previousMonth == null

      if (month !== previousMonth && isMonthStart) {
        labels[weekIndex] = DASHBOARD_MONTH_LABELS[month - 1] ?? null
        previousMonth = month
      }
    }
  })

  return labels
}

/**
 * Lays a year of heatmap days into Monday-start weeks.
 *
 * Leading days before January 1 and trailing days after December 31 are empty
 * so every column is seven rows.
 *
 * @param days - Heatmap cells, normally January 1 through December 31
 * @returns Week columns from the Monday of the first day through the week of the last day
 */
export function layoutHeatmapWeeks(days: readonly DashboardHeatmapDay[]): HeatmapWeekCell[][] {
  const firstDay = days[0]
  const lastDay = days.at(-1)
  const first = firstDay ? parseCalendarDateKey(firstDay.date) : null

  if (!first || !lastDay) {
    return []
  }

  const counts = new Map(days.map((day) => [day.date, day.count]))
  const weeks: HeatmapWeekCell[][] = []
  let cursor = startOfIsoWeek(first)

  while (weeks.length < 54) {
    const week: HeatmapWeekCell[] = []

    for (let index = 0; index < 7; index += 1) {
      const date = calendarDateKey(cursor)
      const count = counts.get(date)

      week.push(count == null ? { kind: 'empty' } : { count, date, kind: 'day' })
      cursor = addCalendarDays(cursor, 1)
    }

    weeks.push(week)

    if (week.some((cell) => cell.kind === 'day' && cell.date === lastDay.date)) {
      break
    }
  }

  return weeks
}
