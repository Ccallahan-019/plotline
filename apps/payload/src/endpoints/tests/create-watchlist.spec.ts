import type { PayloadRequest } from 'payload'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { Watchlists } from '../../collections/watchlists'
import { createWatchlistEndpoint } from '../create-watchlist'
import { requireProfileContext, requireServiceAuth } from '../helpers'

vi.mock('../helpers', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../helpers')>()

  return {
    ...actual,
    requireProfileContext: vi.fn(async () => ({ profileId: 22 })),
    requireServiceAuth: vi.fn(async () => null),
  }
})

const validBody = {
  challenge: { enabled: false },
  coverMedia: null,
  description: '  Friday queue  ',
  name: '  Friday Night  ',
  visibility: 'private',
}

function createReq(options: { body?: unknown; coverInLibrary?: boolean; takenSlugs?: string[] }) {
  const find = vi.fn(async ({ collection }: { collection: string }) => {
    if (collection === 'library-items') {
      return { docs: options.coverInLibrary === false ? [] : [{ id: 1 }] }
    }

    return { docs: (options.takenSlugs ?? []).map((slug) => ({ slug })) }
  })
  const create = vi.fn(async ({ data }: { data: Record<string, unknown> }) => ({
    id: 8,
    ...data,
  }))

  const req = {
    json: async () => options.body,
    payload: {
      create,
      find,
    },
  } as unknown as PayloadRequest

  return { create, req }
}

async function readResponse(req: PayloadRequest): Promise<Response> {
  const response = await createWatchlistEndpoint.handler(req)

  if (!(response instanceof Response)) {
    throw new Error('Expected create-watchlist handler to return a Response')
  }

  return response
}

describe('createWatchlistEndpoint', () => {
  it('is a watchlists collection endpoint', () => {
    expect(Watchlists.endpoints).toContain(createWatchlistEndpoint)
    expect(createWatchlistEndpoint.path).toBe('/create')
    expect(createWatchlistEndpoint.method).toBe('post')
  })

  beforeEach(() => {
    vi.mocked(requireServiceAuth).mockResolvedValue(null)
    vi.mocked(requireProfileContext).mockResolvedValue({ profileId: 22 })
  })

  it('creates an owned list and slugifies the name', async () => {
    const { create, req } = createReq({ body: validBody })

    const response = await readResponse(req)

    expect(response.status).toBe(200)
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'watchlists',
        data: expect.objectContaining({
          description: 'Friday queue',
          name: 'Friday Night',
          owner: 22,
          slug: 'friday-night',
          visibility: 'private',
        }),
        overrideAccess: true,
      }),
    )
  })

  it('suffixes the slug when the owner already has that name', async () => {
    const { create, req } = createReq({
      body: validBody,
      takenSlugs: ['friday-night'],
    })

    const response = await readResponse(req)

    expect(response.status).toBe(200)
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ slug: 'friday-night-2' }),
      }),
    )
  })

  it('reserves the new route segment', async () => {
    const { create, req } = createReq({
      body: { ...validBody, name: 'New' },
    })

    const response = await readResponse(req)

    expect(response.status).toBe(200)
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ slug: 'new-list' }),
      }),
    )
  })

  it('rejects a cover that is not in the library', async () => {
    const { create, req } = createReq({
      body: { ...validBody, coverMedia: 4 },
      coverInLibrary: false,
    })

    const response = await readResponse(req)

    expect(response.status).toBe(400)
    expect(create).not.toHaveBeenCalled()
  })

  it('rejects an enabled challenge without a goal', async () => {
    const { create, req } = createReq({
      body: {
        ...validBody,
        challenge: {
          dueDate: '2026-12-31',
          enabled: true,
          goalCount: null,
          goalRuntimeMinutes: null,
          goalType: 'runtime_minutes',
          includeRewatches: true,
          priorCompletionRule: 'count_if_completed_after_join',
          startDate: null,
          tvCountRule: 'tv_by_episode',
        },
      },
    })

    const response = await readResponse(req)

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({
      error: 'Challenge goalRuntimeMinutes must be greater than zero',
    })
    expect(create).not.toHaveBeenCalled()
  })

  it('rejects a start date after the due date', async () => {
    const { create, req } = createReq({
      body: {
        ...validBody,
        challenge: {
          dueDate: '2026-10-01',
          enabled: true,
          goalCount: 10,
          goalRuntimeMinutes: null,
          goalType: 'count',
          includeRewatches: false,
          priorCompletionRule: 'exclude_if_already_completed',
          startDate: '2026-12-01',
          tvCountRule: 'tv_as_series',
        },
      },
    })

    const response = await readResponse(req)

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: 'startDate must not be after dueDate' })
    expect(create).not.toHaveBeenCalled()
  })
})
