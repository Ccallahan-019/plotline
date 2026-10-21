import { describe, expect, it } from 'vitest'

import {
  activityChallengePercent,
  activityRowHeadline,
  activityRowSubtitle,
} from './activity-display'

describe('activity row copy', () => {
  it('shows a challenge name with its progress fraction', () => {
    const row = {
      detail: '52 films in 2026 · 31 / 52',
      filterKind: 'challenge' as const,
      title: '2026 films',
    }

    expect(activityRowHeadline(row)).toBe('2026 films · 31 / 52')
    expect(activityRowSubtitle(row)).toBeNull()
    expect(activityChallengePercent(row)).toBeCloseTo((31 / 52) * 100)
  })

  it('caps a finished challenge and reads decimal hours', () => {
    expect(
      activityChallengePercent({
        detail: '10 hours in 2026 · 12.5 / 10',
        filterKind: 'challenge',
      }),
    ).toBe(100)
    expect(
      activityChallengePercent({
        detail: '1.5 hours in 2026 · 0.5 / 1.5',
        filterKind: 'challenge',
      }),
    ).toBeCloseTo((0.5 / 1.5) * 100)
    expect(
      activityRowHeadline({
        detail: '1.5 hours in 2026 · 0.5 / 1.5',
        filterKind: 'challenge',
        title: 'Runtime',
      }),
    ).toBe('Runtime · 0.5 / 1.5')
  })

  it('keeps an episode line under the title and skips a bar', () => {
    const row = { detail: 'S2 · E4', filterKind: 'watched' as const, title: 'Loki' }

    expect(activityRowHeadline(row)).toBe('Loki')
    expect(activityRowSubtitle(row)).toBe('S2 · E4')
    expect(activityChallengePercent(row)).toBeNull()
  })

  it('leaves milestones on one line', () => {
    const row = { detail: null, filterKind: 'milestone' as const, title: '25-day streak' }

    expect(activityRowHeadline(row)).toBe('25-day streak')
    expect(activityRowSubtitle(row)).toBeNull()
    expect(activityChallengePercent(row)).toBeNull()
  })
})
