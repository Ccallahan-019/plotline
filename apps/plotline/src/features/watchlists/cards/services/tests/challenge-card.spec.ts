import { describe, expect, it } from 'vitest'

import type { WatchlistCard } from '../../types'

import { getChallengeCardView } from '../challenge-card'

describe('getChallengeCardView', () => {
  it('marks a slow pace as destructive', () => {
    const view = getChallengeCardView(
      card({
        challenge: { enabled: true, goalCount: 52, goalType: 'count', tvCountRule: 'tv_as_series' },
        statsCache: stats({
          actualPerDay: 0.2,
          completed: 31,
          daysRemaining: 10,
          onTrack: false,
          percentComplete: 60,
          remaining: 21,
          requiredPerDay: 1,
          status: 'active',
          totalEligible: 52,
        }),
      }),
    )

    expect(view).toEqual({
      paceLabel: 'Behind pace · 10 days left',
      paceTone: 'destructive',
      percentComplete: 60,
      progressLabel: '31 of 52 titles',
    })
  })

  it('uses films for a movies-only count goal and hours for a runtime goal', () => {
    const films = getChallengeCardView(
      card({
        challenge: { enabled: true, goalCount: 52, goalType: 'count', tvCountRule: 'movies_only' },
        statsCache: stats({ completed: 31, percentComplete: 60, remaining: 21, totalEligible: 52 }),
      }),
    )
    const hours = getChallengeCardView(
      card({
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

    expect(films.progressLabel).toBe('31 of 52 films')
    expect(hours.progressLabel).toBe('38 of 100 hrs')
  })

  it('counts a list size goal from the cache and ignores a leftover runtime', () => {
    const titles = getChallengeCardView(
      card({
        challenge: {
          enabled: true,
          goalCount: 52,
          goalRuntimeMinutes: 6000,
          goalType: 'list_size',
        },
        statsCache: stats({ completed: 12, goalCount: 40, totalEligible: 40 }),
      }),
    )
    const films = getChallengeCardView(
      card({
        challenge: {
          enabled: true,
          goalCount: null,
          goalRuntimeMinutes: 6000,
          goalType: 'list_size',
          tvCountRule: 'movies_only',
        },
        statsCache: stats({ completed: 12, goalRuntimeMinutes: 6000, totalEligible: 16 }),
      }),
    )

    expect(titles.progressLabel).toBe('12 of 40 titles')
    expect(films.progressLabel).toBe('12 of 16 films')
  })

  it('keeps a challenge without stats neutral instead of complete', () => {
    const view = getChallengeCardView(
      card({
        challenge: { enabled: true, goalCount: 52, goalType: 'count' },
        statsCache: null,
      }),
    )

    expect(view.paceLabel).toBe('Not started')
    expect(view.paceTone).toBe('neutral')
    expect(view.percentComplete).toBe(0)
    expect(view.progressLabel).toBe('0 of 52 titles')
  })

  it('reports overdue from the stats status', () => {
    const view = getChallengeCardView(
      card({
        statsCache: stats({
          daysRemaining: 0,
          onTrack: false,
          percentComplete: 40,
          remaining: 6,
          status: 'overdue',
        }),
      }),
    )

    expect(view.paceLabel).toBe('Overdue')
    expect(view.paceTone).toBe('destructive')
  })
})

function card(
  overrides: Partial<Pick<WatchlistCard, 'challenge' | 'statsCache'>> &
    Pick<WatchlistCard, 'statsCache'>,
): Pick<WatchlistCard, 'challenge' | 'statsCache'> {
  return {
    challenge: { enabled: true, goalCount: 10, goalType: 'count' },
    ...overrides,
  }
}

function stats(
  overrides: Partial<NonNullable<WatchlistCard['statsCache']>>,
): NonNullable<WatchlistCard['statsCache']> {
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
