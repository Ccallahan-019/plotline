import { describe, expect, it } from 'vitest'

import { parseDashboardActivityQuery, parseDashboardSummaryQuery } from './parse-dashboard-query'

describe('parseDashboardSummaryQuery', () => {
  it('defaults the year to the current year in the requested timezone', () => {
    const parsed = parseDashboardSummaryQuery(
      new URLSearchParams({ timeZone: 'America/New_York' }),
      new Date('2026-01-01T04:30:00.000Z'),
    )

    expect(parsed).toEqual({
      ok: true,
      value: { timeZone: 'America/New_York', year: 2025 },
    })
  })

  it('rejects a missing timezone and a year outside the allowed range', () => {
    expect(parseDashboardSummaryQuery(new URLSearchParams()).ok).toBe(false)
    expect(
      parseDashboardSummaryQuery(new URLSearchParams({ timeZone: 'UTC', year: '1800' })),
    ).toEqual({ error: 'Invalid year', ok: false })
  })
})

describe('parseDashboardActivityQuery', () => {
  it('defaults kind, media, range, and limit', () => {
    const parsed = parseDashboardActivityQuery(new URLSearchParams({ timeZone: 'UTC' }))

    expect(parsed).toEqual({
      ok: true,
      value: {
        cursor: null,
        kind: 'all',
        limit: 20,
        mediaType: 'all',
        range: { days: 30, type: 'rolling' },
        timeZone: 'UTC',
      },
    })
  })

  it('accepts a single day and rejects a calendar date that does not exist', () => {
    const parsed = parseDashboardActivityQuery(
      new URLSearchParams({ range: '2026-10-04', timeZone: 'UTC' }),
    )

    expect(parsed.ok && parsed.value.range).toEqual({ date: '2026-10-04', type: 'date' })
    expect(
      parseDashboardActivityQuery(new URLSearchParams({ range: '2026-02-31', timeZone: 'UTC' })),
    ).toEqual({ error: 'Invalid range', ok: false })
  })

  it('rejects an out-of-range limit', () => {
    expect(
      parseDashboardActivityQuery(new URLSearchParams({ limit: '0', timeZone: 'UTC' })),
    ).toEqual({ error: 'Invalid limit', ok: false })
  })
})
