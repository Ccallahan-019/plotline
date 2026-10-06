import type { LibraryItem, WatchEvent } from '@plotline/payload-types'
import type { PayloadRequest } from 'payload'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { requireProfileContext, requireServiceAuth } from '../helpers'
import { watchedEpisodesEndpoint } from '../watched-episodes'

vi.mock('../helpers', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../helpers')>()

  return {
    ...actual,
    requireProfileContext: vi.fn(async () => ({ profileId: 22 })),
    requireServiceAuth: vi.fn(async () => null),
  }
})

type WatchedEpisodesDb = {
  libraryItem: LibraryItem | null
  watchEventPages: Array<Array<{ tvContext?: null | WatchEvent['tvContext'] }>>
}

function createLibraryItem(type: 'movie' | 'tv'): LibraryItem {
  return {
    createdAt: '2026-01-01T00:00:00.000Z',
    id: 11,
    media: 5,
    profile: 22,
    progress: {
      type,
    },
    status: 'watching',
    updatedAt: '2026-01-01T00:00:00.000Z',
  }
}

function createReq(search: string, db: WatchedEpisodesDb): PayloadRequest {
  return {
    payload: {
      find: vi.fn(async ({ collection, page }: { collection: string; page?: number }) => {
        if (collection === 'library-items') {
          return { docs: db.libraryItem ? [db.libraryItem] : [] }
        }

        const index = (page ?? 1) - 1
        const docs = db.watchEventPages[index] ?? []

        return {
          docs,
          hasNextPage: index < db.watchEventPages.length - 1,
        }
      }),
    },
    url: `http://localhost/api/library/watched-episodes${search}`,
  } as unknown as PayloadRequest
}

async function readResponse(req: PayloadRequest): Promise<Response> {
  const response = await watchedEpisodesEndpoint.handler(req)

  if (!(response instanceof Response)) {
    throw new Error('Expected watched-episodes handler to return a Response')
  }

  return response
}

describe('watchedEpisodesEndpoint', () => {
  beforeEach(() => {
    vi.mocked(requireServiceAuth).mockResolvedValue(null)
    vi.mocked(requireProfileContext).mockResolvedValue({ profileId: 22 })
  })

  it('returns 401 when the service credential is missing', async () => {
    vi.mocked(requireServiceAuth).mockResolvedValueOnce(
      Response.json({ error: 'Unauthorized' }, { status: 401 }),
    )
    const req = createReq('?libraryItemId=11', {
      libraryItem: createLibraryItem('tv'),
      watchEventPages: [],
    })

    const response = await readResponse(req)

    expect(response.status).toBe(401)
    expect(req.payload.find).not.toHaveBeenCalled()
  })

  it('returns 400 when libraryItemId is missing or not a positive integer', async () => {
    const missing = createReq('', {
      libraryItem: createLibraryItem('tv'),
      watchEventPages: [],
    })
    const invalid = createReq('?libraryItemId=1.5', {
      libraryItem: createLibraryItem('tv'),
      watchEventPages: [],
    })

    const missingResponse = await readResponse(missing)
    const invalidResponse = await readResponse(invalid)

    expect(missingResponse.status).toBe(400)
    expect(await missingResponse.json()).toEqual({ error: 'libraryItemId is required' })
    expect(invalidResponse.status).toBe(400)
    expect(missing.payload.find).not.toHaveBeenCalled()
    expect(invalid.payload.find).not.toHaveBeenCalled()
  })

  it('returns 404 when the library item is missing or not owned', async () => {
    const req = createReq('?libraryItemId=11', {
      libraryItem: null,
      watchEventPages: [[{ tvContext: { episode: 1, season: 1 } }]],
    })

    const response = await readResponse(req)

    expect(response.status).toBe(404)
    expect(await response.json()).toEqual({ error: 'Library item not found' })
    expect(req.payload.find).toHaveBeenCalledTimes(1)
    expect(req.payload.find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'library-items',
        overrideAccess: true,
        where: {
          and: [{ id: { equals: 11 } }, { profile: { equals: 22 } }],
        },
      }),
    )
  })

  it('returns an empty array for movies without scanning watch events', async () => {
    const req = createReq('?libraryItemId=11', {
      libraryItem: createLibraryItem('movie'),
      watchEventPages: [[{ tvContext: { episode: 1, season: 1 } }]],
    })

    const response = await readResponse(req)

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual([])
    expect(req.payload.find).toHaveBeenCalledTimes(1)
  })

  it('returns unique sorted pairs and ignores events without episode coordinates', async () => {
    const req = createReq('?libraryItemId=11', {
      libraryItem: createLibraryItem('tv'),
      watchEventPages: [
        [
          { tvContext: { episode: 1, season: 2 } },
          { tvContext: null },
          {},
          { tvContext: { season: 1 } },
          { tvContext: { episode: 1.5, season: 1 } },
          { tvContext: { episode: 2, season: 1 } },
        ],
        [{ tvContext: { episode: 2, season: 1 } }, { tvContext: { episode: 1, season: 0 } }],
      ],
    })

    const response = await readResponse(req)

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual([
      { episode: 1, season: 0 },
      { episode: 2, season: 1 },
      { episode: 1, season: 2 },
    ])
    expect(req.payload.find).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        collection: 'watch-events',
        overrideAccess: true,
        page: 1,
        select: { tvContext: true },
        where: {
          and: [
            { libraryItem: { equals: 11 } },
            { 'tvContext.season': { exists: true } },
            { 'tvContext.episode': { exists: true } },
          ],
        },
      }),
    )
    expect(req.payload.find).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        collection: 'watch-events',
        page: 2,
      }),
    )
  })
})
