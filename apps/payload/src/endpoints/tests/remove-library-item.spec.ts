import type { PayloadRequest } from 'payload'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { recalculateWatchlistStatsById } from '../../utilities/recalculateWatchlistStatsById'
import { requireProfileContext, requireServiceAuth } from '../helpers'
import { removeLibraryItemEndpoint } from '../remove-library-item'

vi.mock('../helpers', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../helpers')>()

  return {
    ...actual,
    requireProfileContext: vi.fn(async () => ({ profileId: 22 })),
    requireServiceAuth: vi.fn(async () => null),
  }
})

vi.mock('../../utilities/recalculateWatchlistStatsById', () => ({
  recalculateWatchlistStatsById: vi.fn(async () => undefined),
}))

type RemoveDb = {
  libraryItems: Array<{ id: number; profile: number }>
  memberships: Array<{ id: number; libraryItem: number; watchlist: number }>
  profile: { id: number; statsCache: { stale: true } | null }
  reviews: Array<{ id: number; media: number; profile: number }>
  watchEvents: Array<{ id: number; libraryItem: number }>
}

type WhereClause = {
  and?: Array<{ id?: { equals: number }; profile?: { equals: number } }>
  libraryItem?: { equals: number }
}

function createDb(): RemoveDb {
  return {
    libraryItems: [
      { id: 11, profile: 22 },
      { id: 12, profile: 22 },
    ],
    memberships: [
      { id: 1, libraryItem: 11, watchlist: 3 },
      { id: 2, libraryItem: 11, watchlist: 3 },
      { id: 3, libraryItem: 11, watchlist: 4 },
      { id: 4, libraryItem: 12, watchlist: 9 },
    ],
    profile: { id: 22, statsCache: { stale: true } },
    reviews: [{ id: 7, media: 5, profile: 22 }],
    watchEvents: [
      { id: 1, libraryItem: 11 },
      { id: 2, libraryItem: 11 },
      { id: 3, libraryItem: 12 },
    ],
  }
}

function createReq(
  id: number | string | undefined,
  options?: { failWatchEventDelete?: boolean; owned?: boolean },
) {
  const db = createDb()
  const owned = options?.owned ?? true
  const failWatchEventDelete = options?.failWatchEventDelete ?? false
  const callOrder: string[] = []

  const beginTransaction = vi.fn(async () => {
    callOrder.push('begin')
    return 'tx-1'
  })
  const commitTransaction = vi.fn(async () => {
    callOrder.push('commit')
  })
  const rollbackTransaction = vi.fn(async () => {
    callOrder.push('rollback')
  })

  const find = vi.fn(async ({ collection, where }: { collection: string; where?: WhereClause }) => {
    if (collection === 'library-items') {
      if (!owned) {
        return { docs: [] }
      }

      const itemId = where?.and?.[0]?.id?.equals
      const profileId = where?.and?.[1]?.profile?.equals

      return {
        docs: db.libraryItems.filter((item) => item.id === itemId && item.profile === profileId),
      }
    }

    if (collection === 'watchlist-memberships') {
      const libraryItemId = where?.libraryItem?.equals

      return {
        docs: db.memberships.filter((membership) => membership.libraryItem === libraryItemId),
      }
    }

    throw new Error(`unexpected find: ${collection}`)
  })

  const remove = vi.fn(async (args: { collection: string; id?: number; where?: WhereClause }) => {
    callOrder.push(`delete:${args.collection}`)

    if (args.collection === 'watchlist-memberships') {
      const libraryItemId = args.where?.libraryItem?.equals
      const removed = db.memberships.filter(
        (membership) => membership.libraryItem === libraryItemId,
      )

      db.memberships = db.memberships.filter(
        (membership) => membership.libraryItem !== libraryItemId,
      )

      return { docs: removed, errors: [] }
    }

    if (args.collection === 'watch-events') {
      if (failWatchEventDelete) {
        return { docs: [], errors: [{ id: 1, message: 'failed' }] }
      }

      const libraryItemId = args.where?.libraryItem?.equals
      const removed = db.watchEvents.filter((event) => event.libraryItem === libraryItemId)

      db.watchEvents = db.watchEvents.filter((event) => event.libraryItem !== libraryItemId)

      return { docs: removed, errors: [] }
    }

    if (args.collection === 'library-items') {
      db.libraryItems = db.libraryItems.filter((item) => item.id !== args.id)

      return { id: args.id }
    }

    throw new Error(`unexpected delete: ${args.collection}`)
  })

  const update = vi.fn(
    async ({
      collection,
      data,
      id: profileId,
    }: {
      collection: string
      data: { statsCache: null }
      id: number
    }) => {
      callOrder.push(`update:${collection}`)

      if (collection !== 'profiles') {
        throw new Error(`unexpected update: ${collection}`)
      }

      db.profile = { id: profileId, statsCache: data.statsCache }

      return db.profile
    },
  )

  const req = {
    payload: {
      db: {
        beginTransaction,
        commitTransaction,
        rollbackTransaction,
      },
      delete: remove,
      find,
      update,
    },
    routeParams: id === undefined ? {} : { id },
  } as unknown as PayloadRequest

  return {
    beginTransaction,
    callOrder,
    commitTransaction,
    db,
    find,
    remove,
    req,
    rollbackTransaction,
    update,
  }
}

async function readResponse(req: PayloadRequest): Promise<Response> {
  const response = await removeLibraryItemEndpoint.handler(req)

  if (!(response instanceof Response)) {
    throw new Error('Expected remove-library-item handler to return a Response')
  }

  return response
}

describe('removeLibraryItemEndpoint', () => {
  beforeEach(() => {
    vi.mocked(requireServiceAuth).mockResolvedValue(null)
    vi.mocked(requireProfileContext).mockResolvedValue({ profileId: 22 })
    vi.mocked(recalculateWatchlistStatsById).mockReset()
    vi.mocked(recalculateWatchlistStatsById).mockResolvedValue(undefined)
  })

  it('rejects a missing library item id', async () => {
    const { find, remove, req, update } = createReq(undefined)

    const response = await readResponse(req)

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: 'Library item id is required' })
    expect(find).not.toHaveBeenCalled()
    expect(remove).not.toHaveBeenCalled()
    expect(update).not.toHaveBeenCalled()
  })

  it('returns 404 for an unowned id without deleting anything', async () => {
    const { beginTransaction, db, remove, req, update } = createReq(99, { owned: false })

    const response = await readResponse(req)

    expect(response.status).toBe(404)
    expect(await response.json()).toEqual({ error: 'Library item not found' })
    expect(beginTransaction).not.toHaveBeenCalled()
    expect(remove).not.toHaveBeenCalled()
    expect(update).not.toHaveBeenCalled()
    expect(recalculateWatchlistStatsById).not.toHaveBeenCalled()
    expect(db.libraryItems).toHaveLength(2)
    expect(db.memberships).toHaveLength(4)
    expect(db.watchEvents).toHaveLength(3)
    expect(db.reviews).toEqual([{ id: 7, media: 5, profile: 22 }])
    expect(db.profile.statsCache).toEqual({ stale: true })
  })

  it('deletes memberships, watch events, and the library item, then clears stats', async () => {
    const { callOrder, commitTransaction, db, find, remove, req, rollbackTransaction, update } =
      createReq(11)

    vi.mocked(recalculateWatchlistStatsById).mockImplementation(async (_payload, watchlistId) => {
      callOrder.push(`recalculate:${String(watchlistId)}`)
    })

    const response = await readResponse(req)

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ id: 11 })
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'library-items',
        overrideAccess: true,
        where: {
          and: [{ id: { equals: 11 } }, { profile: { equals: 22 } }],
        },
      }),
    )
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'watchlist-memberships',
        limit: 0,
        overrideAccess: true,
        pagination: false,
        where: {
          libraryItem: { equals: 11 },
        },
      }),
    )
    expect(remove).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'watchlist-memberships',
        overrideAccess: true,
        req,
        where: {
          libraryItem: { equals: 11 },
        },
      }),
    )
    expect(remove).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'watch-events',
        overrideAccess: true,
        req,
        where: {
          libraryItem: { equals: 11 },
        },
      }),
    )
    expect(remove).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'library-items',
        id: 11,
        overrideAccess: true,
        req,
      }),
    )
    expect(remove).not.toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'reviews',
      }),
    )
    expect(recalculateWatchlistStatsById).toHaveBeenCalledTimes(2)
    expect(recalculateWatchlistStatsById).toHaveBeenCalledWith(req.payload, 3, req)
    expect(recalculateWatchlistStatsById).toHaveBeenCalledWith(req.payload, 4, req)
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'profiles',
        data: { statsCache: null },
        id: 22,
        overrideAccess: true,
        req,
      }),
    )
    expect(callOrder).toEqual([
      'begin',
      'delete:watchlist-memberships',
      'recalculate:3',
      'recalculate:4',
      'delete:watch-events',
      'delete:library-items',
      'update:profiles',
      'commit',
    ])
    expect(rollbackTransaction).not.toHaveBeenCalled()
    expect(commitTransaction).toHaveBeenCalledWith('tx-1')
    expect(db.memberships).toEqual([{ id: 4, libraryItem: 12, watchlist: 9 }])
    expect(db.watchEvents).toEqual([{ id: 3, libraryItem: 12 }])
    expect(db.libraryItems).toEqual([{ id: 12, profile: 22 }])
    expect(db.reviews).toEqual([{ id: 7, media: 5, profile: 22 }])
    expect(db.profile.statsCache).toBeNull()
  })

  it('does not recalculate watchlists when the title is not on any', async () => {
    const { db, req } = createReq(11)

    db.memberships = []

    const response = await readResponse(req)

    expect(response.status).toBe(200)
    expect(recalculateWatchlistStatsById).not.toHaveBeenCalled()
    expect(db.libraryItems).toEqual([{ id: 12, profile: 22 }])
    expect(db.profile.statsCache).toBeNull()
  })

  it('rolls back when a related delete reports errors', async () => {
    const { commitTransaction, remove, req, rollbackTransaction, update } = createReq(11, {
      failWatchEventDelete: true,
    })

    await expect(removeLibraryItemEndpoint.handler(req)).rejects.toThrow(
      'Failed to delete watch-events for the library item',
    )
    expect(remove).not.toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'library-items',
      }),
    )
    expect(update).not.toHaveBeenCalled()
    expect(rollbackTransaction).toHaveBeenCalledOnce()
    expect(commitTransaction).not.toHaveBeenCalled()
  })
})
