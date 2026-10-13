import type {
  DashboardActivityKind,
  DashboardActivityMediaType,
  DashboardActivityRange,
  DashboardSummaryFilters,
} from '../types'

import { decodeActivityCursor } from './activity'
import { calendarDateInTimeZone, isValidTimeZone, parseCalendarDateKey } from './calendar'

const ACTIVITY_KINDS = new Set<DashboardActivityKind>([
  'all',
  'challenge',
  'milestone',
  'rated',
  'reviewed',
  'watched',
])

const ACTIVITY_MEDIA_TYPES = new Set<DashboardActivityMediaType>(['all', 'movie', 'tv'])

const DEFAULT_ACTIVITY_KIND: DashboardActivityKind = 'all'
const DEFAULT_ACTIVITY_LIMIT = 20
const DEFAULT_ACTIVITY_MEDIA_TYPE: DashboardActivityMediaType = 'all'
const MAX_ACTIVITY_LIMIT = 50
const MIN_SUMMARY_YEAR = 1970
const MAX_SUMMARY_YEAR = 2100

export type DashboardQueryResult<T> = { error: string; ok: false } | { ok: true; value: T }

export type ParsedDashboardActivityQuery = {
  cursor: null | string
  kind: DashboardActivityKind
  limit: number
  mediaType: DashboardActivityMediaType
  range: DashboardActivityRange
  timeZone: string
}

/** A dashboard query that parsed, then failed a later check such as the activity cursor. */
export class DashboardQueryError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DashboardQueryError'
  }
}

/**
 * Reads the activity query.
 *
 * Defaults are all kinds, all media, the last 30 days, and 20 rows.
 * `range` may be `7d`, `30d`, `90d`, `year`, `all`, or one `YYYY-MM-DD` day.
 *
 * @param searchParams - Query string from `GET /api/dashboard/activity`
 * @returns The parsed feed query, or a message for a 400 response
 */
export function parseDashboardActivityQuery(
  searchParams: URLSearchParams,
): DashboardQueryResult<ParsedDashboardActivityQuery> {
  const timeZone = parseTimeZone(searchParams.get('timeZone'))

  if (!timeZone) {
    return { error: 'Invalid time zone', ok: false }
  }

  const kind = parseActivityKind(searchParams.get('kind'))

  if (!kind) {
    return { error: 'Invalid activity kind', ok: false }
  }

  const mediaType = parseActivityMediaType(searchParams.get('mediaType'))

  if (!mediaType) {
    return { error: 'Invalid media type', ok: false }
  }

  const range = parseActivityRange(searchParams.get('range'))

  if (!range) {
    return { error: 'Invalid range', ok: false }
  }

  const limit = parseLimit(searchParams.get('limit'))

  if (limit == null) {
    return { error: 'Invalid limit', ok: false }
  }

  const cursor = searchParams.get('cursor')

  if (cursor && !isCursor(cursor)) {
    return { error: 'Invalid cursor', ok: false }
  }

  return {
    ok: true,
    value: {
      cursor: cursor || null,
      kind,
      limit,
      mediaType,
      range,
      timeZone,
    },
  }
}

/**
 * Reads the summary query.
 *
 * `timeZone` is required. `year` defaults to the current calendar year in that zone.
 *
 * @param searchParams - Query string from `GET /api/dashboard/summary`
 * @param now - Instant used when `year` is omitted
 * @returns The year and timezone, or a message for a 400 response
 */
export function parseDashboardSummaryQuery(
  searchParams: URLSearchParams,
  now = new Date(),
): DashboardQueryResult<DashboardSummaryFilters> {
  const timeZone = parseTimeZone(searchParams.get('timeZone'))

  if (!timeZone) {
    return { error: 'Invalid time zone', ok: false }
  }

  const year = parseYear(searchParams.get('year'), timeZone, now)

  if (year == null) {
    return { error: 'Invalid year', ok: false }
  }

  return { ok: true, value: { timeZone, year } }
}

// True when the cursor is the token `selectActivityPage` returns.
function isCursor(value: string): boolean {
  return decodeActivityCursor(value) != null
}

// Empty kind defaults to all. Anything outside the allowlist is rejected.
function parseActivityKind(value: null | string): DashboardActivityKind | null {
  if (value == null || value === '') {
    return DEFAULT_ACTIVITY_KIND
  }

  return ACTIVITY_KINDS.has(value as DashboardActivityKind)
    ? (value as DashboardActivityKind)
    : null
}

// Empty media type defaults to all.
function parseActivityMediaType(value: null | string): DashboardActivityMediaType | null {
  if (value == null || value === '') {
    return DEFAULT_ACTIVITY_MEDIA_TYPE
  }

  return ACTIVITY_MEDIA_TYPES.has(value as DashboardActivityMediaType)
    ? (value as DashboardActivityMediaType)
    : null
}

// Empty range is the last 30 days. A real `YYYY-MM-DD` value is one day.
function parseActivityRange(value: null | string): DashboardActivityRange | null {
  if (value == null || value === '') {
    return { days: 30, type: 'rolling' }
  }

  switch (value) {
    case '30d':
      return { days: 30, type: 'rolling' }
    case '7d':
      return { days: 7, type: 'rolling' }
    case '90d':
      return { days: 90, type: 'rolling' }
    case 'all':
      return { type: 'all' }
    case 'year':
      return { type: 'year' }
    default: {
      if (!parseCalendarDateKey(value)) {
        return null
      }

      return { date: value, type: 'date' }
    }
  }
}

// Empty limit defaults to 20. Values outside 1–50 are rejected.
function parseLimit(value: null | string): null | number {
  if (value == null || value === '') {
    return DEFAULT_ACTIVITY_LIMIT
  }

  if (!/^\d+$/.test(value)) {
    return null
  }

  const limit = Number(value)

  if (limit < 1 || limit > MAX_ACTIVITY_LIMIT) {
    return null
  }

  return limit
}

// Trimmed IANA zone, or null when the runtime cannot format with it.
function parseTimeZone(value: null | string): null | string {
  const timeZone = value?.trim() ?? ''

  return isValidTimeZone(timeZone) ? timeZone : null
}

// Empty year is the current calendar year in `timeZone`.
function parseYear(value: null | string, timeZone: string, now: Date): null | number {
  if (value == null || value === '') {
    return calendarDateInTimeZone(now, timeZone).year
  }

  if (!/^\d{4}$/.test(value)) {
    return null
  }

  const year = Number(value)

  if (year < MIN_SUMMARY_YEAR || year > MAX_SUMMARY_YEAR) {
    return null
  }

  return year
}
