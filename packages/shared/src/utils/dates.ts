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

export function parseReleaseDate(value: null | string | undefined): Date | null {
  if (!value) {
    return null
  }

  const date = new Date(`${value}T00:00:00.000Z`)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  return date
}
