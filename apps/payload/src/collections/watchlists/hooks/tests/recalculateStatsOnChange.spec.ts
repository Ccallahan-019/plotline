import type { PayloadRequest } from 'payload'

import { describe, expect, it, vi } from 'vitest'

import { recalculateStatsAfterWatchlistChange } from '../recalculateStatsOnChange'

const addedAt = '2026-06-01T00:00:00.000Z'
const completedBefore = '2026-01-15T00:00:00.000Z'

function challenge(overrides: Record<string, unknown> = {}) {
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

function createReq(membershipSeed: Record<string, unknown>, watchlist: Record<string, unknown>) {
  let membership = structuredClone(membershipSeed)
  const updates: Array<{ collection: string; data: Record<string, unknown> }> = []

  const req = {
    context: {} as Record<string, unknown>,
    payload: {
      find: vi.fn(async ({ collection }: { collection: string }) => {
        if (collection === 'watchlist-memberships') {
          return { docs: [structuredClone(membership)] }
        }

        return { docs: [] }
      }),
      findByID: vi.fn(async () => watchlist),
      update: vi.fn(
        async ({
          collection,
          context,
          data,
        }: {
          collection: string
          context?: Record<string, unknown>
          data: Record<string, unknown>
        }) => {
          if (context) {
            req.context =
              Object.keys(req.context).length === 0
                ? { ...context }
                : { ...req.context, ...context }
          }

          updates.push({ collection, data: { ...data } })

          if (collection === 'watchlist-memberships') {
            membership = { ...membership, ...data }
          }

          return data
        },
      ),
    },
  }

  return { req: req as unknown as PayloadRequest, updates }
}

function hookArgs(
  req: PayloadRequest,
  options: {
    doc: Record<string, unknown>
    operation?: 'create' | 'update'
    previousDoc?: Record<string, unknown>
  },
) {
  return {
    context: {},
    doc: options.doc,
    operation: options.operation ?? 'update',
    previousDoc: options.previousDoc,
    req,
  } as Parameters<typeof recalculateStatsAfterWatchlistChange>[0]
}

function preJoinMovieMembership(overrides: Record<string, unknown> = {}) {
  return {
    addedAt,
    countsTowardGoal: false,
    episodesAtJoin: 0,
    episodesCountedForList: 0,
    goalWeight: 1,
    id: 7,
    libraryItem: {
      completedAt: completedBefore,
      id: 11,
      media: { id: 5, mediaType: 'movie', runtime: 120 },
      progress: { type: 'movie', watched: true },
      rewatchCount: 1,
      status: 'completed',
    },
    listStatus: 'planned',
    ...overrides,
  }
}

function statsCompleted(updates: Array<{ collection: string; data: Record<string, unknown> }>) {
  const statsUpdate = updates.find((update) => update.collection === 'watchlists')
  const statsCache = statsUpdate?.data.statsCache as { completed?: number } | undefined

  return statsCache?.completed
}

describe('recalculateStatsAfterWatchlistChange', () => {
  it('counts a pre-join rewatch when includeRewatches is turned on', async () => {
    const doc = {
      challenge: challenge({ includeRewatches: true }),
      createdAt: '2026-01-01T00:00:00.000Z',
      id: 3,
    }
    const { req, updates } = createReq(preJoinMovieMembership(), doc)

    await recalculateStatsAfterWatchlistChange(
      hookArgs(req, {
        doc,
        previousDoc: { challenge: challenge({ includeRewatches: false }), id: 3 },
      }),
    )

    const membershipUpdate = updates.find((update) => update.collection === 'watchlist-memberships')

    expect(membershipUpdate?.data).toMatchObject({
      completedForListAt: completedBefore,
      countsTowardGoal: true,
      listStatus: 'completed',
    })
    expect(statsCompleted(updates)).toBe(1)
  })

  it('keeps a manual exclusion from counting when rewatches become eligible', async () => {
    const doc = {
      challenge: challenge({ includeRewatches: true }),
      createdAt: '2026-01-01T00:00:00.000Z',
      id: 3,
    }
    const { req, updates } = createReq(preJoinMovieMembership({ excludeFromGoal: true }), doc)

    await recalculateStatsAfterWatchlistChange(
      hookArgs(req, {
        doc,
        previousDoc: { challenge: challenge({ includeRewatches: false }), id: 3 },
      }),
    )

    expect(updates.filter((update) => update.collection === 'watchlist-memberships')).toEqual([])
    expect(statsCompleted(updates)).toBe(0)
  })

  it('re-derives goal weight without clearing a manual exclusion', async () => {
    const doc = {
      challenge: challenge({ tvCountRule: 'tv_by_episode' }),
      createdAt: '2026-01-01T00:00:00.000Z',
      id: 3,
    }
    const { req, updates } = createReq(
      {
        addedAt,
        countsTowardGoal: false,
        episodesAtJoin: 0,
        episodesCountedForList: 4,
        excludeFromGoal: true,
        goalWeight: 1,
        id: 7,
        libraryItem: {
          completedAt: null,
          id: 11,
          media: { id: 5, mediaType: 'tv', runtime: 40 },
          progress: { episodesWatched: 4, type: 'tv' },
          rewatchCount: 0,
          status: 'watching',
        },
        listStatus: 'in_progress',
      },
      doc,
    )

    await recalculateStatsAfterWatchlistChange(
      hookArgs(req, {
        doc,
        previousDoc: { challenge: challenge({ tvCountRule: 'tv_as_series' }), id: 3 },
      }),
    )

    const membershipUpdate = updates.find((update) => update.collection === 'watchlist-memberships')

    expect(membershipUpdate?.data).toMatchObject({
      countsTowardGoal: false,
      goalWeight: 4,
      listStatus: 'in_progress',
    })
    expect(membershipUpdate?.data).not.toHaveProperty('excludeFromGoal')
  })

  it('drops that rewatch when includeRewatches is turned off', async () => {
    const doc = {
      challenge: challenge({ includeRewatches: false }),
      createdAt: '2026-01-01T00:00:00.000Z',
      id: 3,
    }
    const { req, updates } = createReq(
      preJoinMovieMembership({
        completedForListAt: completedBefore,
        countsTowardGoal: true,
        listStatus: 'completed',
      }),
      doc,
    )

    await recalculateStatsAfterWatchlistChange(
      hookArgs(req, {
        doc,
        previousDoc: { challenge: challenge({ includeRewatches: true }), id: 3 },
      }),
    )

    const membershipUpdate = updates.find((update) => update.collection === 'watchlist-memberships')

    expect(membershipUpdate?.data).toMatchObject({
      countsTowardGoal: false,
      listStatus: 'planned',
    })
    expect(membershipUpdate?.data).not.toHaveProperty('completedForListAt')
    expect(statsCompleted(updates)).toBe(0)
  })

  it('refreshes stats without rewriting memberships when only the due date changes', async () => {
    const previousChallenge = challenge({
      dueDate: '2026-12-01T00:00:00.000Z',
      includeRewatches: true,
    })
    const doc = {
      challenge: challenge({
        dueDate: '2026-12-31T00:00:00.000Z',
        includeRewatches: true,
      }),
      createdAt: '2026-01-01T00:00:00.000Z',
      id: 3,
    }
    const { req, updates } = createReq(
      preJoinMovieMembership({
        completedForListAt: completedBefore,
        countsTowardGoal: true,
        listStatus: 'completed',
      }),
      doc,
    )

    await recalculateStatsAfterWatchlistChange(
      hookArgs(req, {
        doc,
        previousDoc: { challenge: previousChallenge, id: 3 },
      }),
    )

    expect(updates.some((update) => update.collection === 'watchlist-memberships')).toBe(false)
    expect(statsCompleted(updates)).toBe(1)
  })

  it('leaves skipped memberships out of the re-derive', async () => {
    const doc = {
      challenge: challenge({ includeRewatches: true }),
      createdAt: '2026-01-01T00:00:00.000Z',
      id: 3,
    }
    const { req, updates } = createReq(preJoinMovieMembership({ listStatus: 'skipped' }), doc)

    await recalculateStatsAfterWatchlistChange(
      hookArgs(req, {
        doc,
        previousDoc: { challenge: challenge({ includeRewatches: false }), id: 3 },
      }),
    )

    expect(updates.some((update) => update.collection === 'watchlist-memberships')).toBe(false)
    expect(statsCompleted(updates)).toBe(0)
  })

  it('does nothing when the challenge did not change', async () => {
    const storedChallenge = challenge({ includeRewatches: true })
    const doc = { challenge: storedChallenge, id: 3 }
    const { req, updates } = createReq(preJoinMovieMembership(), doc)

    await recalculateStatsAfterWatchlistChange(
      hookArgs(req, {
        doc,
        previousDoc: { challenge: storedChallenge, id: 3 },
      }),
    )

    expect(req.payload.find).not.toHaveBeenCalled()
    expect(updates).toEqual([])
  })

  it('discards a stored list-size finish when a rule changes which titles qualify', async () => {
    const storedCompletedAt = '2026-02-01T00:00:00.000Z'
    const doc = {
      challenge: challenge({ goalCount: null, goalType: 'list_size', tvCountRule: 'movies_only' }),
      createdAt: '2026-01-01T00:00:00.000Z',
      id: 3,
      statsCache: { completedAt: storedCompletedAt, completedTitleCount: 5 },
    }
    const { req, updates } = createReq(
      preJoinMovieMembership({
        countsTowardGoal: true,
        libraryItem: {
          completedAt: '2026-07-01T00:00:00.000Z',
          id: 11,
          media: { id: 5, mediaType: 'movie', runtime: 120 },
          progress: { type: 'movie', watched: true },
          rewatchCount: 0,
          status: 'completed',
        },
        listStatus: 'completed',
      }),
      doc,
    )

    await recalculateStatsAfterWatchlistChange(
      hookArgs(req, {
        doc,
        previousDoc: {
          challenge: challenge({
            goalCount: null,
            goalType: 'list_size',
            tvCountRule: 'tv_as_series',
          }),
          id: 3,
        },
      }),
    )

    const statsUpdate = updates.find((update) => update.collection === 'watchlists')
    const statsCache = statsUpdate?.data.statsCache as
      | { completedAt?: string; completedTitleCount?: number }
      | undefined

    expect(statsCache?.completedTitleCount).toBe(1)
    expect(statsCache?.completedAt).not.toBe(storedCompletedAt)
  })
})
