import type { Media } from '@plotline/payload-types'
import type { PayloadRequest } from 'payload'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { withLibraryItemCreateLock } from '../../collections/watch-events/utils/withLibraryItemRowLock'
import { runInPayloadTransaction } from '../../utilities/runInPayloadTransaction'
import { addToListEndpoint } from '../add-to-list'
import { requireProfileContext, requireServiceAuth } from '../helpers'

vi.mock('../helpers', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../helpers')>()

  return {
    ...actual,
    requireProfileContext: vi.fn(async () => ({ profileId: 22 })),
    requireServiceAuth: vi.fn(async () => null),
  }
})

vi.mock('../../collections/watch-events/utils/withLibraryItemRowLock', () => ({
  withLibraryItemCreateLock: vi.fn(
    async (
      _req: PayloadRequest,
      _profileId: number,
      _mediaId: number,
      fn: () => Promise<unknown>,
    ) => fn(),
  ),
}))

vi.mock('../../utilities/runInPayloadTransaction', () => ({
  runInPayloadTransaction: vi.fn(async (_req: unknown, fn: () => Promise<unknown>) => fn()),
}))

const movie = {
  id: 5,
  mediaType: 'movie',
  title: 'Arrival',
} as Media

let insideCreateLock = false
let insideTransaction = false

type FindArgs = {
  collection: string
}

function createReq(body: unknown, options?: { existingLibrary?: boolean; existingMembership?: boolean; ownerId?: number; watchlist?: boolean }) {
  const calls: string[] = []
  const find = vi.fn(async ({ collection }: FindArgs) => {
    calls.push(`find:${collection}`)

    if (collection === 'watchlists') {
      expect(insideCreateLock).toBe(false)

      if (options?.watchlist === false) {
        return { docs: [] }
      }

      return { docs: [{ id: 3, owner: options?.ownerId ?? 22, slug: 'queue' }] }
    }

    expect(insideTransaction).toBe(true)
    expect(insideCreateLock).toBe(true)

    if (collection === 'library-items') {
      return {
        docs: options?.existingLibrary ? [{ id: 11, media: 5, profile: 22 }] : [],
      }
    }

    return {
      docs: options?.existingMembership ? [{ id: 9, libraryItem: 11, watchlist: 3 }] : [],
    }
  })
  const findByID = vi.fn(async () => {
    calls.push('findByID:media')
    expect(insideCreateLock).toBe(false)

    return movie
  })
  const create = vi.fn(async ({ collection, data }: { collection: string; data: Record<string, unknown> }) => {
    calls.push(`create:${collection}`)
    expect(insideTransaction).toBe(true)
    expect(insideCreateLock).toBe(true)

    return {
      id: collection === 'library-items' ? 11 : 9,
      ...data,
    }
  })

  const req = {
    json: async () => body,
    payload: {
      create,
      find,
      findByID,
    },
  } as unknown as PayloadRequest

  return { calls, create, find, req }
}

async function readResponse(req: PayloadRequest): Promise<Response> {
  const response = await addToListEndpoint.handler(req)

  if (!(response instanceof Response)) {
    throw new Error('Expected add-to-list handler to return a Response')
  }

  return response
}

describe('addToListEndpoint', () => {
  beforeEach(() => {
    insideCreateLock = false
    insideTransaction = false
    vi.mocked(requireServiceAuth).mockResolvedValue(null)
    vi.mocked(requireProfileContext).mockResolvedValue({ profileId: 22 })
    vi.mocked(runInPayloadTransaction).mockClear()
    vi.mocked(withLibraryItemCreateLock).mockClear()
    vi.mocked(runInPayloadTransaction).mockImplementation(async (_req, fn) => {
      insideTransaction = true

      try {
        return await fn()
      } finally {
        insideTransaction = false
      }
    })
    vi.mocked(withLibraryItemCreateLock).mockImplementation(
      async (_req, _profileId, _mediaId, fn) => {
        expect(insideTransaction).toBe(true)
        insideCreateLock = true

        try {
          return await fn()
        } finally {
          insideCreateLock = false
        }
      },
    )
  })

  it('creates the library item and membership inside the profile/media lock', async () => {
    const { calls, create, req } = createReq({ mediaId: 5, note: 'later', watchlistId: 3 })

    const response = await readResponse(req)

    expect(response.status).toBe(200)
    expect(calls).toEqual([
      'find:watchlists',
      'findByID:media',
      'find:library-items',
      'create:library-items',
      'find:watchlist-memberships',
      'create:watchlist-memberships',
    ])
    expect(create).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        collection: 'library-items',
        data: expect.objectContaining({
          media: 5,
          profile: 22,
          source: 'manual',
          status: 'planned',
        }),
        overrideAccess: true,
        req,
      }),
    )
    expect(create).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        collection: 'watchlist-memberships',
        data: expect.objectContaining({
          addedAt: expect.any(String),
          libraryItem: 11,
          note: 'later',
          watchlist: 3,
        }),
        overrideAccess: true,
        req,
      }),
    )
    expect(runInPayloadTransaction).toHaveBeenCalledOnce()
    expect(withLibraryItemCreateLock).toHaveBeenCalledWith(req, 22, 5, expect.any(Function))
  })

  it('reuses an existing library item and membership without inserting', async () => {
    const { create, req } = createReq(
      { mediaId: 5, watchlistId: 3 },
      { existingLibrary: true, existingMembership: true },
    )

    const response = await readResponse(req)

    expect(response.status).toBe(200)
    expect(create).not.toHaveBeenCalled()
    expect(withLibraryItemCreateLock).toHaveBeenCalledWith(req, 22, 5, expect.any(Function))
    expect(await response.json()).toEqual({
      libraryItem: { id: 11, media: 5, profile: 22 },
      membership: { id: 9, libraryItem: 11, watchlist: 3 },
      watchlist: { id: 3, owner: 22, slug: 'queue' },
    })
  })

  it('does not lock when the watchlist is missing or owned by someone else', async () => {
    const missing = createReq({ mediaId: 5, watchlistId: 3 }, { watchlist: false })
    const missingResponse = await readResponse(missing.req)

    expect(missingResponse.status).toBe(404)
    expect(missing.create).not.toHaveBeenCalled()
    expect(runInPayloadTransaction).not.toHaveBeenCalled()

    const foreign = createReq({ mediaId: 5, watchlistId: 3 }, { ownerId: 99 })
    const foreignResponse = await readResponse(foreign.req)

    expect(foreignResponse.status).toBe(404)
    expect(foreign.create).not.toHaveBeenCalled()
    expect(withLibraryItemCreateLock).not.toHaveBeenCalled()
  })
})
