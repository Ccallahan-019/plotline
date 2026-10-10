import type { PayloadRequest } from 'payload'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { Watchlists } from '../../collections/watchlists'
import { recalculateWatchlistStatsById } from '../../utilities/recalculateWatchlistStatsById'
import { runInPayloadTransaction } from '../../utilities/runInPayloadTransaction'
import { requireProfileContext, requireServiceAuth } from '../helpers'
import { removeWatchlistMembershipEndpoint } from '../remove-watchlist-membership'

vi.mock('../helpers', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../helpers')>()

  return {
    ...actual,
    requireProfileContext: vi.fn(async () => ({ profileId: 22 })),
    requireServiceAuth: vi.fn(async () => null),
  }
})

vi.mock('../../utilities/runInPayloadTransaction', () => ({
  runInPayloadTransaction: vi.fn(async (_req: unknown, fn: () => Promise<unknown>) => fn()),
}))

vi.mock('../../utilities/lockWatchlistMemberships', () => ({
  lockWatchlistMemberships: vi.fn(async () => undefined),
}))

vi.mock('../../utilities/recalculateWatchlistStatsById', () => ({
  recalculateWatchlistStatsById: vi.fn(async () => undefined),
}))

function createReq(options: { found?: boolean; membershipId?: string; owned?: boolean }) {
  const deleteById = vi.fn(async () => ({ id: 5 }))
  const find = vi.fn(async ({ collection }: { collection: string }) => {
    if (collection === 'watchlists') {
      return {
        docs: options.owned === false ? [] : [{ id: 7, owner: 22, slug: 'watchlist' }],
      }
    }

    return {
      docs: options.found === false ? [] : [{ id: 5, watchlist: 7 }],
    }
  })

  const req = {
    payload: {
      delete: deleteById,
      find,
    },
    routeParams: {
      membershipId: options.membershipId ?? '5',
      slug: 'watchlist',
    },
  } as unknown as PayloadRequest

  return { deleteById, req }
}

async function readResponse(req: PayloadRequest): Promise<Response> {
  const response = await removeWatchlistMembershipEndpoint.handler(req)

  if (!(response instanceof Response)) {
    throw new Error('Expected remove handler to return a Response')
  }

  return response
}

describe('removeWatchlistMembershipEndpoint', () => {
  beforeEach(() => {
    vi.mocked(requireServiceAuth).mockResolvedValue(null)
    vi.mocked(requireProfileContext).mockResolvedValue({ profileId: 22 })
    vi.mocked(runInPayloadTransaction).mockClear()
    vi.mocked(recalculateWatchlistStatsById).mockClear()
  })

  it('is a watchlists collection endpoint so Payload can route /api/watchlists/:slug', () => {
    expect(Watchlists.endpoints).toContain(removeWatchlistMembershipEndpoint)
    expect(removeWatchlistMembershipEndpoint.path).toBe('/:slug/memberships/:membershipId')
  })

  it('deletes the membership and recalculates watchlist stats', async () => {
    const { deleteById, req } = createReq({})

    const response = await readResponse(req)

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ id: 5 })
    expect(deleteById).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'watchlist-memberships',
        id: 5,
      }),
    )
    expect(recalculateWatchlistStatsById).toHaveBeenCalledWith(req.payload, 7, req)
  })

  it('returns not found when the membership is not on that watchlist', async () => {
    const { deleteById, req } = createReq({ found: false })

    const response = await readResponse(req)

    expect(response.status).toBe(404)
    expect(deleteById).not.toHaveBeenCalled()
    expect(recalculateWatchlistStatsById).not.toHaveBeenCalled()
  })

  it('returns not found when the watchlist belongs to someone else', async () => {
    const { deleteById, req } = createReq({ owned: false })

    const response = await readResponse(req)

    expect(response.status).toBe(404)
    expect(deleteById).not.toHaveBeenCalled()
  })

  it('rejects a non-numeric membership id', async () => {
    const { req } = createReq({ membershipId: 'nope' })

    const response = await readResponse(req)

    expect(response.status).toBe(400)
  })
})
