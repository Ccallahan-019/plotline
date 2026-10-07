import type { PayloadRequest } from 'payload'

import { WATCHLIST_DESCRIPTION_MAX_LENGTH, WATCHLIST_NAME_MAX_LENGTH } from '@plotline/shared/constants'
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
  description: '  Friday queue  ',
  name: '  Queue  ',
  visibility: 'friends',
}

function createReq(options: {
  body?: unknown
  json?: () => Promise<unknown>
  owned?: boolean
  slug?: string
}) {
  const find = vi.fn(async () => ({
    docs: options.owned === false ? [] : [{ id: 7, owner: 22, slug: 'watchlist' }],
  }))
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
      description: 'Friday queue',
      id: 7,
      name: 'Queue',
      slug: 'watchlist',
      visibility: 'friends',
    })
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'watchlists',
        data: {
          description: 'Friday queue',
          name: 'Queue',
          visibility: 'friends',
        },
        depth: 1,
        id: 7,
        overrideAccess: true,
      }),
    )
  })

  it('stores a blank description as null', async () => {
    const { req, update } = createReq({
      body: { description: '   ', name: 'Queue', visibility: 'private' },
    })

    const response = await readResponse(req)

    expect(response.status).toBe(200)
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          description: null,
          name: 'Queue',
          visibility: 'private',
        },
      }),
    )
  })

  it('rejects a missing field', async () => {
    const { req, update } = createReq({
      body: { name: 'Queue', visibility: 'private' },
    })

    const response = await readResponse(req)

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({
      error: 'name, description, and visibility are required',
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
      error: 'Only name, description, and visibility can be updated',
    })
    expect(update).not.toHaveBeenCalled()
  })

  it('rejects a blank name', async () => {
    const { req, update } = createReq({
      body: { description: null, name: '   ', visibility: 'private' },
    })

    const response = await readResponse(req)

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: 'Enter a name' })
    expect(update).not.toHaveBeenCalled()
  })

  it('rejects a name that is too long', async () => {
    const { req, update } = createReq({
      body: {
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
      body: { description: null, name: 'Queue', visibility: 'secret' },
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
