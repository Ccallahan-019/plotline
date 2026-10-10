import type { PayloadRequest } from 'payload'

import { describe, expect, it, vi } from 'vitest'

import { initializeMembershipChallengeFields } from '../initializeMembershipChallengeFields'

type FindByIDArgs = {
  collection: string
  req?: PayloadRequest
}

const addedAt = '2026-01-01T00:00:00.000Z'

function createReq(options?: { missingLibraryItem?: boolean }) {
  const request: { current?: PayloadRequest } = {}
  const findByID = vi.fn(async ({ collection, req: queryReq }: FindByIDArgs) => {
    if (queryReq !== request.current) {
      return null
    }

    if (collection === 'watchlists') {
      return { challenge: null, id: 3, owner: 22 }
    }

    if (options?.missingLibraryItem) {
      return null
    }

    return {
      id: 11,
      media: { id: 5, mediaType: 'movie', runtime: 116 },
      profile: 22,
      progress: { type: 'movie', watched: false },
      status: 'planned',
    }
  })

  const req = {
    payload: {
      findByID,
    },
  } as unknown as PayloadRequest

  request.current = req

  return { findByID, req }
}

describe('initializeMembershipChallengeFields', () => {
  it('derives challenge fields from the library item on the caller transaction', async () => {
    const { findByID, req } = createReq()

    await expect(
      initializeMembershipChallengeFields({
        data: { addedAt, libraryItem: 11, watchlist: 3 },
        operation: 'create',
        req,
      } as unknown as Parameters<typeof initializeMembershipChallengeFields>[0]),
    ).resolves.toMatchObject({
      addedAt,
      countsTowardGoal: true,
      episodesAtJoin: 0,
      episodesCountedForList: 0,
      goalWeight: 1,
      listStatus: 'planned',
    })

    expect(findByID).toHaveBeenCalledWith(
      expect.objectContaining({ collection: 'watchlists', id: 3, req }),
    )
    expect(findByID).toHaveBeenCalledWith(
      expect.objectContaining({ collection: 'library-items', depth: 1, id: 11, req }),
    )
  })

  it('returns the original data when the library item lookup misses', async () => {
    const { req } = createReq({ missingLibraryItem: true })
    const data = { addedAt, libraryItem: 11, watchlist: 3 }

    await expect(
      initializeMembershipChallengeFields({
        data,
        operation: 'create',
        req,
      } as unknown as Parameters<typeof initializeMembershipChallengeFields>[0]),
    ).resolves.toBe(data)
  })
})
