import type { PayloadRequest } from 'payload'

import { describe, expect, it, vi } from 'vitest'

import { setWatchlistMembershipOrder } from '../setWatchlistMembershipOrder'

const execute = vi.fn()

vi.mock('@/utilities/getTransactionalDrizzle', () => ({
  getTransactionalDrizzle: vi.fn(async () => ({ execute })),
}))

type SqlChunk = { queryChunks?: SqlChunk[]; value?: unknown }

function createReq() {
  return {
    payload: {
      db: {
        tableNameMap: new Map([['watchlist_memberships', 'watchlist_memberships']]),
        tables: {
          watchlist_memberships: {
            id: { name: 'id' },
            sortOrder: { name: 'sort_order' },
            updatedAt: { name: 'updated_at' },
            watchlist: { name: 'watchlist_id' },
          },
        },
      },
    },
  } as unknown as PayloadRequest
}

// Bound values and raw text, in statement order, from a drizzle `sql` template.
function flattenSql(chunk: SqlChunk): { params: unknown[]; text: string } {
  const params: unknown[] = []
  let text = ''

  const walk = (node: unknown) => {
    if (typeof node === 'string' || typeof node === 'number') {
      params.push(node)
      return
    }

    const chunkNode = node as SqlChunk

    if (chunkNode.queryChunks) {
      chunkNode.queryChunks.forEach(walk)
      return
    }

    if (Array.isArray(chunkNode.value)) {
      text += chunkNode.value.join('')
      return
    }

    if (chunkNode.value !== undefined) {
      params.push(chunkNode.value)
    }
  }

  walk(chunk)

  return { params, text }
}

describe('setWatchlistMembershipOrder', () => {
  it('writes every id in one statement scoped to the watchlist', async () => {
    execute.mockResolvedValueOnce({ rows: [{ id: 3 }, { id: 1 }, { id: 2 }] })

    await setWatchlistMembershipOrder(createReq(), 7, [3, 1, 2], 10)

    expect(execute).toHaveBeenCalledOnce()

    const query = flattenSql(execute.mock.calls[0]![0])

    expect(query.text).toContain('UPDATE')
    expect(query.text).toContain('RETURNING')
    expect(query.params).toEqual(expect.arrayContaining([3, 10, 1, 11, 2, 12, 7]))
  })

  it('throws when a membership is not on the watchlist so the transaction rolls back', async () => {
    execute.mockResolvedValueOnce({ rows: [{ id: 3 }] })

    await expect(setWatchlistMembershipOrder(createReq(), 7, [3, 1], 0)).rejects.toThrow(
      'Not every membership belongs to the watchlist',
    )
  })

  it('does nothing for an empty list', async () => {
    execute.mockClear()

    await setWatchlistMembershipOrder(createReq(), 7, [])

    expect(execute).not.toHaveBeenCalled()
  })
})
