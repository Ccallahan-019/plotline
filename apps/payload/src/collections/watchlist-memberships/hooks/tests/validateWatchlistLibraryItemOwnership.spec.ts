import type { PayloadRequest } from 'payload'

import { describe, expect, it, vi } from 'vitest'

import { validateWatchlistLibraryItemOwnership } from '../validateWatchlistLibraryItemOwnership'

type FindByIDArgs = {
  collection: string
  req?: PayloadRequest
}

function createReq(options?: { libraryProfileId?: number; missingLibraryItem?: boolean }) {
  const request: { current?: PayloadRequest } = {}
  const findByID = vi.fn(async ({ collection, req: queryReq }: FindByIDArgs) => {
    if (queryReq !== request.current) {
      return null
    }

    if (collection === 'watchlists') {
      return { id: 3, owner: 22 }
    }

    if (options?.missingLibraryItem) {
      return null
    }

    return { id: 11, profile: options?.libraryProfileId ?? 22 }
  })

  const req = {
    payload: {
      findByID,
    },
  } as unknown as PayloadRequest

  request.current = req

  return { findByID, req }
}

describe('validateWatchlistLibraryItemOwnership', () => {
  it('reads the watchlist and library item on the caller transaction', async () => {
    const { findByID, req } = createReq()
    const data = { libraryItem: 11, watchlist: 3 }

    await expect(
      validateWatchlistLibraryItemOwnership({
        data,
        req,
      } as unknown as Parameters<typeof validateWatchlistLibraryItemOwnership>[0]),
    ).resolves.toBe(data)

    expect(findByID).toHaveBeenCalledWith(
      expect.objectContaining({ collection: 'watchlists', id: 3, req }),
    )
    expect(findByID).toHaveBeenCalledWith(
      expect.objectContaining({ collection: 'library-items', id: 11, req }),
    )
  })

  it('rejects a missing library item', async () => {
    const { req } = createReq({ missingLibraryItem: true })

    await expect(
      validateWatchlistLibraryItemOwnership({
        data: { libraryItem: 11, watchlist: 3 },
        req,
      } as unknown as Parameters<typeof validateWatchlistLibraryItemOwnership>[0]),
    ).rejects.toMatchObject({
      message: 'Library item not found',
      status: 404,
    })
  })

  it('rejects a library item owned by a different profile', async () => {
    const { req } = createReq({ libraryProfileId: 99 })

    await expect(
      validateWatchlistLibraryItemOwnership({
        data: { libraryItem: 11, watchlist: 3 },
        req,
      } as unknown as Parameters<typeof validateWatchlistLibraryItemOwnership>[0]),
    ).rejects.toMatchObject({
      message: 'Library item profile must match watchlist owner',
      status: 400,
    })
  })
})
