import type { Media } from '@plotline/payload-types'
import type { PayloadRequest } from 'payload'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { withLibraryItemCreateLock } from '../../collections/watch-events/utils/withLibraryItemRowLock'
import { runInPayloadTransaction } from '../../utilities/runInPayloadTransaction'
import { upsertMediaFromTmdb } from '../../utilities/upsertMediaFromTmdb'
import { createLibraryItemEndpoint } from '../create-library-item'
import { requireProfileContext, requireServiceAuth } from '../helpers'

vi.mock('../helpers', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../helpers')>()

  return {
    ...actual,
    requireProfileContext: vi.fn(async () => ({ profileId: 22 })),
    requireServiceAuth: vi.fn(async () => null),
  }
})

vi.mock('../../utilities/upsertMediaFromTmdb', () => ({
  upsertMediaFromTmdb: vi.fn(),
}))

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

let insideCreateLock = false
let insideTransaction = false

const movie = {
  id: 5,
  mediaType: 'movie',
  title: 'Arrival',
} as Media

const series = {
  id: 8,
  mediaType: 'tv',
  title: 'The Leftovers',
} as Media

function createReq(body: unknown, existing = false) {
  const find = vi.fn(async () => {
    expect(insideTransaction).toBe(true)
    expect(insideCreateLock).toBe(true)

    return {
      docs: existing ? [{ id: 11, media: 5, profile: 22 }] : [],
    }
  })
  const create = vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
    expect(insideTransaction).toBe(true)
    expect(insideCreateLock).toBe(true)

    return {
      id: 11,
      ...data,
    }
  })

  const req = {
    json: async () => body,
    payload: {
      create,
      find,
    },
  } as unknown as PayloadRequest

  return { create, find, req }
}

async function readResponse(req: PayloadRequest): Promise<Response> {
  const response = await createLibraryItemEndpoint.handler(req)

  if (!(response instanceof Response)) {
    throw new Error('Expected create-library-item handler to return a Response')
  }

  return response
}

const arrival = {
  mediaType: 'movie' as const,
  posterPath: '/poster.jpg',
  releaseStatus: 'released' as const,
  title: 'Arrival',
  tmdbId: 329865,
}

describe('createLibraryItemEndpoint', () => {
  beforeEach(() => {
    insideCreateLock = false
    insideTransaction = false
    vi.mocked(requireServiceAuth).mockResolvedValue(null)
    vi.mocked(requireProfileContext).mockResolvedValue({ profileId: 22 })
    vi.mocked(upsertMediaFromTmdb).mockReset()
    vi.mocked(upsertMediaFromTmdb).mockResolvedValue(movie)
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

  it('creates a planned movie row from tmdb fields', async () => {
    const { create, find, req } = createReq(arrival)

    const response = await readResponse(req)

    expect(response.status).toBe(200)
    expect(upsertMediaFromTmdb).toHaveBeenCalledWith(
      req,
      expect.objectContaining({
        mediaType: 'movie',
        posterPath: '/poster.jpg',
        status: 'released',
        title: 'Arrival',
        tmdbId: 329865,
      }),
    )
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'library-items',
        overrideAccess: true,
        req,
        where: {
          and: [{ profile: { equals: 22 } }, { media: { equals: 5 } }],
        },
      }),
    )
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'library-items',
        data: {
          media: 5,
          profile: 22,
          progress: {
            type: 'movie',
            watched: false,
          },
          source: 'manual',
          status: 'planned',
        },
        overrideAccess: true,
        req,
      }),
    )
    expect(runInPayloadTransaction).toHaveBeenCalledOnce()
    expect(withLibraryItemCreateLock).toHaveBeenCalledWith(req, 22, 5, expect.any(Function))
    expect(await response.json()).toEqual({
      libraryItem: {
        id: 11,
        media: 5,
        profile: 22,
        progress: {
          type: 'movie',
          watched: false,
        },
        source: 'manual',
        status: 'planned',
      },
    })
  })

  it('stores the requested status for a new tv row', async () => {
    vi.mocked(upsertMediaFromTmdb).mockResolvedValue(series)
    const { create, req } = createReq({
      mediaType: 'tv',
      status: 'watching',
      title: 'The Leftovers',
      tmdbId: 62710,
    })

    const response = await readResponse(req)

    expect(response.status).toBe(200)
    expect(upsertMediaFromTmdb).toHaveBeenCalledWith(
      req,
      expect.objectContaining({
        mediaType: 'tv',
        status: undefined,
        title: 'The Leftovers',
        tmdbId: 62710,
      }),
    )
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          media: 8,
          profile: 22,
          progress: {
            type: 'tv',
            watched: undefined,
          },
          source: 'manual',
          status: 'watching',
        },
      }),
    )
    expect(withLibraryItemCreateLock).toHaveBeenCalledWith(req, 22, 8, expect.any(Function))
  })

  it('returns 409 when the profile already has the title', async () => {
    const { create, req } = createReq(arrival, true)

    const response = await readResponse(req)

    expect(response.status).toBe(409)
    expect(await response.json()).toEqual({ error: 'Library item already exists' })
    expect(create).not.toHaveBeenCalled()
    expect(withLibraryItemCreateLock).toHaveBeenCalledWith(req, 22, 5, expect.any(Function))
  })

  it('returns 400 when tmdb identity is missing', async () => {
    const { create, find, req } = createReq({ status: 'planned' })

    const response = await readResponse(req)

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({
      error: 'mediaId or (tmdbId, mediaType, and title) are required',
    })
    expect(upsertMediaFromTmdb).not.toHaveBeenCalled()
    expect(find).not.toHaveBeenCalled()
    expect(create).not.toHaveBeenCalled()
    expect(runInPayloadTransaction).not.toHaveBeenCalled()
    expect(withLibraryItemCreateLock).not.toHaveBeenCalled()
  })

  it('returns 400 when status is invalid', async () => {
    const { create, req } = createReq({ ...arrival, status: 'finished' })

    const response = await readResponse(req)

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({
      error: 'status must be planned, watching, completed, dropped, or on_hold',
    })
    expect(upsertMediaFromTmdb).not.toHaveBeenCalled()
    expect(create).not.toHaveBeenCalled()
    expect(runInPayloadTransaction).not.toHaveBeenCalled()
  })
})
