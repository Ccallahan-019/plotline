import type { PayloadRequest } from 'payload'

import {
  WATCHLIST_DESCRIPTION_MAX_LENGTH,
  WATCHLIST_NAME_MAX_LENGTH,
} from '@plotline/shared/constants'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { Watchlists } from '../../collections/watchlists'
import { requireProfileContext, requireServiceAuth } from '../helpers'
import { updateWatchlistEndpoint } from '../update-watchlist'

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
  name: '  Queue  ',
  visibility: 'friends',
}

const savedDetails = {
  challenge: { enabled: false },
  coverMedia: null,
  description: 'Friday queue',
  name: 'Queue',
  visibility: 'friends',
}

function createReq(options: {
  body?: unknown
  coverInLibrary?: boolean
  isSystem?: boolean
  json?: () => Promise<unknown>
  owned?: boolean
  slug?: string
  storedCoverMedia?: null | number
}) {
  const watchlist = {
    coverMedia: options.storedCoverMedia ?? null,
    id: 7,
    isSystem: options.isSystem === true,
    owner: 22,
    slug: 'watchlist',
  }
  const find = vi.fn(async ({ collection }: { collection: string }) => {
    if (collection === 'library-items') {
      return { docs: options.coverInLibrary === false ? [] : [{ id: 1 }] }
    }

    return { docs: options.owned === false ? [] : [watchlist] }
  })
  const update = vi.fn(async ({ data }: { data: Record<string, unknown> }) => ({
    id: 7,
    slug: 'watchlist',
    ...data,
  }))

  const req = {
    json: options.json ?? (async () => options.body),
    payload: {
      find,
      update,
    },
    routeParams: options.slug === undefined ? { slug: 'watchlist' } : { slug: options.slug },
  } as unknown as PayloadRequest

  return { find, req, update }
}

async function readResponse(req: PayloadRequest): Promise<Response> {
  const response = await updateWatchlistEndpoint.handler(req)

  if (!(response instanceof Response)) {
    throw new Error('Expected update-watchlist handler to return a Response')
  }

  return response
}

describe('updateWatchlistEndpoint', () => {
  it('is a watchlists collection endpoint so Payload can route /api/watchlists/:slug/details', () => {
    expect(Watchlists.endpoints).toContain(updateWatchlistEndpoint)
    expect(updateWatchlistEndpoint.path).toBe('/:slug/details')
    expect(updateWatchlistEndpoint.method).toBe('patch')
  })

  beforeEach(() => {
    vi.mocked(requireServiceAuth).mockResolvedValue(null)
    vi.mocked(requireProfileContext).mockResolvedValue({ profileId: 22 })
  })

  it('trims the name and description and leaves the slug unchanged', async () => {
    const { req, update } = createReq({ body: validBody })

    const response = await readResponse(req)

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({
      ...savedDetails,
      id: 7,
      slug: 'watchlist',
    })
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'watchlists',
        data: savedDetails,
        depth: 1,
        id: 7,
        overrideAccess: true,
      }),
    )
  })

  it('stores a blank description as null', async () => {
    const { req, update } = createReq({
      body: { ...validBody, description: '   ', name: 'Queue', visibility: 'private' },
    })

    const response = await readResponse(req)

    expect(response.status).toBe(200)
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          ...savedDetails,
          description: null,
          name: 'Queue',
          visibility: 'private',
        },
      }),
    )
  })

  it('saves an enabled count challenge and stores the due date as UTC midnight', async () => {
    const { req, update } = createReq({
      body: {
        ...validBody,
        challenge: {
          dueDate: '2026-12-31',
          enabled: true,
          goalCount: 52,
          goalRuntimeMinutes: null,
          goalType: 'count',
          includeRewatches: false,
          priorCompletionRule: 'exclude_if_already_completed',
          startDate: null,
          tvCountRule: 'tv_as_series',
        },
      },
    })

    const response = await readResponse(req)

    expect(response.status).toBe(200)
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          challenge: expect.objectContaining({
            dueDate: '2026-12-31T00:00:00.000Z',
            enabled: true,
            goalCount: 52,
            goalRuntimeMinutes: null,
          }),
        }),
      }),
    )
  })

  it('saves a list size challenge without a goal number', async () => {
    const { req, update } = createReq({
      body: {
        ...validBody,
        challenge: {
          dueDate: '2026-12-31',
          enabled: true,
          goalCount: null,
          goalRuntimeMinutes: null,
          goalType: 'list_size',
          includeRewatches: false,
          priorCompletionRule: 'exclude_if_already_completed',
          startDate: null,
          tvCountRule: 'movies_only',
        },
      },
    })

    const response = await readResponse(req)

    expect(response.status).toBe(200)
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          challenge: {
            dueDate: '2026-12-31T00:00:00.000Z',
            enabled: true,
            goalCount: null,
            goalRuntimeMinutes: null,
            goalType: 'list_size',
            includeRewatches: false,
            priorCompletionRule: 'exclude_if_already_completed',
            startDate: null,
            tvCountRule: 'movies_only',
          },
        }),
      }),
    )
  })

  it('rejects a list size challenge that sets a goal number', async () => {
    const { req, update } = createReq({
      body: {
        ...validBody,
        challenge: {
          dueDate: '2026-12-31',
          enabled: true,
          goalCount: 10,
          goalRuntimeMinutes: null,
          goalType: 'list_size',
          includeRewatches: false,
          priorCompletionRule: 'exclude_if_already_completed',
          startDate: null,
          tvCountRule: 'tv_as_series',
        },
      },
    })

    const response = await readResponse(req)

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: 'Only the active goal can be set' })
    expect(update).not.toHaveBeenCalled()
  })

  it('rejects an enabled challenge without the active goal', async () => {
    const { req, update } = createReq({
      body: {
        ...validBody,
        challenge: {
          dueDate: '2026-12-31',
          enabled: true,
          goalCount: null,
          goalRuntimeMinutes: null,
          goalType: 'count',
          includeRewatches: false,
          priorCompletionRule: 'exclude_if_already_completed',
          startDate: null,
          tvCountRule: 'tv_as_series',
        },
      },
    })

    const response = await readResponse(req)

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({
      error: 'Challenge goalCount must be greater than zero',
    })
    expect(update).not.toHaveBeenCalled()
  })

  it('rejects a runtime challenge that also sends a count goal', async () => {
    const { req, update } = createReq({
      body: {
        ...validBody,
        challenge: {
          dueDate: '2026-12-31',
          enabled: true,
          goalCount: 10,
          goalRuntimeMinutes: 6000,
          goalType: 'runtime_minutes',
          includeRewatches: false,
          priorCompletionRule: 'count_all_on_join',
          startDate: '2026-01-01',
          tvCountRule: 'movies_only',
        },
      },
    })

    const response = await readResponse(req)

    expect(response.status).toBe(400)
    expect(update).not.toHaveBeenCalled()
  })

  it('rejects turning a system list into a challenge', async () => {
    const { req, update } = createReq({
      body: {
        ...validBody,
        challenge: {
          dueDate: '2026-12-31',
          enabled: true,
          goalCount: 10,
          goalRuntimeMinutes: null,
          goalType: 'count',
          includeRewatches: false,
          priorCompletionRule: 'exclude_if_already_completed',
          startDate: null,
          tvCountRule: 'tv_as_series',
        },
      },
      isSystem: true,
    })

    const response = await readResponse(req)

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: 'System lists cannot be challenges' })
    expect(update).not.toHaveBeenCalled()
  })

  it('rejects a cover that is not in the library', async () => {
    const { req, update } = createReq({
      body: { ...validBody, coverMedia: 9 },
      coverInLibrary: false,
    })

    const response = await readResponse(req)

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: 'Cover must be a title in your library' })
    expect(update).not.toHaveBeenCalled()
  })

  it('keeps the current cover without checking the library again', async () => {
    const { find, req, update } = createReq({
      body: { ...validBody, coverMedia: 9 },
      coverInLibrary: false,
      storedCoverMedia: 9,
    })

    const response = await readResponse(req)

    expect(response.status).toBe(200)
    expect(update).toHaveBeenCalled()
    expect(find).not.toHaveBeenCalledWith(expect.objectContaining({ collection: 'library-items' }))
  })

  it('rejects a missing field', async () => {
    const { req, update } = createReq({
      body: { name: 'Queue', visibility: 'private' },
    })

    const response = await readResponse(req)

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({
      error: 'name, description, visibility, coverMedia, and challenge are required',
    })
    expect(update).not.toHaveBeenCalled()
  })

  it('rejects unknown fields', async () => {
    const { req, update } = createReq({
      body: { ...validBody, slug: 'renamed' },
    })

    const response = await readResponse(req)

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({
      error: 'Only name, description, visibility, coverMedia, and challenge can be saved',
    })
    expect(update).not.toHaveBeenCalled()
  })

  it('rejects a blank name', async () => {
    const { req, update } = createReq({
      body: { ...validBody, description: null, name: '   ', visibility: 'private' },
    })

    const response = await readResponse(req)

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: 'Enter a name' })
    expect(update).not.toHaveBeenCalled()
  })

  it('rejects a name that is too long', async () => {
    const { req, update } = createReq({
      body: {
        ...validBody,
        description: null,
        name: 'a'.repeat(WATCHLIST_NAME_MAX_LENGTH + 1),
        visibility: 'private',
      },
    })

    const response = await readResponse(req)

    expect(response.status).toBe(400)
    expect(update).not.toHaveBeenCalled()
  })

  it('rejects a description that is too long', async () => {
    const { req, update } = createReq({
      body: {
        ...validBody,
        description: 'a'.repeat(WATCHLIST_DESCRIPTION_MAX_LENGTH + 1),
        name: 'Queue',
        visibility: 'private',
      },
    })

    const response = await readResponse(req)

    expect(response.status).toBe(400)
    expect(update).not.toHaveBeenCalled()
  })

  it('rejects an unknown visibility', async () => {
    const { req, update } = createReq({
      body: { ...validBody, description: null, name: 'Queue', visibility: 'secret' },
    })

    const response = await readResponse(req)

    expect(response.status).toBe(400)
    expect(update).not.toHaveBeenCalled()
  })

  it('returns not found when the slug is not owned by the profile', async () => {
    const { req, update } = createReq({ body: validBody, owned: false })

    const response = await readResponse(req)

    expect(response.status).toBe(404)
    expect(update).not.toHaveBeenCalled()
  })

  it('returns the auth response when the service key is missing', async () => {
    vi.mocked(requireServiceAuth).mockResolvedValueOnce(
      Response.json({ error: 'Unauthorized' }, { status: 401 }),
    )
    const { req, update } = createReq({ body: validBody })

    const response = await readResponse(req)

    expect(response.status).toBe(401)
    expect(update).not.toHaveBeenCalled()
  })
})
