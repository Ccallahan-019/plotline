/**
 * Release calendar and date helpers for media metadata.
 */

export function daysUntilRelease(
  releaseDate: null | string | undefined,
  referenceDate: Date = new Date(),
): null | number {
  const date = parseReleaseDate(releaseDate)

  if (!date) {
    return null
  }

  const reference = new Date(
    Date.UTC(
      referenceDate.getUTCFullYear(),
      referenceDate.getUTCMonth(),
      referenceDate.getUTCDate(),
    ),
  )

  const diffMs = date.getTime() - reference.getTime()

  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

export function formatDate(
  date: Date | null | string | undefined,
  locale = 'en-US',
): null | string {
  if (!date) {
    return null
  }

  if (typeof date === 'string') {
    date = new Date(date)
  }

  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
    year: 'numeric',
  }).format(date)
}

export function formatReleaseDateForCalendar(
  value: null | string | undefined,
  locale = 'en-US',
): null | string {
  const date = parseReleaseDate(value)

  if (!date) {
    return null
  }

  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
    year: 'numeric',
  }).format(date)
}

export function getDecadeFromDate(date: Date): number {
  return Math.floor(date.getUTCFullYear() / 10) * 10
}

export function getDecadeFromReleaseDate(value: null | string | undefined): null | number {
  const date = parseReleaseDate(value)

  if (!date) {
    return null
  }

  return getDecadeFromDate(date)
}

export function isUpcoming(
  releaseDate: null | string | undefined,
  referenceDate: Date = new Date(),
): boolean {
  const date = parseReleaseDate(releaseDate)

  if (!date) {
    return false
  }

  const reference = new Date(
    Date.UTC(
      referenceDate.getUTCFullYear(),
      referenceDate.getUTCMonth(),
      referenceDate.getUTCDate(),
    ),
  )

  return date.getTime() > reference.getTime()
}

export function isWithinReleaseWindow(
  releaseDate: null | string | undefined,
  windowDays: number,
  referenceDate: Date = new Date(),
): boolean {
  const days = daysUntilRelease(releaseDate, referenceDate)

  if (days === null) {
    return false
  }

  return days >= 0 && days <= windowDays
}

/**
 * Calendar day as UTC midnight.
 *
 * Accepts `YYYY-MM-DD` and an ISO timestamp. Only the date prefix is used, so a
 * Payload date stored as `2026-10-31T00:00:00.000Z` stays 31 October instead of
 * becoming an invalid date.
 *
 * @param value - Calendar day or timestamp. Blank values are ignored
 * @returns UTC midnight for that calendar day, or `null` when it is not a real date
 */
export function parseReleaseDate(value: null | string | undefined): Date | null {
  if (!value) {
    return null
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim())

  if (!match) {
    return null
  }

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(Date.UTC(year, month - 1, day))

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null
  }

  return date
}
