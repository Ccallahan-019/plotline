import type { Watchlist } from '@plotline/payload-types'

import { describe, expect, it } from 'vitest'

import { getChallengeDetailView } from '../challenge-detail-view'

describe('getChallengeDetailView', () => {
  it('uses the detail progress line and lists the four meta labels', () => {
    const view = getChallengeDetailView(
      watchlist({
        challenge: {
          dueDate: '2026-12-31',
          enabled: true,
          goalCount: 52,
          goalType: 'count',
          includeRewatches: false,
          tvCountRule: 'tv_by_episode',
        },
        statsCache: stats({
          actualPerDay: 2,
          completed: 31,
          daysRemaining: 10,
          onTrack: true,
          percentComplete: 60,
          remaining: 21,
          requiredPerDay: 1,
          status: 'active',
          totalEligible: 40,
        }),
      }),
    )

    expect(view.progressLabel).toBe('31 / 52 Titles')
    expect(view.progressCompleted).toBe('31')
    expect(view.progressGoal).toBe(' / 52 Titles')
    expect(view.paceLabel).toBe('Ahead of pace · 10 days left')
    expect(view.paceTone).toBe('default')
    expect(view.percentComplete).toBe(60)
    expect(view.meta).toEqual([
      { label: 'Goal type', value: 'Count' },
      { label: 'Due date', value: 'Dec 31, 2026' },
      { label: 'TV counting', value: 'By Episode' },
      { label: 'Rewatches', value: 'Excluded' },
    ])
  })

  it('uses films for a movies-only count goal and hours for a runtime goal', () => {
    const films = getChallengeDetailView(
      watchlist({
        challenge: { enabled: true, goalCount: 52, goalType: 'count', tvCountRule: 'movies_only' },
        statsCache: stats({ completed: 31, percentComplete: 60, remaining: 21, totalEligible: 52 }),
      }),
    )
    const hours = getChallengeDetailView(
      watchlist({
        challenge: {
          enabled: true,
          goalRuntimeMinutes: 6000,
          goalType: 'runtime_minutes',
        },
        statsCache: stats({
          completed: 2280,
          percentComplete: 38,
          remaining: 3720,
          totalEligible: 6000,
        }),
      }),
    )

    expect(films.progressLabel).toBe('31 / 52 Films')
    expect(films.progressGoal).toBe(' / 52 Films')
    expect(hours.progressLabel).toBe('38 / 100 hrs')
    expect(hours.progressCompleted).toBe('38')
    expect(hours.progressGoal).toBe(' / 100 hrs')
  })

  it('shows the starting daily rate and the rate still needed to finish on time', () => {
    const titles = getChallengeDetailView(
      watchlist({
        challenge: { enabled: true, goalCount: 52, goalType: 'count' },
        statsCache: stats({
          daysTotal: 20,
          requiredPerDay: 1.54,
          totalEligible: 40,
        }),
      }),
    )
    const films = getChallengeDetailView(
      watchlist({
        challenge: { enabled: true, goalCount: 10, goalType: 'count', tvCountRule: 'movies_only' },
        statsCache: stats({ daysTotal: 4, requiredPerDay: 3 }),
      }),
    )
    const hours = getChallengeDetailView(
      watchlist({
        challenge: {
          enabled: true,
          goalRuntimeMinutes: 2400,
          goalType: 'runtime_minutes',
        },
        statsCache: stats({
          daysTotal: 20,
          goalRuntimeMinutes: 2400,
          requiredPerDay: 614.4,
          totalEligible: 2400,
        }),
      }),
    )
    const unknown = getChallengeDetailView(
      watchlist({
        challenge: { enabled: true, goalCount: 52, goalType: 'count' },
        statsCache: null,
      }),
    )

    expect(titles.paceRates).toEqual([
      { label: 'Original pace', value: '~ 2.6 titles / day' },
      { label: 'Required pace', value: '~ 1.5 titles / day' },
    ])
    expect(films.paceRates).toEqual([
      { label: 'Original pace', value: '~ 2.5 films / day' },
      { label: 'Required pace', value: '~ 3.0 films / day' },
    ])
    expect(hours.paceRates).toEqual([
      { label: 'Original pace', value: '~ 2.0 hrs / day' },
      { label: 'Required pace', value: '~ 10.2 hrs / day' },
    ])
    expect(unknown.paceRates).toEqual([
      { label: 'Original pace', value: '—' },
      { label: 'Required pace', value: '—' },
    ])
  })

  it('keeps a challenge without stats neutral instead of complete', () => {
    const view = getChallengeDetailView(
      watchlist({
        challenge: { enabled: true, goalCount: 52, goalType: 'count' },
        statsCache: null,
      }),
    )

    expect(view.paceLabel).toBe('Not started')
    expect(view.paceTone).toBe('neutral')
    expect(view.percentComplete).toBe(0)
    expect(view.progressLabel).toBe('0 / 52 Titles')
  })

  it('marks a slow or overdue pace as destructive', () => {
    const behind = getChallengeDetailView(
      watchlist({
        statsCache: stats({
          actualPerDay: 0.2,
          daysRemaining: 4,
          onTrack: false,
          remaining: 6,
          requiredPerDay: 1,
          status: 'active',
        }),
      }),
    )
    const overdue = getChallengeDetailView(
      watchlist({
        statsCache: stats({ remaining: 6, status: 'overdue' }),
      }),
    )

    expect(behind.paceLabel).toBe('Behind pace · 4 days left')
    expect(behind.paceTone).toBe('destructive')
    expect(overdue.paceLabel).toBe('Overdue')
    expect(overdue.paceTone).toBe('destructive')
  })
})

function stats(
  overrides: Partial<NonNullable<Watchlist['statsCache']>>,
): NonNullable<Watchlist['statsCache']> {
  return {
    completed: 4,
    inProgress: 0,
    lastCalculatedAt: '2026-06-01T00:00:00.000Z',
    percentComplete: 40,
    remaining: 6,
    totalEligible: 10,
    ...overrides,
  }
}

function watchlist(
  overrides: Partial<Pick<Watchlist, 'challenge' | 'statsCache'>>,
): Pick<Watchlist, 'challenge' | 'statsCache'> {
  return {
    challenge: { enabled: true, goalCount: 10, goalType: 'count' },
    statsCache: stats({}),
    ...overrides,
  }
}
