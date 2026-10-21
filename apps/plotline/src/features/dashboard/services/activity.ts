import type { MediaType, WatchEventType } from '@plotline/shared/constants'

import type {
  DashboardActivityGroup,
  DashboardActivityKind,
  DashboardActivityMediaType,
  DashboardActivityPage,
  DashboardActivityRange,
  DashboardActivityRow,
} from '../types'

import {
  addCalendarDays,
  type CalendarDate,
  calendarDateInTimeZone,
  calendarDateKey,
  compareCalendarDates,
  monthDayLabel,
  parseCalendarDateKey,
  shortWeekdayLabel,
  startOfIsoWeek,
  weekdayName,
} from './calendar'

const TITLE_AND_HOUR_EVENT_TYPES = new Set<WatchEventType>([
  'completed',
  'progress',
  'rewatched',
  'started',
])

const FILM_MILESTONES: readonly number[] = [10, 25, 50, 100, 250, 500]
const HOUR_MILESTONES: readonly number[] = [10, 25, 50, 100, 250, 500]
const STREAK_MILESTONES: readonly number[] = [7, 14, 30, 60, 100]

/** Challenge fields the activity snapshot reads. A watchlist document satisfies this. */
export type ActivityChallengeInput = {
  challenge?: {
    dueDate?: null | string
    enabled?: boolean | null
    goalCount?: null | number
    goalRuntimeMinutes?: null | number
    goalType?: 'count' | 'runtime_minutes' | null
    startDate?: null | string
    tvCountRule?: 'movies_only' | 'tv_as_series' | 'tv_by_episode' | 'tv_by_season' | null
  } | null
  id: number
  name: string
  slug: string
  statsCache?: {
    completed: number
    goalCount?: number
    goalRuntimeMinutes?: number
    lastCalculatedAt?: string
    totalEligible?: number
  } | null
}

/** Watch event fields the feed and milestone scan read. */
export type ActivityEventInput = {
  eventType: WatchEventType
  id: number
  media: ActivityMedia | number
  runtimeMinutes?: null | number
  tvContext?: {
    episode?: null | number
    season?: null | number
  } | null
  watchedAt: string
}

/** Review fields the feed reads. A body makes the row Reviewed. */
export type ActivityReviewInput = {
  body?: null | string
  id: number
  media: ActivityMedia | number
  rating: number
  updatedAt: string
}

export type SelectActivityPageInput = {
  cursor?: null | string
  kind: DashboardActivityKind
  limit: number
  mediaType: DashboardActivityMediaType
  range: DashboardActivityRange
  timeZone: string
}

export type SelectActivityPageResult =
  | { error: string; ok: false }
  | { ok: true; page: DashboardActivityPage }

type ActivityCursor = {
  id: string
  occurredAt: string
}

type ActivityMedia = {
  id: number
  mediaType: MediaType
  posterPath?: null | string
  title: string
  tmdbId: number
}

/**
 * Builds every activity row for a profile, newest first.
 *
 * Watch events use the label Watched, except `dropped` and `on_hold`, which keep
 * their own labels and still use the watched filter. A review with a body is
 * Reviewed at `updatedAt`; a rating without a body is Rated. Each enabled
 * challenge contributes one snapshot at `statsCache.lastCalculatedAt`. Milestones
 * are emitted when a lifetime film count, hour total, or streak length crosses a
 * threshold, timestamped by the crossing event.
 *
 * @param input.challenges - Profile watchlists; disabled challenges and caches without a timestamp are skipped
 * @param input.events - Watch events used for rows and for milestone scanning
 * @param input.reviews - Profile reviews; a trimmed body makes the row Reviewed
 * @param input.timeZone - IANA zone used when streak milestones cross calendar days
 * @returns Timeline rows sorted newest first
 */
export function buildActivityRows(input: {
  challenges: readonly ActivityChallengeInput[]
  events: readonly ActivityEventInput[]
  reviews: readonly ActivityReviewInput[]
  timeZone: string
}): DashboardActivityRow[] {
  const ratings = ratingsByMediaId(input.reviews)
  const rows = [
    ...watchRows(input.events, ratings),
    ...reviewRows(input.reviews),
    ...challengeRows(input.challenges),
    ...milestoneRows(input.events, input.timeZone),
  ]

  return rows.sort(compareActivityRows)
}

// Cursor payload, or null when it is not base64url JSON with an id and timestamp.
export function decodeActivityCursor(value: string): ActivityCursor | null {
  try {
    const parsed: unknown = JSON.parse(decodeBase64Url(value))

    if (!isActivityCursor(parsed)) {
      return null
    }

    return parsed
  } catch {
    return null
  }
}

/**
 * Groups a newest-first page into timeline headers.
 *
 * Today and yesterday keep those words as the header, with `Mon · Oct 12` underneath.
 * Other days in the current Monday–Sunday week use the weekday name and the month
 * and day underneath. The previous Monday–Sunday collapses into Last week, with the
 * earliest and latest dates among that group's rows underneath (`Oct 6 – Oct 11`,
 * or one date when every row is on the same day). Older days use a short month and
 * day as the header and no second line.
 *
 * @param rows - Newest-first rows, usually one loaded page plus older pages
 * @param now - Instant that defines today
 * @param timeZone - IANA zone for the day labels
 * @returns Groups in the same order as `rows`
 */
export function groupActivityRows(
  rows: readonly DashboardActivityRow[],
  now: Date,
  timeZone: string,
): DashboardActivityGroup[] {
  const today = calendarDateInTimeZone(now, timeZone)
  const groups: DashboardActivityGroup[] = []

  for (const row of rows) {
    const occurredAt = Date.parse(row.occurredAt)

    if (Number.isNaN(occurredAt)) {
      continue
    }

    const label = activityGroupLabel(calendarDateInTimeZone(new Date(occurredAt), timeZone), today)
    const current = groups.at(-1)

    if (current && current.key === label.key) {
      current.rows.push(row)
      continue
    }

    groups.push({
      dateLabel: label.dateLabel,
      key: label.key,
      label: label.label,
      rows: [row],
    })
  }

  return groups.map((group) => {
    if (group.key !== 'last-week') {
      return group
    }

    return { ...group, dateLabel: lastWeekDateLabel(group.rows, timeZone) }
  })
}

/**
 * Returns one page of activity rows after kind, media, and range filters.
 *
 * The cursor is the last row of the previous page. Rows are already newest
 * first; the next page continues strictly after that row.
 *
 * @param rows - Rows from `buildActivityRows`
 * @param query.cursor - Opaque cursor from a previous page
 * @param query.kind - Activity filter, including `all`
 * @param query.limit - Maximum rows to return
 * @param query.mediaType - `movie`, `tv`, or `all`; rows without a type stay on `all` only
 * @param query.range - Rolling window, this year, all time, or one day
 * @param query.timeZone - IANA zone for the range boundaries
 * @param now - Instant the rolling and year ranges are measured from
 * @returns The page, or an error when `cursor` cannot be read
 */
export function selectActivityPage(
  rows: readonly DashboardActivityRow[],
  query: SelectActivityPageInput,
  now: Date,
): SelectActivityPageResult {
  const cursor = query.cursor ? decodeActivityCursor(query.cursor) : null

  if (query.cursor && !cursor) {
    return { error: 'Invalid cursor', ok: false }
  }

  const today = calendarDateInTimeZone(now, query.timeZone)
  const filtered = [...rows]
    .filter(
      (row) =>
        matchesKind(row, query.kind) &&
        matchesMediaType(row, query.mediaType) &&
        matchesRange(row, query.range, today, query.timeZone),
    )
    .sort(compareActivityRows)
  const afterCursor = cursor ? filtered.filter((row) => isAfterCursor(row, cursor)) : filtered
  const pageRows = afterCursor.slice(0, query.limit)
  const lastRow = pageRows.at(-1)

  return {
    ok: true,
    page: {
      nextCursor:
        afterCursor.length > query.limit && lastRow ? encodeActivityCursor(lastRow) : null,
      rows: pageRows,
    },
  }
}

// Today and yesterday win over the week buckets so Monday does not hide Sunday.
function activityGroupLabel(
  date: CalendarDate,
  today: CalendarDate,
): { dateLabel: null | string; key: string; label: string } {
  if (compareCalendarDates(date, today) === 0) {
    return { dateLabel: weekdayMonthDayLabel(date), key: 'today', label: 'Today' }
  }

  if (compareCalendarDates(date, addCalendarDays(today, -1)) === 0) {
    return { dateLabel: weekdayMonthDayLabel(date), key: 'yesterday', label: 'Yesterday' }
  }

  const thisWeekStart = startOfIsoWeek(today)
  const lastWeekStart = addCalendarDays(thisWeekStart, -7)
  const lastWeekEnd = addCalendarDays(thisWeekStart, -1)

  if (
    compareCalendarDates(date, lastWeekStart) >= 0 &&
    compareCalendarDates(date, lastWeekEnd) <= 0
  ) {
    return { dateLabel: null, key: 'last-week', label: 'Last week' }
  }

  const thisWeekEnd = addCalendarDays(thisWeekStart, 6)

  if (
    compareCalendarDates(date, thisWeekStart) >= 0 &&
    compareCalendarDates(date, thisWeekEnd) <= 0
  ) {
    return { dateLabel: monthDayLabel(date), key: calendarDateKey(date), label: weekdayName(date) }
  }

  return { dateLabel: null, key: calendarDateKey(date), label: monthDayLabel(date) }
}

// Calendar day of a row in the request timezone, or null when the timestamp cannot be read.
function activityRowDate(row: DashboardActivityRow, timeZone: string): CalendarDate | null {
  const occurredAt = Date.parse(row.occurredAt)

  if (Number.isNaN(occurredAt)) {
    return null
  }

  return calendarDateInTimeZone(new Date(occurredAt), timeZone)
}

// Enabled challenges with a calculated snapshot. There is no challenge history.
function challengeRows(challenges: readonly ActivityChallengeInput[]): DashboardActivityRow[] {
  const rows: DashboardActivityRow[] = []

  for (const challenge of challenges) {
    if (challenge.challenge?.enabled !== true) {
      continue
    }

    const occurredAt = challenge.statsCache?.lastCalculatedAt

    if (!occurredAt || !challenge.name.trim()) {
      continue
    }

    rows.push({
      detail: formatChallengeSnapshot(challenge),
      episode: null,
      filterKind: 'challenge',
      href: `/dashboard/challenges/${encodeURIComponent(challenge.slug)}`,
      id: paddedId('challenge', challenge.id),
      label: 'Challenge',
      mediaType: null,
      occurredAt,
      posterPath: null,
      rating: null,
      season: null,
      title: challenge.name,
      tmdbId: null,
    })
  }

  return rows
}

// Leading year of a challenge date, when the value starts with four digits.
function challengeYear(value: null | string | undefined): null | string {
  const year = value?.slice(0, 4)

  return year && /^\d{4}$/.test(year) ? year : null
}

// Newest first. Equal timestamps use the padded id so paging stays stable.
function compareActivityRows(left: DashboardActivityRow, right: DashboardActivityRow): number {
  const leftTime = Date.parse(left.occurredAt)
  const rightTime = Date.parse(right.occurredAt)

  if (leftTime !== rightTime) {
    return rightTime - leftTime
  }

  if (left.id === right.id) {
    return 0
  }

  return left.id < right.id ? 1 : -1
}

// Oldest event first, then smaller id, so the first crossing event is stable.
function compareEvents(left: ActivityEventInput, right: ActivityEventInput): number {
  const leftTime = Date.parse(left.watchedAt)
  const rightTime = Date.parse(right.watchedAt)

  if (leftTime !== rightTime) {
    return leftTime - rightTime
  }

  return left.id - right.id
}

// Inverse of `encodeBase64Url`.
function decodeBase64Url(value: string): string {
  const base64 = value.replaceAll('-', '+').replaceAll('_', '/')
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
  const binary = atob(padded)
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))

  return new TextDecoder().decode(bytes)
}

// Opaque cursor for the last row on a page. Web-safe so the feed helper can load in the browser.
function encodeActivityCursor(row: DashboardActivityRow): string {
  const cursor: ActivityCursor = { id: row.id, occurredAt: row.occurredAt }

  return encodeBase64Url(JSON.stringify(cursor))
}

// Base64url using `btoa`, which exists in the browser and in Node.
function encodeBase64Url(value: string): string {
  const bytes = new TextEncoder().encode(value)
  let binary = ''

  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }

  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '')
}

// `S2 · E4` when both numbers are present. Specials can use season 0.
function episodeDetail(tvContext: ActivityEventInput['tvContext']): {
  detail: null | string
  episode: null | number
  season: null | number
} {
  const season = tvContext?.season
  const episode = tvContext?.episode

  if (season == null || episode == null || !Number.isFinite(season) || !Number.isFinite(episode)) {
    return { detail: null, episode: null, season: null }
  }

  return {
    detail: `S${season} · E${episode}`,
    episode,
    season,
  }
}

// First completion or rewatch of a movie. Later events for that film do not count again.
function filmMilestones(events: readonly ActivityEventInput[]): DashboardActivityRow[] {
  const seen = new Set<number>()
  const rows: DashboardActivityRow[] = []
  let count = 0

  for (const event of events) {
    if (event.eventType !== 'completed' && event.eventType !== 'rewatched') {
      continue
    }

    const media = resolveMedia(event.media)

    if (!media || media.mediaType !== 'movie' || seen.has(media.id)) {
      continue
    }

    seen.add(media.id)
    count += 1
    const threshold = milestoneThreshold(FILM_MILESTONES, count)

    if (threshold == null) {
      continue
    }

    rows.push(
      milestoneRow({
        eventId: event.id,
        kind: 'films',
        mediaType: 'movie',
        occurredAt: event.watchedAt,
        threshold,
        title: `${threshold} films`,
      }),
    )
  }

  return rows
}

// `52 films in 2026 · 31 / 52`. Runtime goals use hours on both sides of the fraction.
function formatChallengeSnapshot(watchlist: ActivityChallengeInput): string {
  const challenge = watchlist.challenge
  const stats = watchlist.statsCache
  const year = challengeYear(challenge?.dueDate) ?? challengeYear(challenge?.startDate)
  const yearSuffix = year ? ` in ${year}` : ''

  if (isRuntimeGoal(challenge, stats)) {
    const goalMinutes =
      stats?.goalRuntimeMinutes ?? challenge?.goalRuntimeMinutes ?? stats?.totalEligible ?? 0
    const goalHours = formatHourCount(goalMinutes)
    const completedHours = formatHourCount(stats?.completed ?? 0)

    return `${goalHours} hours${yearSuffix} · ${completedHours} / ${goalHours}`
  }

  const goal = stats?.goalCount ?? challenge?.goalCount ?? stats?.totalEligible ?? 0
  const unit = challenge?.tvCountRule === 'movies_only' ? 'films' : 'titles'

  return `${goal} ${unit}${yearSuffix} · ${stats?.completed ?? 0} / ${goal}`
}

// Whole hours stay integers. Any other duration shows one decimal hour.
function formatHourCount(minutes: number): string {
  const hours = Math.round((Math.max(0, minutes) / 60) * 10) / 10

  return Number.isInteger(hours) ? String(hours) : hours.toFixed(1)
}

// Cumulative hours from qualifying events. One event can cross more than one threshold.
function hourMilestones(events: readonly ActivityEventInput[]): DashboardActivityRow[] {
  const rows: DashboardActivityRow[] = []
  let minutes = 0

  for (const event of events) {
    if (!TITLE_AND_HOUR_EVENT_TYPES.has(event.eventType)) {
      continue
    }

    const previous = minutes
    minutes += runtimeMinutes(event.runtimeMinutes)

    for (const threshold of HOUR_MILESTONES) {
      const thresholdMinutes = threshold * 60

      if (previous < thresholdMinutes && minutes >= thresholdMinutes) {
        rows.push(
          milestoneRow({
            eventId: event.id,
            kind: 'hours',
            mediaType: null,
            occurredAt: event.watchedAt,
            threshold,
            title: `${threshold} hours`,
          }),
        )
      }
    }
  }

  return rows
}

// True when the decoded JSON has a non-empty id and a parseable timestamp.
function isActivityCursor(value: unknown): value is ActivityCursor {
  if (!value || typeof value !== 'object') {
    return false
  }

  const cursor = value as { id?: unknown; occurredAt?: unknown }

  return (
    typeof cursor.id === 'string' &&
    cursor.id.length > 0 &&
    typeof cursor.occurredAt === 'string' &&
    !Number.isNaN(Date.parse(cursor.occurredAt))
  )
}

// Cursor row itself is excluded. Older timestamps, then smaller ids, follow it.
function isAfterCursor(row: DashboardActivityRow, cursor: ActivityCursor): boolean {
  const rowTime = Date.parse(row.occurredAt)
  const cursorTime = Date.parse(cursor.occurredAt)

  if (rowTime < cursorTime) {
    return true
  }

  if (rowTime > cursorTime) {
    return false
  }

  return row.id < cursor.id
}

// Runtime when the goal type says so, or when only a minute goal is stored.
function isRuntimeGoal(
  challenge: ActivityChallengeInput['challenge'],
  stats: ActivityChallengeInput['statsCache'],
): boolean {
  if (challenge?.goalType === 'runtime_minutes') {
    return true
  }

  if (challenge?.goalType === 'count') {
    return false
  }

  const goalMinutes = stats?.goalRuntimeMinutes ?? challenge?.goalRuntimeMinutes

  return goalMinutes != null && (stats?.goalCount ?? challenge?.goalCount) == null
}

// Earliest and latest row dates in the collapsed previous week. One day omits the span.
function lastWeekDateLabel(
  rows: readonly DashboardActivityRow[],
  timeZone: string,
): null | string {
  const dates = rows
    .map((row) => activityRowDate(row, timeZone))
    .filter((date): date is CalendarDate => date != null)
    .sort(compareCalendarDates)
  const start = dates[0]
  const end = dates.at(-1)

  if (!start || !end) {
    return null
  }

  if (compareCalendarDates(start, end) === 0) {
    return monthDayLabel(start)
  }

  return `${monthDayLabel(start)} – ${monthDayLabel(end)}`
}

// `all` keeps every row. Dropped and on hold still match the watched filter.
function matchesKind(row: DashboardActivityRow, kind: DashboardActivityKind): boolean {
  return kind === 'all' || row.filterKind === kind
}

// Rows without a media type, such as hour milestones, stay on the All filter only.
function matchesMediaType(
  row: DashboardActivityRow,
  mediaType: DashboardActivityMediaType,
): boolean {
  return mediaType === 'all' || row.mediaType === mediaType
}

// Rolling windows include today. `year` is the current calendar year in the request zone.
function matchesRange(
  row: DashboardActivityRow,
  range: DashboardActivityRange,
  today: CalendarDate,
  timeZone: string,
): boolean {
  if (range.type === 'all') {
    return true
  }

  const occurredAt = Date.parse(row.occurredAt)

  if (Number.isNaN(occurredAt)) {
    return false
  }

  const date = calendarDateInTimeZone(new Date(occurredAt), timeZone)

  switch (range.type) {
    case 'date':
      return calendarDateKey(date) === range.date
    case 'rolling': {
      const start = addCalendarDays(today, -(range.days - 1))

      return compareCalendarDates(date, start) >= 0 && compareCalendarDates(date, today) <= 0
    }
    case 'year':
      return date.year === today.year
    default: {
      const exhaustive: never = range

      return exhaustive
    }
  }
}

// Milestone rows have no title page. Film milestones keep a movie type for the Film filter.
function milestoneRow(input: {
  eventId: number
  kind: 'films' | 'hours' | 'streak'
  mediaType: MediaType | null
  occurredAt: string
  threshold: number
  title: string
}): DashboardActivityRow {
  return {
    detail: null,
    episode: null,
    filterKind: 'milestone',
    href: null,
    id: `milestone:${input.kind}:${String(input.threshold).padStart(4, '0')}:${String(input.eventId).padStart(8, '0')}`,
    label: 'Milestone',
    mediaType: input.mediaType,
    occurredAt: input.occurredAt,
    posterPath: null,
    rating: null,
    season: null,
    title: input.title,
    tmdbId: null,
  }
}

// Film, hour, and streak thresholds crossed while scanning events in time order.
function milestoneRows(
  events: readonly ActivityEventInput[],
  timeZone: string,
): DashboardActivityRow[] {
  const sorted = [...events].filter((event) => !Number.isNaN(Date.parse(event.watchedAt)))
  sorted.sort(compareEvents)

  return [
    ...filmMilestones(sorted),
    ...hourMilestones(sorted),
    ...streakMilestones(sorted, timeZone),
  ]
}

// The threshold value when this count is one of the milestone steps.
function milestoneThreshold(thresholds: readonly number[], value: number): null | number {
  return thresholds.includes(value) ? value : null
}

// Zero-padded id so string ordering matches numeric ordering when timestamps tie.
function paddedId(prefix: string, id: number): string {
  return `${prefix}:${String(id).padStart(8, '0')}`
}

// Latest rating for a media id, used by watched rows that have no rating of their own.
function ratingsByMediaId(reviews: readonly ActivityReviewInput[]): Map<number, number> {
  const ratings = new Map<number, { rating: number; updatedAt: number }>()

  for (const review of reviews) {
    const media = resolveMedia(review.media)

    if (!media || !Number.isFinite(review.rating)) {
      continue
    }

    const updatedAt = Date.parse(review.updatedAt)
    const current = ratings.get(media.id)

    if (!current || updatedAt >= current.updatedAt) {
      ratings.set(media.id, {
        rating: review.rating,
        updatedAt: Number.isNaN(updatedAt) ? 0 : updatedAt,
      })
    }
  }

  return new Map([...ratings].map(([id, value]) => [id, value.rating]))
}

// Populated media. An id-only relation cannot supply a title.
function resolveMedia(media: ActivityMedia | null | number | undefined): ActivityMedia | null {
  if (!media || typeof media === 'number') {
    return null
  }

  return media
}

// A trimmed body is Reviewed. Anything else, including whitespace, is Rated.
function reviewRows(reviews: readonly ActivityReviewInput[]): DashboardActivityRow[] {
  const rows: DashboardActivityRow[] = []

  for (const review of reviews) {
    const media = resolveMedia(review.media)

    if (!media || !media.title.trim() || Number.isNaN(Date.parse(review.updatedAt))) {
      continue
    }

    const reviewed = Boolean(review.body?.trim())

    rows.push({
      detail: null,
      episode: null,
      filterKind: reviewed ? 'reviewed' : 'rated',
      href: titleHref(media),
      id: paddedId('review', review.id),
      label: reviewed ? 'Reviewed' : 'Rated',
      mediaType: media.mediaType,
      occurredAt: review.updatedAt,
      posterPath: media.posterPath ?? null,
      rating: review.rating,
      season: null,
      title: media.title,
      tmdbId: media.tmdbId,
    })
  }

  return rows
}

// Non-negative runtime. Missing and invalid values add no time.
function runtimeMinutes(value: null | number | undefined): number {
  if (value == null || !Number.isFinite(value) || value < 0) {
    return 0
  }

  return value
}

// Each time a streak reaches a threshold, including a later streak after a gap.
function streakMilestones(
  events: readonly ActivityEventInput[],
  timeZone: string,
): DashboardActivityRow[] {
  const firstEventByDay = new Map<string, ActivityEventInput>()

  for (const event of events) {
    const key = calendarDateKey(calendarDateInTimeZone(new Date(event.watchedAt), timeZone))
    if (!firstEventByDay.has(key)) {
      firstEventByDay.set(key, event)
    }
  }

  const rows: DashboardActivityRow[] = []
  let streak = 0
  let previous: null | string = null

  for (const key of [...firstEventByDay.keys()].sort()) {
    const date = parseCalendarDateKey(key)
    const continues =
      previous != null && date != null && calendarDateKey(addCalendarDays(date, -1)) === previous
    streak = continues ? streak + 1 : 1
    previous = key
    const threshold = milestoneThreshold(STREAK_MILESTONES, streak)
    const event = firstEventByDay.get(key)

    if (threshold == null || !event) {
      continue
    }

    rows.push(
      milestoneRow({
        eventId: event.id,
        kind: 'streak',
        mediaType: null,
        occurredAt: event.watchedAt,
        threshold,
        title: `${threshold}-day streak`,
      }),
    )
  }

  return rows
}

// Title page for a movie or series row.
function titleHref(media: ActivityMedia): string {
  return `/dashboard/title/${media.mediaType}/${media.tmdbId}`
}

// Dropped and on hold keep their own labels. Every other watch event is Watched.
function watchLabel(eventType: WatchEventType): string {
  switch (eventType) {
    case 'completed':
    case 'progress':
    case 'rewatched':
    case 'started':
      return 'Watched'
    case 'dropped':
      return 'Dropped'
    case 'on_hold':
      return 'On hold'
    default: {
      const exhaustive: never = eventType

      return exhaustive
    }
  }
}

// Watch rows copy the review rating for the same media id when one exists.
function watchRows(
  events: readonly ActivityEventInput[],
  ratings: ReadonlyMap<number, number>,
): DashboardActivityRow[] {
  const rows: DashboardActivityRow[] = []

  for (const event of events) {
    const media = resolveMedia(event.media)

    if (!media || !media.title.trim() || Number.isNaN(Date.parse(event.watchedAt))) {
      continue
    }

    const episode = episodeDetail(event.tvContext)

    rows.push({
      detail: episode.detail,
      episode: episode.episode,
      filterKind: 'watched',
      href: titleHref(media),
      id: paddedId('watch', event.id),
      label: watchLabel(event.eventType),
      mediaType: media.mediaType,
      occurredAt: event.watchedAt,
      posterPath: media.posterPath ?? null,
      rating: ratings.get(media.id) ?? null,
      season: episode.season,
      title: media.title,
      tmdbId: media.tmdbId,
    })
  }

  return rows
}

// `Mon · Oct 12` for the today and yesterday headers.
function weekdayMonthDayLabel(date: CalendarDate): string {
  return `${shortWeekdayLabel(date)} · ${monthDayLabel(date)}`
}
