import type { Payload } from 'payload'

import { describe, expect, it, vi } from 'vitest'

import { recalculateWatchlistStatsById } from '../recalculateWatchlistStatsById'

const MEMBERSHIP_COUNT = 1001

function createCompletedMembership(id: number) {
  return {
    addedAt: '2026-01-01T00:00:00.000Z',
    completedForListAt: '2026-01-02T00:00:00.000Z',
    countsTowardGoal: true,
    episodesCountedForList: 0,
    goalWeight: 1,
    id,
    libraryItem: {
      completedAt: '2026-01-02T00:00:00.000Z',
      id: id + 10_000,
      media: {
        id: id + 20_000,
        mediaType: 'movie',
        runtime: 90,
      },
      status: 'completed',
    },
    listStatus: 'completed',
  }
}

describe('recalculateWatchlistStatsById', () => {
  it('includes every membership in statsCache, not only the first page', async () => {
    const docs = Array.from({ length: MEMBERSHIP_COUNT }, (_, index) =>
      createCompletedMembership(index + 1),
    )
    const find = vi.fn(async () => ({ docs }))
    const findByID = vi.fn(async () => ({
      challenge: { enabled: false },
      createdAt: '2026-01-01T00:00:00.000Z',
      id: 7,
    }))
    const update = vi.fn(async () => ({}))
    const payload = { find, findByID, update } as unknown as Payload

    await recalculateWatchlistStatsById(payload, 7)

    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'watchlist-memberships',
        limit: 0,
        pagination: false,
        where: {
          watchlist: {
            equals: 7,
          },
        },
      }),
    )
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          statsCache: expect.objectContaining({
            completed: MEMBERSHIP_COUNT,
            totalEligible: MEMBERSHIP_COUNT,
          }),
        }),
      }),
    )
  })
})

describe('recalculateWatchlistStatsById list-size completion', () => {
  const finishedAt = '2026-10-05T12:00:00.000Z'
  const listSizeWatchlist = {
    challenge: {
      dueDate: '2099-12-31T00:00:00.000Z',
      enabled: true,
      goalType: 'list_size',
      startDate: '2026-10-01T00:00:00.000Z',
    },
    createdAt: '2026-10-01T00:00:00.000Z',
    id: 7,
    statsCache: {
      completed: 3,
      completedAt: finishedAt,
      completedTitleCount: 3,
      goalCount: 3,
      inProgress: 0,
      lastCalculatedAt: finishedAt,
      newTitlesSinceCompletion: 0,
      percentComplete: 100,
      remaining: 0,
      status: 'completed',
      totalEligible: 3,
    },
  }

  // Three finished titles plus one added after the finish.
  function createPayload() {
    const docs = [1, 2, 3].map(createCompletedMembership)

    docs.push({
      ...createCompletedMembership(4),
      addedAt: '2026-10-06T00:00:00.000Z',
      listStatus: 'planned',
    })

    const update = vi.fn(async () => ({}))
    const payload = {
      find: vi.fn(async () => ({ docs })),
      findByID: vi.fn(async () => listSizeWatchlist),
      update,
    } as unknown as Payload

    return { payload, update }
  }

  it('keeps the stored finish and counts the added title as new', async () => {
    const { payload, update } = createPayload()

    await recalculateWatchlistStatsById(payload, 7)

    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          statsCache: expect.objectContaining({
            completedAt: finishedAt,
            completedTitleCount: 3,
            newTitlesSinceCompletion: 1,
            remaining: 0,
            status: 'completed',
            unfinishedTitlesSinceCompletion: 1,
          }),
        },
      }),
    )
  })

  it('measures the goal live again when the completion is reopened', async () => {
    const { payload, update } = createPayload()

    await recalculateWatchlistStatsById(payload, 7, undefined, { reopenCompletion: true })

    const [{ data }] = update.mock.calls[0] as unknown as [{ data: { statsCache: object } }]

    expect(data.statsCache).toMatchObject({
      completed: 3,
      goalCount: 4,
      remaining: 1,
      status: 'active',
      totalEligible: 4,
    })
    expect(data.statsCache).not.toHaveProperty('completedAt')
    expect(data.statsCache).not.toHaveProperty('newTitlesSinceCompletion')
    expect(data.statsCache).not.toHaveProperty('unfinishedTitlesSinceCompletion')
  })

  it('keeps the original finish when reopening a list that is already fully watched', async () => {
    const docs = [1, 2, 3].map(createCompletedMembership)

    docs.push({
      ...createCompletedMembership(4),
      addedAt: '2026-10-06T00:00:00.000Z',
    })

    const update = vi.fn(async () => ({}))
    const payload = {
      find: vi.fn(async () => ({ docs })),
      findByID: vi.fn(async () => listSizeWatchlist),
      update,
    } as unknown as Payload

    await recalculateWatchlistStatsById(payload, 7, undefined, { reopenCompletion: true })

    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          statsCache: expect.objectContaining({
            completedAt: finishedAt,
            completedTitleCount: 3,
            newTitlesSinceCompletion: 1,
            status: 'completed',
            unfinishedTitlesSinceCompletion: 0,
          }),
        },
      }),
    )
  })
})
