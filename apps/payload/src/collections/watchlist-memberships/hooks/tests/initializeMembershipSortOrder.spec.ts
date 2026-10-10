import type { PayloadRequest } from 'payload'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { lockWatchlistMemberships } from '../../../../utilities/lockWatchlistMemberships'
import { setWatchlistMembershipOrder } from '../../../../utilities/setWatchlistMembershipOrder'
import { initializeMembershipSortOrder } from '../initializeMembershipSortOrder'

vi.mock('../../../../utilities/lockWatchlistMemberships', () => ({
  lockWatchlistMemberships: vi.fn(async () => undefined),
}))

vi.mock('../../../../utilities/setWatchlistMembershipOrder', () => ({
  setWatchlistMembershipOrder: vi.fn(async () => undefined),
}))

type FindArgs = {
  sort?: string
  where?: {
    and?: Array<{ sortOrder?: { exists?: boolean } }>
  }
}

function createReq(options?: {
  highestSortOrder?: null | number
  unorderedIds?: readonly number[]
}) {
  const unorderedIds = options?.unorderedIds ?? []
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
  const req = {
    context: {},
    payload: {
      find,
    },
  } as unknown as PayloadRequest

  return { find, req }
}

function runHook(req: PayloadRequest, data: Record<string, unknown>, operation = 'create') {
  return initializeMembershipSortOrder({
    data,
    operation,
    req,
  } as unknown as Parameters<typeof initializeMembershipSortOrder>[0])
}

describe('initializeMembershipSortOrder', () => {
  beforeEach(() => {
    vi.mocked(lockWatchlistMemberships).mockClear()
    vi.mocked(setWatchlistMembershipOrder).mockClear()
  })

  it('appends after the highest existing sortOrder', async () => {
    const { find, req } = createReq({ highestSortOrder: 4 })

    const result = await runHook(req, { libraryItem: 9, watchlist: 3 })

    expect(result).toMatchObject({ sortOrder: 5 })
    expect(find).toHaveBeenCalled()
  })

  it('locks the watchlist before reading the highest sortOrder', async () => {
    const { find, req } = createReq({ highestSortOrder: 4 })

    await runHook(req, { libraryItem: 9, watchlist: 3 })

    expect(lockWatchlistMemberships).toHaveBeenCalledWith(req, 3)
    expect(vi.mocked(lockWatchlistMemberships).mock.invocationCallOrder[0]).toBeLessThan(
      find.mock.invocationCallOrder[0]!,
    )
  })

  it('starts at 0 when the watchlist is empty', async () => {
    const { req } = createReq()

    const result = await runHook(req, { libraryItem: 9, watchlist: 3 })

    expect(result).toMatchObject({ sortOrder: 0 })
    expect(setWatchlistMembershipOrder).toHaveBeenCalledWith(req, 3, [], 0)
  })

  it('numbers null sortOrder rows in list order before appending', async () => {
    const { find, req } = createReq({ unorderedIds: [10, 11] })

    const result = await runHook(req, { libraryItem: 9, watchlist: 3 })

    expect(result).toMatchObject({ sortOrder: 2 })
    expect(setWatchlistMembershipOrder).toHaveBeenCalledWith(req, 3, [10, 11], 0)
    expect(find).toHaveBeenCalledWith(expect.objectContaining({ sort: 'addedAt,id' }))
  })

  it('appends after numbered rows and legacy null rows', async () => {
    const { req } = createReq({ highestSortOrder: 2, unorderedIds: [8, 3] })

    const result = await runHook(req, { libraryItem: 9, watchlist: 3 })

    expect(result).toMatchObject({ sortOrder: 5 })
    expect(setWatchlistMembershipOrder).toHaveBeenCalledWith(req, 3, [8, 3], 3)
  })

  it('keeps an explicit sortOrder, including 0', async () => {
    const { find, req } = createReq({ highestSortOrder: 4 })

    const result = await runHook(req, { libraryItem: 9, sortOrder: 0, watchlist: 3 })

    expect(result).toMatchObject({ sortOrder: 0 })
    expect(find).not.toHaveBeenCalled()
    expect(lockWatchlistMemberships).not.toHaveBeenCalled()
  })

  it('does not assign sortOrder on update', async () => {
    const { find, req } = createReq({ highestSortOrder: 4 })

    const result = await runHook(req, { note: 'later' }, 'update')

    expect(result).toEqual({ note: 'later' })
    expect(find).not.toHaveBeenCalled()
    expect(lockWatchlistMemberships).not.toHaveBeenCalled()
  })
})
