import type { PayloadRequest } from 'payload'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { withLibraryItemRowLock } from '../../collections/watch-events/utils/withLibraryItemRowLock'
import { runInPayloadTransaction } from '../../utilities/runInPayloadTransaction'
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

vi.mock('../../collections/watch-events/utils/withLibraryItemRowLock', () => ({
  withLibraryItemRowLock: vi.fn(
    async (_req: unknown, _libraryItemId: unknown, fn: () => Promise<unknown>) => fn(),
  ),
}))

vi.mock('../../utilities/runInPayloadTransaction', () => ({
  runInPayloadTransaction: vi.fn(async (_req: unknown, fn: () => Promise<unknown>) => fn()),
}))

function createReq(id: number | string | undefined, body: unknown, owned = true) {
  const find = vi.fn(async () => ({
    docs: owned ? [{ id: 11 }] : [],
  }))
  const update = vi.fn(async ({ data }: { data: Record<string, unknown> }) => ({
    id: 11,
    ...data,
  }))
  // Stands in for the row after hooks ran: it carries a field the update's own return lacks.
  const findByID = vi.fn(async () => ({
    hookWritten: true,
    id: 11,
    ...(lastUpdateData ?? {}),
  }))
  let lastUpdateData: null | Record<string, unknown> = null
  update.mockImplementation(async ({ data }: { data: Record<string, unknown> }) => {
    lastUpdateData = data

    return { id: 11, ...data }
  })

  const req = {
    json: async () => body,
    payload: {
      find,
      findByID,
      update,
    },
    routeParams: id === undefined ? {} : { id },
  } as unknown as PayloadRequest

  return { find, findByID, req, update }
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
    vi.mocked(withLibraryItemRowLock).mockClear()
    vi.mocked(runInPayloadTransaction).mockClear()
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
        hookWritten: true,
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
    expect(runInPayloadTransaction).toHaveBeenCalledOnce()
    expect(withLibraryItemRowLock).toHaveBeenCalledWith(owned.req, 11, expect.any(Function))
    expect(owned.findByID).toHaveBeenCalledWith(
      expect.objectContaining({ collection: 'library-items', id: 11, overrideAccess: true }),
    )
    expect(await response.json()).toEqual({
      libraryItem: {
        hookWritten: true,
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
    expect(withLibraryItemRowLock).toHaveBeenCalledTimes(1)
    expect(unowned.find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          and: [{ id: { equals: 99 } }, { profile: { equals: 22 } }],
        },
      }),
    )
  })
})
