/** A calendar day in a specific timezone, with no time-of-day. */
export type CalendarDate = {
  day: number
  month: number
  year: number
}

const DAY_MS = 86_400_000

/**
 * Moves a calendar day by a number of days.
 *
 * Arithmetic uses UTC noon so a daylight-saving transition cannot skip or repeat a date.
 *
 * @param date - Starting calendar day
 * @param days - Days to add; negative values move backward
 * @returns The resulting calendar day
 */
export function addCalendarDays(date: CalendarDate, days: number): CalendarDate {
  const next = new Date(calendarDateToUtcNoon(date).getTime() + days * DAY_MS)

  return {
    day: next.getUTCDate(),
    month: next.getUTCMonth() + 1,
    year: next.getUTCFullYear(),
  }
}

/**
 * Calendar day of an instant in an IANA timezone.
 *
 * @param instant - Timestamp to place on a calendar
 * @param timeZone - IANA zone, such as `America/New_York`
 * @returns The year, month, and day in that zone
 */
export function calendarDateInTimeZone(instant: Date, timeZone: string): CalendarDate {
  const parts = new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: '2-digit',
    timeZone,
    year: 'numeric',
  }).formatToParts(instant)

  return {
    day: partValue(parts, 'day'),
    month: partValue(parts, 'month'),
    year: partValue(parts, 'year'),
  }
}

/**
 * `YYYY-MM-DD` key for a calendar day.
 *
 * @param date - Calendar day to format
 * @returns The sortable day key
 */
export function calendarDateKey(date: CalendarDate): string {
  return `${date.year}-${pad(date.month)}-${pad(date.day)}`
}

/**
 * Every calendar day in a year, in order.
 *
 * @param year - Full year, including a leap day when the year has one
 * @returns January 1 through December 31
 */
export function calendarDaysInYear(year: number): CalendarDate[] {
  const days: CalendarDate[] = []
  let cursor: CalendarDate = { day: 1, month: 1, year }

  while (cursor.year === year) {
    days.push(cursor)
    cursor = addCalendarDays(cursor, 1)
  }

  return days
}

/**
 * Compares two calendar days.
 *
 * @param left - First day
 * @param right - Second day
 * @returns Negative when `left` is earlier, positive when it is later, otherwise 0
 */
export function compareCalendarDates(left: CalendarDate, right: CalendarDate): number {
  if (left.year !== right.year) {
    return left.year - right.year
  }

  if (left.month !== right.month) {
    return left.month - right.month
  }

  return left.day - right.day
}

/**
 * True when `timeZone` is an IANA zone this runtime accepts.
 *
 * @param timeZone - Candidate zone from the query string
 * @returns Whether `Intl` can format dates in that zone
 */
export function isValidTimeZone(timeZone: string): boolean {
  if (!timeZone.trim()) {
    return false
  }

  try {
    Intl.DateTimeFormat('en-US', { timeZone }).format(0)

    return true
  } catch {
    return false
  }
}

/**
 * Short month and day, such as `Oct 4`.
 *
 * @param date - Calendar day to label
 * @returns The `MMM d` label in `en-US`
 */
export function monthDayLabel(date: CalendarDate): string {
  return formatUtcDay(date, { day: 'numeric', month: 'short' })
}

/**
 * Parses a `YYYY-MM-DD` key.
 *
 * @param value - Candidate day key
 * @returns The calendar day, or null when the string is not a real date
 */
export function parseCalendarDateKey(value: string): CalendarDate | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)

  if (!match) {
    return null
  }

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = { day, month, year }
  const noon = calendarDateToUtcNoon(date)

  if (
    noon.getUTCFullYear() !== year ||
    noon.getUTCMonth() + 1 !== month ||
    noon.getUTCDate() !== day
  ) {
    return null
  }

  return date
}

/**
 * Calendar years ending at `year`, newest first.
 *
 * The viewing-year select uses this bounded list. The summary route accepts any
 * year, and a profile does not publish which years contain activity.
 *
 * @param year - Newest year, usually the current calendar year
 * @param count - How many years to include. Defaults to 6
 * @returns Years from `year` down through `year - count + 1`
 */
export function recentCalendarYears(year: number, count = 6): number[] {
  return Array.from({ length: count }, (_, index) => year - index)
}

/**
 * Short weekday name, such as `Mon`.
 *
 * @param date - Calendar day to label
 * @returns The abbreviated weekday in `en-US`
 */
export function shortWeekdayLabel(date: CalendarDate): string {
  return formatUtcDay(date, { weekday: 'short' })
}

/**
 * Monday of the ISO week that contains `date`.
 *
 * @param date - Any day in the week
 * @returns That week's Monday
 */
export function startOfIsoWeek(date: CalendarDate): CalendarDate {
  const weekday = calendarDateToUtcNoon(date).getUTCDay()
  const daysFromMonday = weekday === 0 ? 6 : weekday - 1

  return addCalendarDays(date, -daysFromMonday)
}

/**
 * Full weekday name, such as `Monday`.
 *
 * @param date - Calendar day to label
 * @returns The weekday in `en-US`
 */
export function weekdayName(date: CalendarDate): string {
  return formatUtcDay(date, { weekday: 'long' })
}

// UTC noon for a calendar day, used for weekday and day arithmetic.
function calendarDateToUtcNoon(date: CalendarDate): Date {
  return new Date(Date.UTC(date.year, date.month - 1, date.day, 12))
}

// en-US calendar label with ordinary spaces.
function formatUtcDay(date: CalendarDate, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat('en-US', { ...options, timeZone: 'UTC' })
    .format(calendarDateToUtcNoon(date))
    .replace(/[\u202f\u00a0]/g, ' ')
}

// Two-digit month or day.
function pad(value: number): string {
  return String(value).padStart(2, '0')
}

// Numeric date part from `formatToParts`, or 0 when the runtime omits it.
function partValue(parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes): number {
  return Number(parts.find((part) => part.type === type)?.value ?? 0)
}
