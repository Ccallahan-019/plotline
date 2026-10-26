import type { Watchlist } from '@plotline/payload-types'
import type { PayloadRequest } from 'payload'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { Watchlists } from '../../collections/watchlists'
import { recalculateWatchlistStatsById } from '../../utilities/recalculateWatchlistStatsById'
import { runInPayloadTransaction } from '../../utilities/runInPayloadTransaction'
import { requireProfileContext, requireServiceAuth } from '../helpers'
import { reopenWatchlistChallengeEndpoint } from '../reopen-watchlist-challenge'

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

vi.mock('../../utilities/recalculateWatchlistStatsById', () => ({
  recalculateWatchlistStatsById: vi.fn(async () => undefined),
}))

const completedListSize = {
  challenge: { enabled: true, goalType: 'list_size' },
  id: 7,
  owner: 22,
  slug: 'watchlist',
  statsCache: { completedAt: '2026-10-05T12:00:00.000Z', completedTitleCount: 3 },
}

function createReq(watchlist: null | Record<string, unknown>) {
  const find = vi.fn(async () => ({ docs: watchlist ? [watchlist] : [] }))
  const req = {
    payload: { find },
    routeParams: { slug: 'watchlist' },
  } as unknown as PayloadRequest

  return { find, req }
}

async function readResponse(req: PayloadRequest): Promise<Response> {
  const response = await reopenWatchlistChallengeEndpoint.handler(req)

  if (!(response instanceof Response)) {
    throw new Error('Expected reopen-challenge handler to return a Response')
  }

  return response
}

describe('reopenWatchlistChallengeEndpoint', () => {
  beforeEach(() => {
    vi.mocked(requireServiceAuth).mockResolvedValue(null)
    vi.mocked(requireProfileContext).mockResolvedValue({ profileId: 22 })
    vi.mocked(recalculateWatchlistStatsById).mockReset()
    vi.mocked(recalculateWatchlistStatsById).mockResolvedValue({
      ...completedListSize,
      statsCache: { remaining: 1 },
    } as unknown as Watchlist)
    vi.mocked(runInPayloadTransaction).mockClear()
  })

  it('is a watchlists collection endpoint so Payload can route /api/watchlists/:slug/reopen-challenge', () => {
    expect(Watchlists.endpoints).toContain(reopenWatchlistChallengeEndpoint)
    expect(reopenWatchlistChallengeEndpoint.path).toBe('/:slug/reopen-challenge')
    expect(reopenWatchlistChallengeEndpoint.method).toBe('post')
  })

  it('recalculates without the stored completion and returns the watchlist', async () => {
    const { req } = createReq(completedListSize)

    const response = await readResponse(req)

    expect(response.status).toBe(200)
    expect(runInPayloadTransaction).toHaveBeenCalledOnce()
    expect(recalculateWatchlistStatsById).toHaveBeenCalledWith(req.payload, 7, req, {
      reopenCompletion: true,
    })
    expect(await response.json()).toMatchObject({ id: 7, statsCache: { remaining: 1 } })
  })

  it('returns not found for a missing or unowned list', async () => {
    const { req } = createReq(null)

    const response = await readResponse(req)

    expect(response.status).toBe(404)
    expect(recalculateWatchlistStatsById).not.toHaveBeenCalled()
  })

  it('rejects a challenge that is not a list-size goal', async () => {
    const { req } = createReq({
      ...completedListSize,
      challenge: { enabled: true, goalType: 'count' },
    })

    const response = await readResponse(req)

    expect(response.status).toBe(400)
    expect(recalculateWatchlistStatsById).not.toHaveBeenCalled()
  })

  it('rejects a list-size challenge that has not completed', async () => {
    const { req } = createReq({ ...completedListSize, statsCache: { remaining: 2 } })

    const response = await readResponse(req)

    expect(response.status).toBe(409)
    expect(recalculateWatchlistStatsById).not.toHaveBeenCalled()
  })
})
