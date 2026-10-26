import type { PayloadRequest } from 'payload'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { withLibraryItemRowLock } from '../../collections/watch-events/utils/withLibraryItemRowLock'
import { Watchlists } from '../../collections/watchlists'
import { SKIP_WATCHLIST_STATS_RECALC } from '../../collections/watchlists/context'
import { recalculateWatchlistStatsById } from '../../utilities/recalculateWatchlistStatsById'
import { runInPayloadTransaction } from '../../utilities/runInPayloadTransaction'
import { requireProfileContext, requireServiceAuth } from '../helpers'
import { updateWatchlistMembershipEndpoint } from '../update-watchlist-membership'

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

vi.mock('../../collections/watch-events/utils/withLibraryItemRowLock', () => ({
  withLibraryItemRowLock: vi.fn(
    async (_req: unknown, _libraryItemId: unknown, fn: () => Promise<unknown>) => fn(),
  ),
}))

vi.mock('../../utilities/recalculateWatchlistStatsById', () => ({
  recalculateWatchlistStatsById: vi.fn(async () => undefined),
}))

const addedAt = '2026-06-01T00:00:00.000Z'
const completedBefore = '2026-01-15T00:00:00.000Z'
const completedAfter = '2026-07-01T00:00:00.000Z'

function challenge(overrides: Record<string, unknown> = {}) {
  return {
    enabled: true,
    goalCount: 10,
    goalType: 'count',
    includeRewatches: false,
    priorCompletionRule: 'exclude_if_already_completed',
    tvCountRule: 'tv_as_series',
    ...overrides,
  }
}

function createReq(options: {
  body?: unknown
  found?: boolean
  json?: () => Promise<unknown>
  membership?: Record<string, unknown>
  membershipId?: string
  owned?: boolean
}) {
  const updates: Array<{ context?: Record<string, unknown>; data: Record<string, unknown> }> = []
  const update = vi.fn(
    async ({
      context,
      data,
    }: {
      context?: Record<string, unknown>
      data: Record<string, unknown>
    }) => {
      if (context) {
        req.context = { ...req.context, ...context }
      }

      updates.push({ context: context ? { ...context } : undefined, data: { ...data } })

      return { id: 5, ...data }
    },
  )
  const find = vi.fn(async ({ collection }: { collection: string }) => {
    if (collection === 'watchlists') {
      return {
        docs:
          options.owned === false
            ? []
            : [{ challenge: challenge(), id: 7, owner: 22, slug: 'watchlist' }],
      }
    }

    return {
      docs: options.found === false ? [] : [excludedMovieMembership(options.membership)],
    }
  })

  const req = {
    context: {} as Record<string, unknown>,
    json: options.json ?? (async () => options.body),
    payload: {
      find,
      findByID: vi.fn(async () => null),
      update,
    },
    routeParams: {
      membershipId: options.membershipId ?? '5',
      slug: 'watchlist',
    },
  } as unknown as PayloadRequest

  return { req, update, updates }
}

function excludedMovieMembership(overrides: Record<string, unknown> = {}) {
  return {
    addedAt,
    countsTowardGoal: false,
    episodesAtJoin: 0,
    episodesCountedForList: 0,
    excludeFromGoal: false,
    goalWeight: 1,
    id: 5,
    libraryItem: {
      completedAt: completedBefore,
      id: 11,
      media: { id: 9, mediaType: 'movie', runtime: 120 },
      progress: { type: 'movie', watched: true },
      rewatchCount: 0,
      status: 'completed',
    },
    listStatus: 'planned',
    watchlist: 7,
    ...overrides,
  }
}

async function readResponse(req: PayloadRequest): Promise<Response> {
  const response = await updateWatchlistMembershipEndpoint.handler(req)

  if (!(response instanceof Response)) {
    throw new Error('Expected membership update handler to return a Response')
  }

  return response
}

describe('updateWatchlistMembershipEndpoint', () => {
  beforeEach(() => {
    vi.mocked(requireServiceAuth).mockResolvedValue(null)
    vi.mocked(requireProfileContext).mockResolvedValue({ profileId: 22 })
    vi.mocked(runInPayloadTransaction).mockClear()
    vi.mocked(recalculateWatchlistStatsById).mockClear()
  })

  it('is a watchlists collection endpoint so Payload can route /api/watchlists/:slug', () => {
    expect(Watchlists.endpoints).toContain(updateWatchlistMembershipEndpoint)
    expect(updateWatchlistMembershipEndpoint.method).toBe('patch')
    expect(updateWatchlistMembershipEndpoint.path).toBe('/:slug/memberships/:membershipId')
  })

  it('rejects turning counts on when the challenge rules exclude the title', async () => {
    const { req, update } = createReq({ body: { excludeFromGoal: false } })

    const response = await readResponse(req)

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({
      error: 'Already completed — excluded per challenge rules',
    })
    expect(update).not.toHaveBeenCalled()
    expect(recalculateWatchlistStatsById).not.toHaveBeenCalled()
  })

  it('stores a manual exclusion even when the rules already exclude the title', async () => {
    const { req, update, updates } = createReq({ body: { excludeFromGoal: true } })
    vi.mocked(recalculateWatchlistStatsById).mockImplementationOnce(async () => {
      expect(req.context[SKIP_WATCHLIST_STATS_RECALC]).toBeUndefined()

      return undefined
    })

    const response = await readResponse(req)

    expect(response.status).toBe(200)
    expect(updates[0]?.data).toMatchObject({
      countsTowardGoal: false,
      excludeFromGoal: true,
      listStatus: 'planned',
    })
    expect(updates[0]?.context).toEqual({ [SKIP_WATCHLIST_STATS_RECALC]: true })
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'watchlist-memberships',
        id: 5,
      }),
    )
    expect(recalculateWatchlistStatsById).toHaveBeenCalledWith(req.payload, 7, req)
    expect(runInPayloadTransaction).toHaveBeenCalled()
  })

  it('reads and writes under the library item row lock', async () => {
    const { req } = createReq({ body: { excludeFromGoal: true } })

    await readResponse(req)

    expect(withLibraryItemRowLock).toHaveBeenCalledWith(req, 11, expect.any(Function))
  })

  it('turns counts back on and recomputes the row when the rules allow it', async () => {
    const { req, updates } = createReq({
      body: { excludeFromGoal: false },
      membership: {
        countsTowardGoal: false,
        excludeFromGoal: true,
        libraryItem: {
          completedAt: completedAfter,
          id: 11,
          media: { id: 9, mediaType: 'movie', runtime: 120 },
          progress: { type: 'movie', watched: true },
          rewatchCount: 0,
          status: 'completed',
        },
        listStatus: 'planned',
      },
    })

    const response = await readResponse(req)

    expect(response.status).toBe(200)
    expect(updates[0]?.data).toMatchObject({
      completedForListAt: completedAfter,
      countsTowardGoal: true,
      excludeFromGoal: false,
      listStatus: 'completed',
    })
    expect(await response.json()).toMatchObject({
      countsTowardGoal: true,
      excludeFromGoal: false,
      id: 5,
    })
    expect(recalculateWatchlistStatsById).toHaveBeenCalledWith(req.payload, 7, req)
  })

  it('keeps a skipped membership skipped while storing the opt-out', async () => {
    const { req, updates } = createReq({
      body: { excludeFromGoal: true },
      membership: {
        countsTowardGoal: true,
        libraryItem: {
          completedAt: null,
          id: 11,
          media: { id: 9, mediaType: 'movie', runtime: 120 },
          progress: { type: 'movie', watched: false },
          rewatchCount: 0,
          status: 'planned',
        },
        listStatus: 'skipped',
      },
    })

    const response = await readResponse(req)

    expect(response.status).toBe(200)
    expect(updates[0]?.data).toMatchObject({
      countsTowardGoal: false,
      excludeFromGoal: true,
    })
    expect(updates[0]?.data).not.toHaveProperty('listStatus')
    expect(updates[0]?.data).not.toHaveProperty('completedForListAt')
  })

  it('rejects fields other than excludeFromGoal', async () => {
    const { req, update } = createReq({ body: { excludeFromGoal: true, listStatus: 'completed' } })

    const response = await readResponse(req)

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: 'Only excludeFromGoal can be updated' })
    expect(update).not.toHaveBeenCalled()
  })

  it('rejects a non-boolean excludeFromGoal', async () => {
    const { req, update } = createReq({ body: { excludeFromGoal: 'yes' } })

    const response = await readResponse(req)

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: 'excludeFromGoal must be a boolean' })
    expect(update).not.toHaveBeenCalled()
  })

  it('returns not found when the membership is not on that watchlist', async () => {
    const { req, update } = createReq({ body: { excludeFromGoal: true }, found: false })

    const response = await readResponse(req)

    expect(response.status).toBe(404)
    expect(update).not.toHaveBeenCalled()
    expect(recalculateWatchlistStatsById).not.toHaveBeenCalled()
  })

  it('returns not found when the watchlist belongs to someone else', async () => {
    const { req, update } = createReq({ body: { excludeFromGoal: true }, owned: false })

    const response = await readResponse(req)

    expect(response.status).toBe(404)
    expect(update).not.toHaveBeenCalled()
  })

  it('rejects a non-numeric membership id', async () => {
    const { req } = createReq({ body: { excludeFromGoal: true }, membershipId: 'nope' })

    const response = await readResponse(req)

    expect(response.status).toBe(400)
  })
})
