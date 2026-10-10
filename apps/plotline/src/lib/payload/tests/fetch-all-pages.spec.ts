import { describe, expect, it, vi } from 'vitest'

import type { PayloadPaginatedDocs } from '../payload-fetch'

import { fetchAllPages, MAX_PAYLOAD_PAGES } from '../fetch-all-pages'

function pageOf(
  docs: number[],
  overrides: Partial<PayloadPaginatedDocs<number>> = {},
): PayloadPaginatedDocs<number> {
  return {
    docs,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 2,
    nextPage: null,
    page: 1,
    pagingCounter: 1,
    prevPage: null,
    totalDocs: docs.length,
    totalPages: 1,
    ...overrides,
  }
}

describe('fetchAllPages', () => {
  it('returns a single page without asking for more', async () => {
    const fetchPage = vi.fn().mockResolvedValue(pageOf([1, 2]))

    await expect(fetchAllPages(fetchPage, 'test')).resolves.toEqual([1, 2])
    expect(fetchPage).toHaveBeenCalledTimes(1)
    expect(fetchPage).toHaveBeenCalledWith(1)
  })

  it('follows nextPage and concatenates docs in page order', async () => {
    const fetchPage = vi
      .fn()
      .mockResolvedValueOnce(pageOf([1, 2], { hasNextPage: true, nextPage: 2 }))
      .mockResolvedValueOnce(pageOf([3, 4], { hasNextPage: true, nextPage: 3, page: 2 }))
      .mockResolvedValueOnce(pageOf([5], { page: 3 }))

    await expect(fetchAllPages(fetchPage, 'test')).resolves.toEqual([1, 2, 3, 4, 5])
    expect(fetchPage.mock.calls.map(([page]) => page)).toEqual([1, 2, 3])
  })

  it('advances by one when nextPage is missing', async () => {
    const fetchPage = vi
      .fn()
      .mockResolvedValueOnce(pageOf([1], { hasNextPage: true, nextPage: null }))
      .mockResolvedValueOnce(pageOf([2], { page: 2 }))

    await expect(fetchAllPages(fetchPage, 'test')).resolves.toEqual([1, 2])
  })

  it('throws when the next page does not advance', async () => {
    const fetchPage = vi.fn().mockResolvedValue(pageOf([1], { hasNextPage: true, nextPage: 1 }))

    await expect(fetchAllPages(fetchPage, '/api/things')).rejects.toThrow(
      'Payload page did not advance for /api/things',
    )
  })

  it('throws once the page cap is reached', async () => {
    const fetchPage = vi
      .fn()
      .mockImplementation((page: number) =>
        Promise.resolve(pageOf([page], { hasNextPage: true, nextPage: page + 1, page })),
      )

    await expect(fetchAllPages(fetchPage, '/api/things')).rejects.toThrow(
      'Payload page limit exceeded for /api/things',
    )
    expect(fetchPage).toHaveBeenCalledTimes(MAX_PAYLOAD_PAGES)
  })

  it('propagates a failed page request', async () => {
    const fetchPage = vi.fn().mockRejectedValue(new Error('boom'))

    await expect(fetchAllPages(fetchPage, 'test')).rejects.toThrow('boom')
  })
})
