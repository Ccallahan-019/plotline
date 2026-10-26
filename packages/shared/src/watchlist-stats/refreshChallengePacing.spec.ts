import { describe, expect, it } from 'vitest'

import type { WatchlistChallengeConfig, WatchlistStatsCache } from './types'

import { refreshChallengePacing } from './refreshChallengePacing'

const calculatedAt = '2026-10-11T15:00:00.000Z'

function challenge(overrides: Partial<WatchlistChallengeConfig> = {}): WatchlistChallengeConfig {
  return {
    dueDate: '2026-10-31T00:00:00.000Z',
    enabled: true,
    goalCount: 30,
    goalType: 'count',
    startDate: '2026-10-01T00:00:00.000Z',
    ...overrides,
  }
}

function stats(overrides: Partial<WatchlistStatsCache> = {}): WatchlistStatsCache {
  return {
    actualPerDay: 1,
    completed: 10,
    daysElapsed: 10,
    daysRemaining: 20,
    daysTotal: 30,
    goalCount: 30,
    inProgress: 2,
    lastCalculatedAt: calculatedAt,
    onTrack: true,
    percentComplete: 33,
    remaining: 20,
    requiredPerDay: 1,
    status: 'active',
    totalEligible: 30,
    ...overrides,
  }
}

describe('refreshChallengePacing', () => {
  it('recomputes days left and required pace from the reference date', () => {
    const cached = stats()
    const pacing = refreshChallengePacing({
      challenge: challenge(),
      referenceDate: new Date('2026-10-21T15:00:00.000Z'),
      stats: cached,
    })

    expect(pacing).toMatchObject({
      actualPerDay: 0.5,
      completed: 10,
      daysElapsed: 20,
      daysRemaining: 10,
      daysTotal: 30,
      goalCount: 30,
      inProgress: 2,
      lastCalculatedAt: calculatedAt,
      onTrack: false,
      percentComplete: 33,
      remaining: 20,
      requiredPerDay: 2,
      status: 'active',
      totalEligible: 30,
    })
    expect(cached.daysRemaining).toBe(20)
    expect(cached.requiredPerDay).toBe(1)
  })

  it('marks a cached active challenge overdue after the due day', () => {
    const pacing = refreshChallengePacing({
      challenge: challenge(),
      referenceDate: new Date('2026-11-02T10:00:00.000Z'),
      stats: stats(),
    })

    expect(pacing.status).toBe('overdue')
    expect(pacing.daysRemaining).toBe(0)
    expect(pacing.requiredPerDay).toBeUndefined()
    expect(pacing.lastCalculatedAt).toBe(calculatedAt)
    expect(pacing.completed).toBe(10)
  })

  it('keeps an empty list-size goal not started', () => {
    const pacing = refreshChallengePacing({
      challenge: challenge({ goalCount: null, goalType: 'list_size' }),
      referenceDate: new Date('2026-10-21T15:00:00.000Z'),
      stats: stats({
        actualPerDay: 0,
        completed: 0,
        goalCount: 0,
        inProgress: 0,
        onTrack: undefined,
        percentComplete: 0,
        remaining: 0,
        requiredPerDay: undefined,
        status: 'not_started',
        totalEligible: 0,
      }),
    })

    expect(pacing).toMatchObject({
      actualPerDay: 0,
      completed: 0,
      daysElapsed: 20,
      daysRemaining: 10,
      daysTotal: 30,
      percentComplete: 0,
      remaining: 0,
      status: 'not_started',
      totalEligible: 0,
    })
    expect(pacing.onTrack).toBeUndefined()
    expect(pacing.projectedFinishDate).toBeUndefined()
    expect(pacing.requiredPerDay).toBeUndefined()
    expect(pacing.lastCalculatedAt).toBe(calculatedAt)
  })

  it('marks an empty list-size goal overdue after the due day', () => {
    const pacing = refreshChallengePacing({
      challenge: challenge({
        dueDate: '2026-10-01T00:00:00.000Z',
        goalCount: null,
        goalType: 'list_size',
        startDate: '2026-09-01T00:00:00.000Z',
      }),
      referenceDate: new Date('2026-10-11T15:00:00.000Z'),
      stats: stats({
        completed: 0,
        daysElapsed: 30,
        daysRemaining: 0,
        goalCount: 0,
        inProgress: 0,
        percentComplete: 0,
        remaining: 0,
        status: 'not_started',
        totalEligible: 0,
      }),
    })

    expect(pacing.status).toBe('overdue')
    expect(pacing.daysRemaining).toBe(0)
    expect(pacing.requiredPerDay).toBeUndefined()
    expect(pacing.onTrack).toBeUndefined()
    expect(pacing.projectedFinishDate).toBeUndefined()
  })

  it('keeps a latched list-size finish completed after the list is emptied', () => {
    const pacing = refreshChallengePacing({
      challenge: challenge({ goalCount: null, goalType: 'list_size' }),
      referenceDate: new Date('2026-11-02T10:00:00.000Z'),
      stats: stats({
        completed: 8,
        completedAt: '2026-10-05T12:00:00.000Z',
        completedTitleCount: 8,
        goalCount: 8,
        newTitlesSinceCompletion: 2,
        percentComplete: 100,
        remaining: 0,
        status: 'completed',
        totalEligible: 8,
      }),
    })

    expect(pacing).toMatchObject({
      completedAt: '2026-10-05T12:00:00.000Z',
      completedTitleCount: 8,
      newTitlesSinceCompletion: 2,
      status: 'completed',
    })
  })

  it('leaves a disabled challenge on its stored pacing', () => {
    const cached = stats()
    const pacing = refreshChallengePacing({
      challenge: challenge({ enabled: false }),
      referenceDate: new Date('2026-10-21T15:00:00.000Z'),
      stats: cached,
    })

    expect(pacing).toBe(cached)
  })

  it('drops stored pacing when the challenge has no due date', () => {
    const pacing = refreshChallengePacing({
      challenge: challenge({ dueDate: null }),
      referenceDate: new Date('2026-10-21T15:00:00.000Z'),
      stats: stats(),
    })

    expect(pacing.completed).toBe(10)
    expect(pacing.remaining).toBe(20)
    expect(pacing.lastCalculatedAt).toBe(calculatedAt)
    expect(pacing.daysRemaining).toBeUndefined()
    expect(pacing.requiredPerDay).toBeUndefined()
    expect(pacing.status).toBeUndefined()
  })
})
