import { describe, expect, it } from 'vitest'

import type { WatchlistCard } from '@/features/watchlists/cards/types'

import {
  getChallengeSpotlightLegend,
  getChallengeSpotlightPaceBadge,
  pickChallengeSpotlight,
} from './challenge-spotlight'

describe('pickChallengeSpotlight', () => {
  it('returns null when no enabled list is active or overdue', () => {
    const cards = [
      card({ id: 1, statsCache: stats({ status: 'not_started' }) }),
      card({ id: 2, statsCache: stats({ status: 'completed' }) }),
      card({
        challenge: { dueDate: '2026-01-01', enabled: false },
        id: 3,
        statsCache: stats({ status: 'active' }),
      }),
      card({ id: 4, statsCache: null }),
    ]

    expect(pickChallengeSpotlight(cards)).toBeNull()
    expect(pickChallengeSpotlight([])).toBeNull()
  })

  it('picks the soonest due date, including an overdue list', () => {
    const laterBehind = card({
      challenge: { dueDate: '2026-12-01', enabled: true },
      id: 1,
      name: 'Later',
      statsCache: stats({ onTrack: false, status: 'active' }),
    })
    const soonerOnTrack = card({
      challenge: { dueDate: '2026-11-01', enabled: true },
      id: 2,
      name: 'Sooner',
      statsCache: stats({ onTrack: true, status: 'active' }),
    })
    const overdue = card({
      challenge: { dueDate: '2026-10-01', enabled: true },
      id: 3,
      name: 'Overdue',
      statsCache: stats({ onTrack: true, status: 'overdue' }),
    })

    expect(pickChallengeSpotlight([laterBehind, soonerOnTrack, overdue])?.name).toBe('Overdue')
  })

  it('keeps a sooner on-track list ahead of a later one that is behind', () => {
    const laterBehind = card({
      challenge: { dueDate: '2026-12-01', enabled: true },
      id: 1,
      name: 'Later',
      statsCache: stats({ onTrack: false, status: 'overdue' }),
    })
    const sooner = card({
      challenge: { dueDate: '2026-11-01', enabled: true },
      id: 2,
      name: 'Sooner',
      statsCache: stats({ onTrack: true, status: 'active' }),
    })

    expect(pickChallengeSpotlight([laterBehind, sooner])?.name).toBe('Sooner')
  })

  it('prefers the list that is behind pace when due dates match', () => {
    const onTrack = card({
      challenge: { dueDate: '2026-11-01', enabled: true },
      id: 1,
      name: 'On track',
      statsCache: stats({ actualPerDay: 2, onTrack: true, requiredPerDay: 1, status: 'active' }),
    })
    const behind = card({
      challenge: { dueDate: '2026-11-01', enabled: true },
      id: 2,
      name: 'Behind',
      statsCache: stats({
        actualPerDay: 0.2,
        onTrack: false,
        requiredPerDay: 1,
        status: 'active',
      }),
    })
    const input = [onTrack, behind]

    expect(pickChallengeSpotlight(input)?.name).toBe('Behind')
    expect(input.map((item) => item.id)).toEqual([1, 2])
  })

  it('sorts a missing due date after every dated list', () => {
    const undated = card({
      challenge: { dueDate: null, enabled: true },
      id: 1,
      name: 'Undated',
      statsCache: stats({ onTrack: false, status: 'active' }),
    })
    const dated = card({
      challenge: { dueDate: '2026-12-31', enabled: true },
      id: 2,
      name: 'Dated',
      statsCache: stats({ onTrack: true, status: 'active' }),
    })

    expect(pickChallengeSpotlight([undated, dated])?.name).toBe('Dated')
  })

  it('keeps the first list when due date and pace both match', () => {
    const first = card({ id: 4, name: 'First' })
    const second = card({ id: 9, name: 'Second' })

    expect(pickChallengeSpotlight([first, second])?.id).toBe(4)
  })
})

describe('getChallengeSpotlightPaceBadge', () => {
  it('marks a faster rate ahead and a slower rate behind', () => {
    expect(
      getChallengeSpotlightPaceBadge(
        stats({ actualPerDay: 2, onTrack: true, requiredPerDay: 1, status: 'active' }),
      ),
    ).toEqual({ label: 'Ahead of pace', tone: 'ahead' })

    expect(
      getChallengeSpotlightPaceBadge(
        stats({ actualPerDay: 0.2, onTrack: false, requiredPerDay: 1, status: 'active' }),
      ),
    ).toEqual({ label: 'Behind pace', tone: 'behind' })
  })

  it('marks an overdue challenge behind even when the daily rate is faster', () => {
    expect(
      getChallengeSpotlightPaceBadge(
        stats({ actualPerDay: 3, onTrack: true, requiredPerDay: 1, status: 'overdue' }),
      ),
    ).toEqual({ label: 'Behind pace', tone: 'behind' })
  })

  it('omits the badge when the rate is even or cannot be compared', () => {
    expect(
      getChallengeSpotlightPaceBadge(
        stats({ actualPerDay: 1, onTrack: true, requiredPerDay: 1, status: 'active' }),
      ),
    ).toBeNull()
    expect(
      getChallengeSpotlightPaceBadge(stats({ actualPerDay: undefined, requiredPerDay: undefined })),
    ).toBeNull()
    expect(getChallengeSpotlightPaceBadge(null)).toBeNull()
    expect(getChallengeSpotlightPaceBadge(stats({ remaining: 0, status: 'completed' }))).toBeNull()
  })
})

describe('getChallengeSpotlightLegend', () => {
  it('formats completed, days left, the weekly rate, and the required pace', () => {
    expect(
      getChallengeSpotlightLegend(
        legendCard(
          stats({ completed: 31, daysRemaining: 12, requiredPerDay: 1, status: 'active' }),
        ),
      ),
    ).toEqual({
      completedLabel: '31',
      daysLeftLabel: '12 days left',
      perWeekLabel: '7',
      requiredPaceLabel: '~ 1.0 titles / day',
    })
  })

  it('uses a singular day and keeps a fractional week', () => {
    expect(
      getChallengeSpotlightLegend(legendCard(stats({ daysRemaining: 1, requiredPerDay: 0.5 }))),
    ).toMatchObject({
      daysLeftLabel: '1 day left',
      perWeekLabel: '3.5',
      requiredPaceLabel: '~ 0.5 titles / day',
    })
  })

  it('formats required pace and the weekly rate in films or hours', () => {
    expect(
      getChallengeSpotlightLegend(
        legendCard(stats({ requiredPerDay: 3 }), {
          enabled: true,
          goalCount: 10,
          goalType: 'count',
          tvCountRule: 'movies_only',
        }),
      ),
    ).toMatchObject({
      perWeekLabel: '21',
      requiredPaceLabel: '~ 3.0 films / day',
    })

    expect(
      getChallengeSpotlightLegend(
        legendCard(stats({ requiredPerDay: 614.4 }), {
          enabled: true,
          goalRuntimeMinutes: 2400,
          goalType: 'runtime_minutes',
        }),
      ),
    ).toMatchObject({
      perWeekLabel: '71.7',
      requiredPaceLabel: '~ 10.2 hrs / day',
    })
  })

  it('omits per week and days left when the cache does not have them', () => {
    expect(
      getChallengeSpotlightLegend(
        legendCard(stats({ daysRemaining: undefined, requiredPerDay: undefined })),
      ),
    ).toEqual({
      completedLabel: '4',
      daysLeftLabel: null,
      perWeekLabel: null,
      requiredPaceLabel: '—',
    })
    expect(getChallengeSpotlightLegend({ challenge: null, statsCache: null })).toEqual({
      completedLabel: '0',
      daysLeftLabel: null,
      perWeekLabel: null,
      requiredPaceLabel: '—',
    })
  })
})

function card(overrides: Partial<WatchlistCard> = {}): WatchlistCard {
  return {
    challenge: { dueDate: '2026-12-31', enabled: true },
    coverPath: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    description: null,
    id: 1,
    name: 'Challenge',
    previews: [],
    slug: 'challenge',
    statsCache: stats(),
    titleCount: 0,
    updatedAt: '2026-01-01T00:00:00.000Z',
    visibility: 'private',
    ...overrides,
  }
}

function legendCard(
  statsCache: WatchlistCard['statsCache'],
  challenge: WatchlistCard['challenge'] = { enabled: true, goalCount: 52, goalType: 'count' },
): Pick<WatchlistCard, 'challenge' | 'statsCache'> {
  return { challenge, statsCache }
}

function stats(
  overrides: Partial<NonNullable<WatchlistCard['statsCache']>> = {},
): NonNullable<WatchlistCard['statsCache']> {
  return {
    completed: 4,
    inProgress: 0,
    lastCalculatedAt: '2026-06-01T00:00:00.000Z',
    percentComplete: 40,
    remaining: 6,
    status: 'active',
    totalEligible: 10,
    ...overrides,
  }
}
