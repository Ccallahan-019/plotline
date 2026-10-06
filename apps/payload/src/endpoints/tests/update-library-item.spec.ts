import type { PayloadRequest } from 'payload'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { requireProfileContext, requireServiceAuth } from '../helpers'
import { updateLibraryItemEndpoint } from '../update-library-item'

vi.mock('../helpers', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../helpers')>()

  return {
    ...actual,
    requireProfileContext: vi.fn(async () => ({ profileId: 22 })),
    requireServiceAuth: vi.fn(async () => null),
  }
})

function createReq(id: number | string | undefined, body: unknown, owned = true) {
  const find = vi.fn(async () => ({
    docs: owned ? [{ id: 11 }] : [],
  }))
  const update = vi.fn(async ({ data }: { data: Record<string, unknown> }) => ({
    id: 11,
    ...data,
  }))

  const req = {
    json: async () => body,
    payload: {
      find,
      update,
    },
    routeParams: id === undefined ? {} : { id },
  } as unknown as PayloadRequest

  return { find, req, update }
}

async function readResponse(req: PayloadRequest): Promise<Response> {
  const response = await updateLibraryItemEndpoint.handler(req)

  if (!(response instanceof Response)) {
    throw new Error('Expected update-library-item handler to return a Response')
  }

  return response
}

describe('updateLibraryItemEndpoint', () => {
  beforeEach(() => {
    vi.mocked(requireServiceAuth).mockResolvedValue(null)
    vi.mocked(requireProfileContext).mockResolvedValue({ profileId: 22 })
  })

  it('rejects an empty body', async () => {
    const { find, req, update } = createReq(11, {})

    const response = await readResponse(req)

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({
      error: 'At least one of status or personalNotes is required',
    })
    expect(find).not.toHaveBeenCalled()
    expect(update).not.toHaveBeenCalled()
  })

  it('rejects unknown fields', async () => {
    const { find, req, update } = createReq(11, {
      progress: { watched: true },
      status: 'watching',
    })

    const response = await readResponse(req)

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({
      error: 'Only status and personalNotes can be updated',
    })
    expect(find).not.toHaveBeenCalled()
    expect(update).not.toHaveBeenCalled()
  })

  it('rejects an invalid status', async () => {
    const { req, update } = createReq(11, { status: 'finished' })

    const response = await readResponse(req)

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({
      error: 'status must be planned, watching, completed, dropped, or on_hold',
    })
    expect(update).not.toHaveBeenCalled()
  })

  it('trims blank notes to null', async () => {
    const { req, update } = createReq(11, { personalNotes: '  \n  ' })

    const response = await readResponse(req)

    expect(response.status).toBe(200)
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'library-items',
        data: { personalNotes: null },
        id: 11,
        overrideAccess: true,
        req,
      }),
    )
    expect(await response.json()).toEqual({
      libraryItem: {
        id: 11,
        personalNotes: null,
      },
    })
  })

  it('updates only the owned item', async () => {
    const owned = createReq('11', { personalNotes: '  a note  ', status: 'completed' })

    const response = await readResponse(owned.req)

    expect(response.status).toBe(200)
    expect(owned.find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'library-items',
        overrideAccess: true,
        where: {
          and: [{ id: { equals: 11 } }, { profile: { equals: 22 } }],
        },
      }),
    )
    expect(owned.update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'library-items',
        data: {
          personalNotes: 'a note',
          status: 'completed',
        },
        id: 11,
        overrideAccess: true,
        req: owned.req,
      }),
    )
    expect(owned.update.mock.calls[0]?.[0]).not.toHaveProperty('context')
    expect(await response.json()).toEqual({
      libraryItem: {
        id: 11,
        personalNotes: 'a note',
        status: 'completed',
      },
    })

    const unowned = createReq(99, { status: 'dropped' }, false)
    const missing = await readResponse(unowned.req)

    expect(missing.status).toBe(404)
    expect(await missing.json()).toEqual({ error: 'Library item not found' })
    expect(unowned.update).not.toHaveBeenCalled()
    expect(unowned.find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          and: [{ id: { equals: 99 } }, { profile: { equals: 22 } }],
        },
      }),
    )
  })
})
