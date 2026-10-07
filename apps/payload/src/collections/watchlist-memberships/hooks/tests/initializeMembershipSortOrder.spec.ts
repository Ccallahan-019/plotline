import type { PayloadRequest } from 'payload'

import { describe, expect, it, vi } from 'vitest'

import { SKIP_WATCHLIST_STATS_RECALC } from '../../../watchlists/context'
import { initializeMembershipSortOrder } from '../initializeMembershipSortOrder'

type FindArgs = {
  sort?: string
  where?: {
    and?: Array<{ sortOrder?: { exists?: boolean } }>
  }
}

type UpdateCall = {
  context?: Record<string, unknown>
  data: { sortOrder?: number }
  id: number
}

function createReq(options?: {
  highestSortOrder?: null | number
  unorderedIds?: readonly number[]
}) {
  const context: Record<string, unknown> = {}
  const unorderedIds = options?.unorderedIds ?? []
  const updates: UpdateCall[] = []
  const find = vi.fn(async (args: FindArgs) => {
    const unordered = args.where?.and?.some((clause) => clause.sortOrder?.exists === false) ?? false

    if (unordered) {
      return {
        docs: unorderedIds.map((id) => ({ id, sortOrder: null })),
        hasNextPage: false,
      }
    }

    return {
      docs:
        options?.highestSortOrder == null ? [] : [{ id: 1, sortOrder: options.highestSortOrder }],
      hasNextPage: false,
    }
  })
  const update = vi.fn(async (args: UpdateCall) => {
    updates.push(args)
    Object.assign(context, args.context)

    return { id: args.id, sortOrder: args.data.sortOrder }
  })
  const req = {
    context,
    payload: {
      find,
      update,
    },
  } as unknown as PayloadRequest

  return { context, find, req, updates }
}

describe('initializeMembershipSortOrder', () => {
  it('appends after the highest existing sortOrder', async () => {
    const { find, req, updates } = createReq({ highestSortOrder: 4 })

    const result = await initializeMembershipSortOrder({
      data: { libraryItem: 9, watchlist: 3 },
      operation: 'create',
      req,
    } as unknown as Parameters<typeof initializeMembershipSortOrder>[0])

    expect(result).toMatchObject({ sortOrder: 5 })
    expect(find).toHaveBeenCalled()
    expect(updates).toEqual([])
  })

  it('starts at 0 when the watchlist is empty', async () => {
    const { req, updates } = createReq()

    const result = await initializeMembershipSortOrder({
      data: { libraryItem: 9, watchlist: 3 },
      operation: 'create',
      req,
    } as unknown as Parameters<typeof initializeMembershipSortOrder>[0])

    expect(result).toMatchObject({ sortOrder: 0 })
    expect(updates).toEqual([])
  })

  it('numbers null sortOrder rows in list order before appending', async () => {
    const { find, req, updates } = createReq({ unorderedIds: [10, 11] })

    const result = await initializeMembershipSortOrder({
      data: { libraryItem: 9, watchlist: 3 },
      operation: 'create',
      req,
    } as unknown as Parameters<typeof initializeMembershipSortOrder>[0])

    expect(result).toMatchObject({ sortOrder: 2 })
    expect(updates.map((call) => [call.id, call.data.sortOrder])).toEqual([
      [10, 0],
      [11, 1],
    ])
    expect(updates.every((call) => call.context?.[SKIP_WATCHLIST_STATS_RECALC] === true)).toBe(true)
    expect(req.context[SKIP_WATCHLIST_STATS_RECALC]).toBeUndefined()
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        sort: 'addedAt,id',
      }),
    )
  })

  it('appends after numbered rows and legacy null rows', async () => {
    const { req, updates } = createReq({ highestSortOrder: 2, unorderedIds: [8, 3] })

    const result = await initializeMembershipSortOrder({
      data: { libraryItem: 9, watchlist: 3 },
      operation: 'create',
      req,
    } as unknown as Parameters<typeof initializeMembershipSortOrder>[0])

    expect(result).toMatchObject({ sortOrder: 5 })
    expect(updates.map((call) => [call.id, call.data.sortOrder])).toEqual([
      [8, 3],
      [3, 4],
    ])
  })

  it('keeps a pre-set stats skip flag after numbering null rows', async () => {
    const { context, req } = createReq({ unorderedIds: [10] })
    context[SKIP_WATCHLIST_STATS_RECALC] = true

    await initializeMembershipSortOrder({
      data: { libraryItem: 9, watchlist: 3 },
      operation: 'create',
      req,
    } as unknown as Parameters<typeof initializeMembershipSortOrder>[0])

    expect(context[SKIP_WATCHLIST_STATS_RECALC]).toBe(true)
  })

  it('keeps an explicit sortOrder, including 0', async () => {
    const { find, req } = createReq({ highestSortOrder: 4 })

    const result = await initializeMembershipSortOrder({
      data: { libraryItem: 9, sortOrder: 0, watchlist: 3 },
      operation: 'create',
      req,
    } as unknown as Parameters<typeof initializeMembershipSortOrder>[0])

    expect(result).toMatchObject({ sortOrder: 0 })
    expect(find).not.toHaveBeenCalled()
  })

  it('does not assign sortOrder on update', async () => {
    const { find, req } = createReq({ highestSortOrder: 4 })

    const result = await initializeMembershipSortOrder({
      data: { note: 'later' },
      operation: 'update',
      req,
    } as unknown as Parameters<typeof initializeMembershipSortOrder>[0])

    expect(result).toEqual({ note: 'later' })
    expect(find).not.toHaveBeenCalled()
  })
})
