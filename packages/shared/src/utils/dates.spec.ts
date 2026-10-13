import { describe, expect, it } from 'vitest'

import { parseReleaseDate } from './dates'

describe('parseReleaseDate', () => {
  it('reads a calendar day as UTC midnight', () => {
    expect(parseReleaseDate('2026-10-31')?.toISOString()).toBe('2026-10-31T00:00:00.000Z')
  })

  it('reads the calendar day from a Payload ISO timestamp', () => {
    expect(parseReleaseDate('2026-10-31T00:00:00.000Z')?.toISOString()).toBe(
      '2026-10-31T00:00:00.000Z',
    )
    expect(parseReleaseDate('2026-10-11T15:42:00.000Z')?.toISOString()).toBe(
      '2026-10-11T00:00:00.000Z',
    )
  })

  it('rejects a blank or impossible date', () => {
    expect(parseReleaseDate(null)).toBeNull()
    expect(parseReleaseDate('')).toBeNull()
    expect(parseReleaseDate('not-a-date')).toBeNull()
    expect(parseReleaseDate('2026-02-31')).toBeNull()
  })
})
