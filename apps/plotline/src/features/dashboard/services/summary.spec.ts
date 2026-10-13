import { describe, expect, it } from 'vitest'

import { buildDashboardSummary, countCompletedChallenges, type SummaryWatchEvent } from './summary'

const TIME_ZONE = 'America/New_York'

describe('buildDashboardSummary', () => {
  it('counts distinct titles, hours, streaks, and monthly buckets in a fixed timezone', () => {
    const summary = buildDashboardSummary({
      challengesCompleted: 2,
      events: [
        event({
          eventType: 'rewatched',
          mediaId: 4,
          runtimeMinutes: 90,
          watchedAt: '2026-01-01T04:30:00.000Z',
        }),
        event({
          eventType: 'completed',
          mediaId: 1,
          runtimeMinutes: 120,
          watchedAt: '2026-01-15T18:00:00.000Z',
        }),
        event({
          eventType: 'progress',
          mediaId: 1,
          runtimeMinutes: 0,
          watchedAt: '2026-01-15T20:00:00.000Z',
        }),
        event({
          eventType: 'progress',
          mediaId: 1,
          runtimeMinutes: 30,
          watchedAt: '2026-01-20T18:00:00.000Z',
        }),
        event({
          eventType: 'completed',
          mediaId: 5,
          runtimeMinutes: 60,
          watchedAt: '2026-01-30T15:00:00.000Z',
        }),
        event({
          eventType: 'completed',
          mediaId: 6,
          runtimeMinutes: 60,
          watchedAt: '2026-01-31T15:00:00.000Z',
        }),
        event({
          eventType: 'completed',
          mediaId: 7,
          runtimeMinutes: 60,
          watchedAt: '2026-02-01T15:00:00.000Z',
        }),
        event({
          eventType: 'started',
          mediaId: 2,
          watchedAt: '2026-03-02T18:00:00.000Z',
        }),
        event({
          eventType: 'dropped',
          mediaId: 3,
          runtimeMinutes: 60,
          watchedAt: '2026-03-03T18:00:00.000Z',
        }),
      ],
      filmsCompleted: 4,
      now: new Date('2026-03-04T15:00:00.000Z'),
      reviews: [],
      timeZone: TIME_ZONE,
      year: 2026,
    })

    expect(summary.stats.titlesWatched.value).toBe(5)
    expect(summary.stats.titlesWatched.series).toEqual([3, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0])
    expect(summary.titlesPerMonth.counts).toEqual(summary.stats.titlesWatched.series)
    expect(summary.titlesPerMonth.highlightMonth).toBe(2)
    expect(summary.stats.hoursWatched.value).toBe(5.5)
    expect(summary.stats.hoursWatched.series[0]).toBe(4.5)
    expect(summary.stats.hoursWatched.series[1]).toBe(1)
    expect(summary.stats.hoursWatched.series[2]).toBe(0)
    expect(summary.stats.longestStreak.value).toBe(3)
    expect(summary.stats.longestStreak.series[0]).toBe(2)
    expect(summary.stats.longestStreak.series[1]).toBe(1)
    expect(summary.stats.longestStreak.series[2]).toBe(2)
    expect(summary.stats.avgRating.value).toBeNull()
    expect(summary.streaks).toEqual({
      challengesCompleted: 2,
      currentStreak: 2,
      filmsCompleted: 4,
      lifetimeHours: 7,
    })
    expect(summary.heatmap.days).toHaveLength(365)
    expect(summary.heatmap.activeDays).toBe(7)
    expect(summary.heatmap.longestStreak).toBe(3)
    expect(summary.heatmap.titlesThisYear).toBe(5)
    expect(summary.heatmap.busiestDay).toEqual({ count: 2, date: '2026-01-15' })
    expect(summary.heatmap.days.find((day) => day.date === '2026-01-01')?.count).toBe(0)
  })

  it('lets the current streak cross New Year while the year streak stays inside the year', () => {
    const summary = buildDashboardSummary({
      challengesCompleted: 0,
      events: [
        event({ watchedAt: '2025-12-31T15:00:00.000Z' }),
        event({ mediaId: 2, watchedAt: '2026-01-01T15:00:00.000Z' }),
        event({ mediaId: 3, watchedAt: '2026-01-02T15:00:00.000Z' }),
      ],
      filmsCompleted: 0,
      now: new Date('2026-01-03T15:00:00.000Z'),
      reviews: [],
      timeZone: TIME_ZONE,
      year: 2026,
    })

    expect(summary.streaks.currentStreak).toBe(3)
    expect(summary.stats.longestStreak.value).toBe(2)
    expect(summary.titlesPerMonth.highlightMonth).toBe(0)
  })

  it('places an instant on the previous local month', () => {
    const summary = buildDashboardSummary({
      challengesCompleted: 0,
      events: [event({ watchedAt: '2026-06-01T06:30:00.000Z' })],
      filmsCompleted: 0,
      now: new Date('2026-06-15T00:00:00.000Z'),
      reviews: [],
      timeZone: 'America/Los_Angeles',
      year: 2026,
    })

    expect(summary.stats.titlesWatched.series[4]).toBe(1)
    expect(summary.stats.titlesWatched.series[5]).toBe(0)
  })

  it('averages lifetime ratings and monthly ratings separately', () => {
    const summary = buildDashboardSummary({
      challengesCompleted: 0,
      events: [],
      filmsCompleted: 0,
      now: new Date('2026-06-01T00:00:00.000Z'),
      reviews: [
        { rating: 8, updatedAt: '2026-01-10T18:00:00.000Z' },
        { rating: 9, updatedAt: '2026-01-20T18:00:00.000Z' },
        { rating: 10, updatedAt: '2025-12-01T18:00:00.000Z' },
      ],
      timeZone: TIME_ZONE,
      year: 2026,
    })

    expect(summary.stats.avgRating.value).toBe(9)
    expect(summary.stats.avgRating.series[0]).toBe(8.5)
    expect(summary.stats.avgRating.series[1]).toBe(0)
  })

  it('includes the leap day in a leap year', () => {
    const summary = buildDashboardSummary({
      challengesCompleted: 0,
      events: [],
      filmsCompleted: 0,
      now: new Date('2024-06-01T00:00:00.000Z'),
      reviews: [],
      timeZone: 'UTC',
      year: 2024,
    })

    expect(summary.heatmap.days).toHaveLength(366)
    expect(summary.heatmap.days.at(-1)?.date).toBe('2024-12-31')
  })
})

describe('countCompletedChallenges', () => {
  it('counts enabled challenges whose stats status is completed', () => {
    expect(
      countCompletedChallenges([
        { challenge: { enabled: true }, statsCache: { status: 'completed' } },
        { challenge: { enabled: true }, statsCache: { status: 'active' } },
        { challenge: { enabled: false }, statsCache: { status: 'completed' } },
        { challenge: null, statsCache: null },
      ]),
    ).toBe(1)
  })
})

function event(overrides: Partial<SummaryWatchEvent> = {}): SummaryWatchEvent {
  return {
    eventType: 'completed',
    mediaId: 1,
    runtimeMinutes: 0,
    watchedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}
