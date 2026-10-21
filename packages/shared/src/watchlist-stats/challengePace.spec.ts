import { describe, expect, it } from 'vitest'

import { formatChallengePace } from './challengePace'

describe('formatChallengePace', () => {
  it('labels a finished goal complete before any pace state', () => {
    expect(
      formatChallengePace({
        actualPerDay: 1,
        daysRemaining: 4,
        onTrack: false,
        remaining: 0,
        requiredPerDay: 2,
        status: 'overdue',
      }),
    ).toEqual({ label: 'Complete', tone: 'default' })
  })

  it('labels a completed status complete even when remaining is still set', () => {
    expect(
      formatChallengePace({
        daysRemaining: 2,
        onTrack: true,
        remaining: 3,
        status: 'completed',
      }),
    ).toEqual({ label: 'Complete', tone: 'default' })
  })

  it('labels an overdue challenge as destructive', () => {
    expect(
      formatChallengePace({
        actualPerDay: 0.2,
        daysRemaining: 0,
        onTrack: false,
        remaining: 8,
        status: 'overdue',
      }),
    ).toEqual({ label: 'Overdue', tone: 'destructive' })
  })

  it('keeps a not-started challenge neutral and includes days left', () => {
    expect(
      formatChallengePace({
        daysRemaining: 10,
        remaining: 52,
        status: 'not_started',
      }),
    ).toEqual({ label: 'Not started · 10 days left', tone: 'neutral' })
  })

  it('omits the days suffix when days remaining is unset', () => {
    expect(
      formatChallengePace({
        remaining: 52,
        status: 'not_started',
      }),
    ).toEqual({ label: 'Not started', tone: 'neutral' })
  })

  it('stays neutral on day zero when the daily rate is not computable yet', () => {
    expect(
      formatChallengePace({
        daysRemaining: 12,
        onTrack: undefined,
        remaining: 20,
        requiredPerDay: 20 / 12,
        status: 'active',
      }),
    ).toEqual({ label: 'Not started · 12 days left', tone: 'neutral' })
  })

  it('labels a faster rate as ahead, including the singular day', () => {
    expect(
      formatChallengePace({
        actualPerDay: 2,
        daysRemaining: 1,
        onTrack: true,
        remaining: 4,
        requiredPerDay: 1,
        status: 'active',
      }),
    ).toEqual({ label: 'Ahead of pace · 1 day left', tone: 'ahead' })
  })

  it('labels an equal rate as on track', () => {
    expect(
      formatChallengePace({
        actualPerDay: 1,
        daysRemaining: 3,
        onTrack: true,
        remaining: 3,
        requiredPerDay: 1,
        status: 'active',
      }),
    ).toEqual({ label: 'On track · 3 days left', tone: 'default' })
  })

  it('labels a slower rate as behind', () => {
    expect(
      formatChallengePace({
        actualPerDay: 0.5,
        daysRemaining: 6,
        onTrack: false,
        remaining: 9,
        requiredPerDay: 1.5,
        status: 'active',
      }),
    ).toEqual({ label: 'Behind pace · 6 days left', tone: 'destructive' })
  })

  it('drops the days suffix on a behind badge when days remaining is unset', () => {
    expect(
      formatChallengePace({
        actualPerDay: 0.5,
        onTrack: false,
        remaining: 9,
        requiredPerDay: 1.5,
        status: 'active',
      }),
    ).toEqual({ label: 'Behind pace', tone: 'destructive' })
  })
})
