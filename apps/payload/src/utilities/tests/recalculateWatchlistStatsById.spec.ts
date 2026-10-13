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
