import type { LibraryItem, Media, Watchlist, WatchlistMembership } from '@plotline/payload-types'

import { describe, expect, it } from 'vitest'

import {
  applyMembershipGoalCounts,
  getMembershipChallengeExclusion,
  optimisticMembershipGoalCounts,
  restoreMembershipGoalCounts,
} from '../membership-goal-counts'
import { getMembershipMedia } from '../membership-media'

const addedAt = '2026-06-01T00:00:00.000Z'
const completedBefore = '2026-01-15T00:00:00.000Z'

describe('getMembershipChallengeExclusion', () => {
  it('explains a series the movies-only rule rejects', () => {
    expect(
      getMembershipChallengeExclusion(
        membership({ mediaType: 'tv' }),
        challenge({ tvCountRule: 'movies_only' }),
      ),
    ).toEqual({ badge: null, note: 'Series — excluded per challenge rules' })
  })

  it('flags a pre-join rewatch and leaves a manual exclusion editable', () => {
    expect(
      getMembershipChallengeExclusion(
        membership({
          completedAt: completedBefore,
          rewatchCount: 1,
          status: 'completed',
        }),
        challenge(),
      ),
    ).toEqual({ badge: 'rewatch', note: 'Rewatch — excluded per challenge rules' })

    expect(
      getMembershipChallengeExclusion(membership({ countsTowardGoal: false, excludeFromGoal: true }), challenge()),
    ).toEqual({ badge: null, note: null })
  })

  it('returns null when the library item was not populated', () => {
    expect(
      getMembershipChallengeExclusion(membership({ libraryItemIdOnly: true }), challenge()),
    ).toBeNull()
  })
})

describe('optimisticMembershipGoalCounts', () => {
  it('clears counts when the box is turned off', () => {
    expect(
      optimisticMembershipGoalCounts(membership({ countsTowardGoal: true }), challenge(), true),
    ).toMatchObject({
      countsTowardGoal: false,
      excludeFromGoal: true,
    })
  })

  it('restores counts for a title the rules still include', () => {
    expect(
      optimisticMembershipGoalCounts(
        membership({ countsTowardGoal: false, excludeFromGoal: true }),
        challenge(),
        false,
      ),
    ).toMatchObject({
      countsTowardGoal: true,
      excludeFromGoal: false,
    })
  })

  it('keeps a rule-excluded title unchecked', () => {
    expect(
      optimisticMembershipGoalCounts(
        membership({ mediaType: 'tv' }),
        challenge({ tvCountRule: 'movies_only' }),
        false,
      ).countsTowardGoal,
    ).toBe(false)
  })
})

describe('applyMembershipGoalCounts', () => {
  it('updates goal fields and keeps the populated library item', () => {
    const rows = [membership({ title: 'Kept' }), membership({ id: 2, title: 'Other' })]
    const next = applyMembershipGoalCounts(rows, 1, {
      countsTowardGoal: false,
      episodesCountedForList: 3,
      excludeFromGoal: true,
      goalWeight: 0,
      listStatus: 'planned',
    })

    expect(next[0]).toMatchObject({
      countsTowardGoal: false,
      excludeFromGoal: true,
      goalWeight: 0,
      listStatus: 'planned',
    })
    expect(getMembershipMedia(next[0]!)?.title).toBe('Kept')
    expect(getMembershipMedia(next[1]!)?.title).toBe('Other')
    expect(next[1]?.excludeFromGoal).toBe(false)
  })
})

describe('restoreMembershipGoalCounts', () => {
  it('reverts one row and keeps a newer change on another', () => {
    const previous = [
      membership({ countsTowardGoal: true, excludeFromGoal: false, id: 1 }),
      membership({ countsTowardGoal: true, excludeFromGoal: false, id: 2 }),
    ]
    const current = [
      membership({ countsTowardGoal: false, excludeFromGoal: true, id: 1 }),
      membership({ countsTowardGoal: false, excludeFromGoal: true, id: 2 }),
    ]

    const restored = restoreMembershipGoalCounts(current, previous, 1)

    expect(restored.map((row) => [row.id, row.excludeFromGoal])).toEqual([
      [1, false],
      [2, true],
    ])
  })

  it('does not put back a row removed while the update was in flight', () => {
    const previous = [membership({ id: 1 }), membership({ id: 2 })]
    const current = [membership({ id: 2 })]

    expect(restoreMembershipGoalCounts(current, previous, 1).map((row) => row.id)).toEqual([2])
  })
})

function challenge(
  overrides: Partial<NonNullable<Watchlist['challenge']>> = {},
): NonNullable<Watchlist['challenge']> {
  return {
    enabled: true,
    goalCount: 10,
    goalType: 'count',
    includeRewatches: false,
    priorCompletionRule: 'exclude_if_already_completed',
    tvCountRule: 'tv_as_series',
    ...overrides,
  }
}

function membership(
  overrides: {
    completedAt?: string
    countsTowardGoal?: boolean
    excludeFromGoal?: boolean
    id?: number
    libraryItemIdOnly?: boolean
    mediaType?: Media['mediaType']
    rewatchCount?: number
    status?: LibraryItem['status']
    title?: string
  } = {},
): WatchlistMembership {
  const id = overrides.id ?? 1
  const libraryItem = overrides.libraryItemIdOnly
    ? id + 100
    : ({
        completedAt: overrides.completedAt ?? '2026-07-01T00:00:00.000Z',
        id: id + 100,
        media: {
          id: id + 200,
          mediaType: overrides.mediaType ?? 'movie',
          title: overrides.title ?? `Title ${id}`,
          tmdbId: id,
        } as Media,
        progress: { type: overrides.mediaType ?? 'movie' },
        rewatchCount: overrides.rewatchCount ?? 0,
        status: overrides.status ?? 'watching',
      } as LibraryItem)

  return {
    addedAt,
    countsTowardGoal: overrides.countsTowardGoal ?? true,
    excludeFromGoal: overrides.excludeFromGoal ?? false,
    id,
    libraryItem,
    watchlist: 1,
  } as WatchlistMembership
}
