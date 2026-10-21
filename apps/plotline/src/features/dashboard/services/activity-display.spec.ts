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
      progress: { completed: 31, goal: 52, label: '31 / 52' },
      title: '2026 films',
    }

    expect(activityRowHeadline(row)).toBe('2026 films · 31 / 52')
    expect(activityRowSubtitle(row)).toBeNull()
    expect(activityChallengePercent(row)).toBeCloseTo((31 / 52) * 100)
  })

  it('caps a finished challenge and reads decimal hours', () => {
    expect(
      activityChallengePercent({
        filterKind: 'challenge',
        progress: { completed: 12.5, goal: 10, label: '12.5 / 10' },
      }),
    ).toBe(100)
    expect(
      activityChallengePercent({
        filterKind: 'challenge',
        progress: { completed: 0.5, goal: 1.5, label: '0.5 / 1.5' },
      }),
    ).toBeCloseTo((0.5 / 1.5) * 100)
    expect(
      activityRowHeadline({
        filterKind: 'challenge',
        progress: { completed: 0.5, goal: 1.5, label: '0.5 / 1.5' },
        title: 'Runtime',
      }),
    ).toBe('Runtime · 0.5 / 1.5')
  })

  it('skips the bar for a challenge without a usable goal', () => {
    expect(
      activityChallengePercent({
        filterKind: 'challenge',
        progress: { completed: 0, goal: 0, label: '0 / 0' },
      }),
    ).toBeNull()
    expect(activityChallengePercent({ filterKind: 'challenge', progress: null })).toBeNull()
  })

  it('keeps an episode line under the title and skips a bar', () => {
    const row = {
      detail: 'S2 · E4',
      filterKind: 'watched' as const,
      progress: null,
      title: 'Loki',
    }

    expect(activityRowHeadline(row)).toBe('Loki')
    expect(activityRowSubtitle(row)).toBe('S2 · E4')
    expect(activityChallengePercent(row)).toBeNull()
  })

  it('leaves milestones on one line', () => {
    const row = {
      detail: null,
      filterKind: 'milestone' as const,
      progress: null,
      title: '25-day streak',
    }

    expect(activityRowHeadline(row)).toBe('25-day streak')
    expect(activityRowSubtitle(row)).toBeNull()
    expect(activityChallengePercent(row)).toBeNull()
  })
})
