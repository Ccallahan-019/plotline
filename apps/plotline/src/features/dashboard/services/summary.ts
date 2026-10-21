import type { WatchEventType } from '@plotline/shared/constants'

import type { DashboardHeatmapDay, DashboardSummary, DashboardTitlesPerMonth } from '../types'

import {
  addCalendarDays,
  type CalendarDate,
  calendarDateInTimeZone,
  calendarDateKey,
  calendarDaysInYear,
} from './calendar'

const MONTHS_IN_YEAR = 12

const TITLE_AND_HOUR_EVENT_TYPES = new Set<WatchEventType>([
  'completed',
  'progress',
  'rewatched',
  'started',
])

export type BuildDashboardSummaryInput = {
  challengesCompleted: number
  events: readonly SummaryWatchEvent[]
  filmsCompleted: number
  now: Date
  reviews: readonly SummaryReview[]
  timeZone: string
  year: number
}

/** Review fields the lifetime average and its monthly series read. */
export type SummaryReview = {
  rating: number
  updatedAt: string
}

/** Watch event fields the year summary reads. */
export type SummaryWatchEvent = {
  eventType: WatchEventType
  mediaId: number
  runtimeMinutes?: null | number
  watchedAt: string
}

/**
 * Builds the dashboard year summary from watch events, reviews, and lifetime counts.
 *
 * Titles and hours count `started`, `progress`, `completed`, and `rewatched` events.
 * A title logged twice in the year counts once in the year total and once in each
 * month it was logged. Missing runtimes count as zero hours. Streaks and active days
 * count every watch event, including dropped and on hold. A heatmap cell counts the
 * distinct titles with an event that day, so three episodes of one series count as 1. The current streak and the
 * lifetime hour total may use events outside `year`. The rating headline is the
 * lifetime mean; its series is the mean of reviews updated in each month of `year`.
 *
 * @param input.challengesCompleted - Enabled challenges whose stats status is `completed`
 * @param input.events - Watch events for the profile, including years other than `year`
 * @param input.filmsCompleted - Library items with status `completed` and movie progress
 * @param input.now - Instant used for the current streak and the highlighted month
 * @param input.reviews - Profile reviews; the headline average is lifetime
 * @param input.timeZone - IANA zone for day and month boundaries
 * @param input.year - Calendar year the headline stats, heatmap, and monthly series cover
 * @returns Stats, streaks, monthly counts, and one heatmap cell per day of `year`
 */
export function buildDashboardSummary(input: BuildDashboardSummaryInput): DashboardSummary {
  const today = calendarDateInTimeZone(input.now, input.timeZone)
  const titlesByMonth = Array.from({ length: MONTHS_IN_YEAR }, () => new Set<number>())
  const minutesByMonth = Array.from({ length: MONTHS_IN_YEAR }, () => 0)
  const yearDays = new Set<string>()
  const allDays = new Set<string>()
  const heatmapTitles = new Map<string, Set<number>>()
  const yearMedia = new Set<number>()
  let yearMinutes = 0
  let lifetimeMinutes = 0

  for (const event of input.events) {
    const date = calendarDateFromInstant(event.watchedAt, input.timeZone)

    if (!date) {
      continue
    }

    const key = calendarDateKey(date)
    allDays.add(key)
    const inYear = date.year === input.year

    if (inYear) {
      yearDays.add(key)
      const dayTitles = heatmapTitles.get(key) ?? new Set<number>()

      dayTitles.add(event.mediaId)
      heatmapTitles.set(key, dayTitles)
    }

    if (!TITLE_AND_HOUR_EVENT_TYPES.has(event.eventType)) {
      continue
    }

    const minutes = runtimeMinutes(event.runtimeMinutes)
    lifetimeMinutes += minutes

    if (!inYear) {
      continue
    }

    yearMinutes += minutes
    yearMedia.add(event.mediaId)
    const monthIndex = date.month - 1
    const monthTitles = titlesByMonth[monthIndex]

    if (monthTitles) {
      monthTitles.add(event.mediaId)
    }

    minutesByMonth[monthIndex] = (minutesByMonth[monthIndex] ?? 0) + minutes
  }

  const titleCounts = titlesByMonth.map((titles) => titles.size)
  const hourSeries = minutesByMonth.map((minutes) => roundToTenth(minutes / 60))
  const streakSeries = titleCounts.map((_, monthIndex) =>
    longestStreak(daysInMonth(yearDays, input.year, monthIndex)),
  )
  const { series: ratingSeries, value: avgRating } = ratingSummary(
    input.reviews,
    input.timeZone,
    input.year,
  )
  const heatmapDays = heatmapForYear(input.year, heatmapTitles)

  return {
    heatmap: {
      activeDays: heatmapDays.filter((day) => day.count > 0).length,
      busiestDay: busiestHeatmapDay(heatmapDays),
      days: heatmapDays,
      longestStreak: longestStreak(yearDays),
      titlesThisYear: yearMedia.size,
    },
    stats: {
      avgRating: { series: ratingSeries, value: avgRating },
      hoursWatched: { series: hourSeries, value: roundToTenth(yearMinutes / 60) },
      longestStreak: { series: streakSeries, value: longestStreak(yearDays) },
      titlesWatched: { series: titleCounts, value: yearMedia.size },
    },
    streaks: {
      challengesCompleted: input.challengesCompleted,
      currentStreak: currentStreak(allDays, today),
      filmsCompleted: input.filmsCompleted,
      lifetimeHours: roundToTenth(lifetimeMinutes / 60),
    },
    timeZone: input.timeZone,
    titlesPerMonth: titlesPerMonth(titleCounts, today, input.year),
    year: input.year,
  }
}

/**
 * Counts challenges the streaks card treats as done.
 *
 * @param watchlists - Profile watchlists, including lists that are not challenges
 * @returns Enabled challenges whose `statsCache.status` is `completed`
 */
export function countCompletedChallenges(
  watchlists: readonly {
    challenge?: { enabled?: boolean | null } | null
    statsCache?: { status?: null | string } | null
  }[],
): number {
  return watchlists.filter(
    (watchlist) =>
      watchlist.challenge?.enabled === true && watchlist.statsCache?.status === 'completed',
  ).length
}

// Arithmetic mean. Callers pass a non-empty list.
function average(values: readonly number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

// Later ties win so the busiest day is the most recent day at that count.
function busiestHeatmapDay(days: readonly DashboardHeatmapDay[]): DashboardHeatmapDay | null {
  let busiest: DashboardHeatmapDay | null = null

  for (const day of days) {
    if (day.count === 0) {
      continue
    }

    if (!busiest || day.count >= busiest.count) {
      busiest = day
    }
  }

  return busiest
}

// Calendar day for an ISO timestamp, or null when it cannot be parsed.
function calendarDateFromInstant(value: string, timeZone: string): CalendarDate | null {
  const time = Date.parse(value)

  if (Number.isNaN(time)) {
    return null
  }

  return calendarDateInTimeZone(new Date(time), timeZone)
}

// Inverse of `calendarDateKey` for keys this module created.
function calendarDateFromKey(key: string): CalendarDate | null {
  const [year, month, day] = key.split('-').map(Number)

  if (!year || !month || !day) {
    return null
  }

  return { day, month, year }
}

// Consecutive watched days ending today, or yesterday when today has no event yet.
function currentStreak(days: ReadonlySet<string>, today: CalendarDate): number {
  let cursor = today

  if (!days.has(calendarDateKey(cursor))) {
    cursor = addCalendarDays(cursor, -1)

    if (!days.has(calendarDateKey(cursor))) {
      return 0
    }
  }

  let streak = 0

  while (days.has(calendarDateKey(cursor))) {
    streak += 1
    cursor = addCalendarDays(cursor, -1)
  }

  return streak
}

// Day keys from one month of the selected year.
function daysInMonth(yearDays: ReadonlySet<string>, year: number, monthIndex: number): string[] {
  const prefix = `${year}-${String(monthIndex + 1).padStart(2, '0')}-`

  return [...yearDays].filter((day) => day.startsWith(prefix))
}

// One cell per day. A day's count is its distinct titles; days with no events stay at zero so the grid can render the year.
function heatmapForYear(
  year: number,
  titlesByDay: ReadonlyMap<string, ReadonlySet<number>>,
): DashboardHeatmapDay[] {
  return calendarDaysInYear(year).map((date) => {
    const key = calendarDateKey(date)

    return { count: titlesByDay.get(key)?.size ?? 0, date: key }
  })
}

// Longest run of consecutive `YYYY-MM-DD` keys. A gap resets the run.
function longestStreak(dayKeys: Iterable<string>): number {
  const sorted = [...dayKeys].sort()
  let best = 0
  let run = 0
  let previous: CalendarDate | null = null

  for (const key of sorted) {
    const date = calendarDateFromKey(key)

    if (!date) {
      continue
    }

    const continues = previous != null && calendarDateKey(addCalendarDays(previous, 1)) === key
    run = continues ? run + 1 : 1
    best = Math.max(best, run)
    previous = date
  }

  return best
}

// Lifetime mean, plus one rounded mean per month of the selected year.
function ratingSummary(
  reviews: readonly SummaryReview[],
  timeZone: string,
  year: number,
): { series: number[]; value: null | number } {
  const lifetime: number[] = []
  const byMonth = Array.from({ length: MONTHS_IN_YEAR }, () => [] as number[])

  for (const review of reviews) {
    if (!Number.isFinite(review.rating)) {
      continue
    }

    lifetime.push(review.rating)
    const date = calendarDateFromInstant(review.updatedAt, timeZone)

    if (!date || date.year !== year) {
      continue
    }

    byMonth[date.month - 1]?.push(review.rating)
  }

  return {
    series: byMonth.map((month) => (month.length > 0 ? roundToTenth(average(month)) : 0)),
    value: lifetime.length > 0 ? roundToTenth(average(lifetime)) : null,
  }
}

// One decimal hour or rating. The year total is rounded once, not from rounded months.
function roundToTenth(value: number): number {
  return Math.round(value * 10) / 10
}

// Non-negative runtime. Missing and invalid values add no time.
function runtimeMinutes(value: null | number | undefined): number {
  if (value == null || !Number.isFinite(value) || value < 0) {
    return 0
  }

  return value
}

// Monthly title counts, emphasizing the current month only for the current year.
function titlesPerMonth(
  counts: number[],
  today: CalendarDate,
  year: number,
): DashboardTitlesPerMonth {
  return {
    counts: [...counts],
    highlightMonth: today.year === year ? today.month - 1 : null,
  }
}
