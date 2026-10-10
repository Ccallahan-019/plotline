import type { PayloadRequest } from 'payload'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { Watchlists } from '../../collections/watchlists'
import { lockWatchlistMemberships } from '../../utilities/lockWatchlistMemberships'
import { runInPayloadTransaction } from '../../utilities/runInPayloadTransaction'
import { setWatchlistMembershipOrder } from '../../utilities/setWatchlistMembershipOrder'
import { requireProfileContext, requireServiceAuth } from '../helpers'
import { reorderWatchlistMembershipsEndpoint } from '../reorder-watchlist-memberships'

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

vi.mock('../../utilities/setWatchlistMembershipOrder', () => ({
  setWatchlistMembershipOrder: vi.fn(async () => undefined),
}))

function createReq(options: {
  body?: unknown
  json?: () => Promise<unknown>
  memberships?: Array<{ id: number }>
  owned?: boolean
  slug?: string
}) {
  const find = vi.fn(async ({ collection }: { collection: string }) => {
    if (collection === 'watchlists') {
      return {
        docs: options.owned === false ? [] : [{ id: 7, owner: 22, slug: 'watchlist' }],
      }
    }

    return {
      docs: options.memberships ?? [{ id: 1 }, { id: 2 }, { id: 3 }],
      hasNextPage: false,
      nextPage: null,
    }
  })
  const req = {
    json: options.json ?? (async () => options.body),
    payload: {
      find,
    },
    routeParams: options.slug === undefined ? { slug: 'watchlist' } : { slug: options.slug },
  } as unknown as PayloadRequest

  return { find, req }
}

async function readResponse(req: PayloadRequest): Promise<Response> {
  const response = await reorderWatchlistMembershipsEndpoint.handler(req)

  if (!(response instanceof Response)) {
    throw new Error('Expected reorder handler to return a Response')
  }

  return response
}

describe('reorderWatchlistMembershipsEndpoint', () => {
  it('is a watchlists collection endpoint so Payload can route /api/watchlists/:slug', () => {
    expect(Watchlists.endpoints).toContain(reorderWatchlistMembershipsEndpoint)
    expect(reorderWatchlistMembershipsEndpoint.path).toBe('/:slug/memberships/reorder')
  })

  beforeEach(() => {
    vi.mocked(requireServiceAuth).mockResolvedValue(null)
    vi.mocked(requireProfileContext).mockResolvedValue({ profileId: 22 })
    vi.mocked(runInPayloadTransaction).mockClear()
    vi.mocked(lockWatchlistMemberships).mockClear()
    vi.mocked(setWatchlistMembershipOrder).mockClear()
  })

  it('locks the watchlist, then writes sortOrder from the submitted id order in one call', async () => {
    const { req } = createReq({
      body: { membershipIds: [3, 1, 2] },
    })

    const response = await readResponse(req)

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ membershipIds: [3, 1, 2] })
    expect(runInPayloadTransaction).toHaveBeenCalledOnce()
    expect(lockWatchlistMemberships).toHaveBeenCalledWith(req, 7)
    expect(setWatchlistMembershipOrder).toHaveBeenCalledOnce()
    expect(setWatchlistMembershipOrder).toHaveBeenCalledWith(req, 7, [3, 1, 2])
    expect(vi.mocked(lockWatchlistMemberships).mock.invocationCallOrder[0]).toBeLessThan(
      vi.mocked(setWatchlistMembershipOrder).mock.invocationCallOrder[0]!,
    )
  })

  it('rejects a list that does not include every membership', async () => {
    const { req } = createReq({
      body: { membershipIds: [1, 2] },
    })

    const response = await readResponse(req)

    expect(response.status).toBe(409)
    expect(setWatchlistMembershipOrder).not.toHaveBeenCalled()
  })

  it('rejects duplicate ids', async () => {
    const { req } = createReq({
      body: { membershipIds: [1, 1, 2] },
    })

    const response = await readResponse(req)

    expect(response.status).toBe(400)
    expect(setWatchlistMembershipOrder).not.toHaveBeenCalled()
  })

  it('returns not found when the slug is not owned by the profile', async () => {
    const { req } = createReq({
      body: { membershipIds: [1] },
      owned: false,
    })

    const response = await readResponse(req)

    expect(response.status).toBe(404)
    expect(setWatchlistMembershipOrder).not.toHaveBeenCalled()
  })

  it('returns the auth response when the service key is missing', async () => {
    vi.mocked(requireServiceAuth).mockResolvedValueOnce(
      Response.json({ error: 'Unauthorized' }, { status: 401 }),
    )
    const { req } = createReq({ body: { membershipIds: [1, 2, 3] } })

    const response = await readResponse(req)

    expect(response.status).toBe(401)
  })
})
