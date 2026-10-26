import { describe, expect, it } from 'vitest'

import type { StatsMembershipInput, WatchlistChallengeConfig } from './types'

import { computeWatchlistStats } from './computeWatchlistStats'

const referenceDate = new Date('2026-10-11T15:00:00.000Z')

function listSizeChallenge(
  overrides: Partial<WatchlistChallengeConfig> = {},
): WatchlistChallengeConfig {
  return {
    dueDate: '2026-10-31T00:00:00.000Z',
    enabled: true,
    goalCount: null,
    goalRuntimeMinutes: null,
    goalType: 'list_size',
    startDate: '2026-10-01T00:00:00.000Z',
    tvCountRule: 'tv_as_series',
    ...overrides,
  }
}

function membership(overrides: Partial<StatsMembershipInput> = {}): StatsMembershipInput {
  return {
    addedAt: '2026-06-01T00:00:00.000Z',
    countsTowardGoal: true,
    goalWeight: 1,
    libraryItem: { status: 'planned' },
    listStatus: 'planned',
    media: { mediaType: 'movie', runtime: 100 },
    ...overrides,
  }
}

function series(overrides: Partial<StatsMembershipInput> = {}): StatsMembershipInput {
  return membership({
    media: { mediaType: 'tv', runtime: 45 },
    ...overrides,
  })
}

function statsFor(
  memberships: StatsMembershipInput[],
  challenge: WatchlistChallengeConfig = listSizeChallenge(),
) {
  return computeWatchlistStats({
    challenge,
    memberships,
    referenceDate,
  })
}

describe('computeWatchlistStats list_size', () => {
  it('counts each qualifying title once and ignores episode weights', () => {
    const stats = statsFor(
      [
        series({ goalWeight: 12, listStatus: 'completed' }),
        series({ goalWeight: 5, listStatus: 'in_progress' }),
        series({ goalWeight: 8, listStatus: 'planned' }),
      ],
      listSizeChallenge({ goalCount: 99, goalRuntimeMinutes: 500 }),
    )

    expect(stats).toMatchObject({
      completed: 1,
      goalCount: 3,
      inProgress: 1,
      percentComplete: 33,
      remaining: 2,
      status: 'active',
      totalEligible: 3,
    })
    expect(stats.completedRuntimeMinutes).toBeUndefined()
    expect(stats.goalRuntimeMinutes).toBeUndefined()
  })

  it('drops series when the TV rule is movies only', () => {
    const stats = statsFor(
      [
        membership({ listStatus: 'completed' }),
        series({ goalWeight: 20, listStatus: 'completed' }),
        series({ goalWeight: 4, listStatus: 'planned' }),
      ],
      listSizeChallenge({ tvCountRule: 'movies_only' }),
    )

    expect(stats).toMatchObject({
      completed: 1,
      goalCount: 1,
      inProgress: 0,
      percentComplete: 100,
      remaining: 0,
      status: 'completed',
      totalEligible: 1,
    })
  })

  it('drops skipped and excluded titles', () => {
    const stats = statsFor([
      membership({ listStatus: 'completed' }),
      membership({ listStatus: 'skipped' }),
      membership({ countsTowardGoal: false, listStatus: 'completed' }),
      series({ countsTowardGoal: false, listStatus: 'in_progress' }),
    ])

    expect(stats).toMatchObject({
      completed: 1,
      goalCount: 1,
      inProgress: 0,
      remaining: 0,
      totalEligible: 1,
    })
  })

  it('raises the goal when a qualifying title is added and finishes when the last unfinished title is removed', () => {
    const finished = statsFor([membership({ listStatus: 'completed' })])

    expect(finished).toMatchObject({
      completed: 1,
      goalCount: 1,
      onTrack: true,
      percentComplete: 100,
      projectedFinishDate: '2026-10-11',
      remaining: 0,
      status: 'completed',
    })

    const reopened = statsFor([
      membership({ listStatus: 'completed' }),
      membership({ goalWeight: 9, listStatus: 'in_progress' }),
    ])

    expect(reopened).toMatchObject({
      completed: 1,
      goalCount: 2,
      inProgress: 1,
      percentComplete: 50,
      remaining: 1,
      status: 'active',
    })

    const finishedAgain = statsFor([membership({ listStatus: 'completed' })])

    expect(finishedAgain).toMatchObject({
      goalCount: 1,
      remaining: 0,
      status: 'completed',
    })
  })

  it('keeps an empty qualifying set not_started', () => {
    const empty = statsFor([])

    expect(empty).toMatchObject({
      actualPerDay: 0,
      completed: 0,
      daysElapsed: 10,
      daysRemaining: 20,
      daysTotal: 30,
      goalCount: 0,
      inProgress: 0,
      percentComplete: 0,
      remaining: 0,
      status: 'not_started',
      totalEligible: 0,
    })
    expect(empty.onTrack).toBeUndefined()
    expect(empty.projectedFinishDate).toBeUndefined()
    expect(empty.requiredPerDay).toBeUndefined()

    const onlyExcluded = statsFor(
      [
        membership({ listStatus: 'skipped' }),
        membership({ countsTowardGoal: false, listStatus: 'completed' }),
        series({ listStatus: 'completed' }),
      ],
      listSizeChallenge({ tvCountRule: 'movies_only' }),
    )

    expect(onlyExcluded).toMatchObject({
      completed: 0,
      daysElapsed: 10,
      daysRemaining: 20,
      daysTotal: 30,
      goalCount: 0,
      percentComplete: 0,
      remaining: 0,
      status: 'not_started',
      totalEligible: 0,
    })
    expect(onlyExcluded.onTrack).toBeUndefined()
    expect(onlyExcluded.projectedFinishDate).toBeUndefined()
    expect(onlyExcluded.requiredPerDay).toBeUndefined()
  })

  it('is overdue when an empty list that never finished is past due', () => {
    const stats = statsFor(
      [],
      listSizeChallenge({
        dueDate: '2026-10-01T00:00:00.000Z',
        startDate: '2026-09-01T00:00:00.000Z',
      }),
    )

    expect(stats).toMatchObject({
      daysElapsed: 30,
      daysRemaining: 0,
      daysTotal: 30,
      percentComplete: 0,
      status: 'overdue',
    })
    expect(stats.completedAt).toBeUndefined()
    expect(stats.onTrack).toBeUndefined()
    expect(stats.projectedFinishDate).toBeUndefined()
    expect(stats.requiredPerDay).toBeUndefined()
  })

  it('keeps a required daily rate when every qualifying title is still planned', () => {
    const stats = statsFor([membership({ listStatus: 'planned' })])

    expect(stats).toMatchObject({
      goalCount: 1,
      percentComplete: 0,
      remaining: 1,
      requiredPerDay: 1 / 20,
      status: 'not_started',
    })
    expect(stats.onTrack).toBe(false)
  })

  it('keeps a count goal on weighted units and the stored target', () => {
    const stats = computeWatchlistStats({
      challenge: {
        dueDate: '2026-10-31T00:00:00.000Z',
        enabled: true,
        goalCount: 10,
        goalType: 'count',
        startDate: '2026-10-01T00:00:00.000Z',
        tvCountRule: 'tv_by_episode',
      },
      memberships: [
        series({ goalWeight: 4, listStatus: 'completed' }),
        series({ goalWeight: 2, listStatus: 'in_progress' }),
      ],
      referenceDate,
    })

    expect(stats).toMatchObject({
      completed: 4,
      goalCount: 10,
      inProgress: 2,
      remaining: 6,
      totalEligible: 10,
    })
  })
})

describe('computeWatchlistStats list_size completion latch', () => {
  const finishedAt = '2026-10-05T12:00:00.000Z'
  const latched = { completedAt: finishedAt, completedTitleCount: 3 }

  function threeDone() {
    return [
      membership({ listStatus: 'completed' }),
      membership({ listStatus: 'completed' }),
      membership({ listStatus: 'completed' }),
    ]
  }

  function withPrevious(
    memberships: StatsMembershipInput[],
    previousStats: Parameters<typeof computeWatchlistStats>[0]['previousStats'],
  ) {
    return computeWatchlistStats({
      challenge: listSizeChallenge(),
      memberships,
      previousStats,
      referenceDate,
    })
  }

  it('latches when every qualifying title on a non-empty list is done', () => {
    const stats = statsFor(threeDone())

    expect(stats).toMatchObject({
      completedAt: referenceDate.toISOString(),
      completedTitleCount: 3,
      newTitlesSinceCompletion: 0,
      remaining: 0,
      status: 'completed',
      unfinishedTitlesSinceCompletion: 0,
    })
  })

  it('does not latch while a title is unfinished or the list is empty', () => {
    const unfinished = statsFor([...threeDone(), membership({ listStatus: 'planned' })])

    expect(unfinished.completedAt).toBeUndefined()
    expect(unfinished.newTitlesSinceCompletion).toBeUndefined()
    expect(unfinished.unfinishedTitlesSinceCompletion).toBeUndefined()
    expect(statsFor([]).completedAt).toBeUndefined()
  })

  it('keeps the finish and counts titles added since', () => {
    const stats = withPrevious(
      [
        ...threeDone(),
        membership({ addedAt: '2026-10-06T00:00:00.000Z', listStatus: 'planned' }),
        membership({ addedAt: '2026-10-07T00:00:00.000Z', listStatus: 'in_progress' }),
      ],
      latched,
    )

    expect(stats).toMatchObject({
      completed: 3,
      completedAt: finishedAt,
      completedTitleCount: 3,
      goalCount: 3,
      inProgress: 1,
      newTitlesSinceCompletion: 2,
      percentComplete: 100,
      remaining: 0,
      status: 'completed',
      totalEligible: 3,
      unfinishedTitlesSinceCompletion: 2,
    })
  })

  it('counts a title added after the finish when an earlier title was removed', () => {
    const stats = withPrevious(
      [
        ...threeDone().slice(0, 2),
        membership({ addedAt: '2026-10-06T00:00:00.000Z', listStatus: 'planned' }),
      ],
      latched,
    )

    expect(stats).toMatchObject({
      completed: 3,
      completedAt: finishedAt,
      newTitlesSinceCompletion: 1,
      status: 'completed',
      unfinishedTitlesSinceCompletion: 1,
    })
  })

  it('counts a watched title added after the finish as new but not unfinished', () => {
    const stats = withPrevious(
      [
        ...threeDone(),
        membership({ addedAt: '2026-10-06T00:00:00.000Z', listStatus: 'completed' }),
      ],
      latched,
    )

    expect(stats).toMatchObject({
      completedAt: finishedAt,
      newTitlesSinceCompletion: 1,
      status: 'completed',
      unfinishedTitlesSinceCompletion: 0,
    })
  })

  it('keeps the original finish when reopening leaves every title watched', () => {
    const stats = computeWatchlistStats({
      challenge: listSizeChallenge(),
      memberships: [
        ...threeDone(),
        membership({ addedAt: '2026-10-06T00:00:00.000Z', listStatus: 'completed' }),
      ],
      previousStats: latched,
      referenceDate,
      reopenCompletion: true,
    })

    expect(stats).toMatchObject({
      completedAt: finishedAt,
      completedTitleCount: 3,
      newTitlesSinceCompletion: 1,
      status: 'completed',
      unfinishedTitlesSinceCompletion: 0,
    })
    expect(stats.completedAt).not.toBe(referenceDate.toISOString())
  })

  it('measures the goal live when reopening leaves a planned title', () => {
    const stats = computeWatchlistStats({
      challenge: listSizeChallenge(),
      memberships: [
        ...threeDone(),
        membership({ addedAt: '2026-10-06T00:00:00.000Z', listStatus: 'planned' }),
      ],
      previousStats: latched,
      referenceDate,
      reopenCompletion: true,
    })

    expect(stats).toMatchObject({
      completed: 3,
      goalCount: 4,
      remaining: 1,
      status: 'active',
      totalEligible: 4,
    })
    expect(stats.completedAt).toBeUndefined()
    expect(stats.newTitlesSinceCompletion).toBeUndefined()
    expect(stats.unfinishedTitlesSinceCompletion).toBeUndefined()
  })

  it('stays completed with no new titles after titles are removed', () => {
    const stats = withPrevious(threeDone().slice(0, 2), latched)

    expect(stats).toMatchObject({
      completed: 3,
      completedAt: finishedAt,
      newTitlesSinceCompletion: 0,
      status: 'completed',
    })
  })

  it('measures the goal live again once the latch is dropped', () => {
    const stats = withPrevious([...threeDone(), membership({ listStatus: 'planned' })], null)

    expect(stats).toMatchObject({
      completed: 3,
      goalCount: 4,
      percentComplete: 75,
      remaining: 1,
      status: 'active',
      totalEligible: 4,
    })
    expect(stats.completedAt).toBeUndefined()
    expect(stats.newTitlesSinceCompletion).toBeUndefined()
  })

  it('drops the finish when a title that was on the list at the finish is no longer watched', () => {
    const stats = withPrevious(
      [...threeDone().slice(0, 2), membership({ listStatus: 'in_progress' })],
      latched,
    )

    expect(stats).toMatchObject({
      completed: 2,
      goalCount: 3,
      inProgress: 1,
      remaining: 1,
      status: 'active',
      totalEligible: 3,
    })
    expect(stats.completedAt).toBeUndefined()
    expect(stats.newTitlesSinceCompletion).toBeUndefined()
  })

  it('latches a new finish once the un-watched title is watched again', () => {
    const stats = withPrevious(threeDone(), null)

    expect(stats.completedAt).toBe(referenceDate.toISOString())
  })

  it('keeps an open title added after the finish from dropping the finish', () => {
    const stats = withPrevious(
      [...threeDone(), membership({ addedAt: '2026-10-06T00:00:00.000Z', listStatus: 'planned' })],
      latched,
    )

    expect(stats).toMatchObject({ completedAt: finishedAt, status: 'completed' })
  })

  it('ignores the stored finish on reset and latches a fresh one when fully watched', () => {
    const stats = computeWatchlistStats({
      challenge: listSizeChallenge(),
      memberships: [
        ...threeDone().slice(0, 2),
        membership({ addedAt: '2026-10-06T00:00:00.000Z', listStatus: 'completed' }),
      ],
      previousStats: latched,
      referenceDate,
      resetCompletion: true,
    })

    expect(stats).toMatchObject({
      completedAt: referenceDate.toISOString(),
      completedTitleCount: 3,
      newTitlesSinceCompletion: 0,
    })
  })

  it('measures live on reset when the list is not fully watched', () => {
    const stats = computeWatchlistStats({
      challenge: listSizeChallenge(),
      memberships: [...threeDone(), membership({ listStatus: 'planned' })],
      previousStats: latched,
      referenceDate,
      resetCompletion: true,
    })

    expect(stats).toMatchObject({ goalCount: 4, remaining: 1, status: 'active' })
    expect(stats.completedAt).toBeUndefined()
  })

  it('ignores a stored latch for other goal types and for a disabled challenge', () => {
    const count = computeWatchlistStats({
      challenge: listSizeChallenge({ goalCount: 5, goalType: 'count' }),
      memberships: threeDone(),
      previousStats: latched,
      referenceDate,
    })
    const disabled = computeWatchlistStats({
      challenge: listSizeChallenge({ enabled: false }),
      memberships: threeDone(),
      previousStats: latched,
      referenceDate,
    })

    expect(count.completedAt).toBeUndefined()
    expect(disabled.completedAt).toBeUndefined()
  })
})
