import { describe, expect, it } from 'vitest'

import { appendInFilter } from '../append-in-filter'

describe('appendInFilter', () => {
  it('writes one indexed where param per value', () => {
    const params: Record<string, number | string> = { depth: 0 }

    appendInFilter(params, 'watchlist', [4, 9])

    expect(params).toEqual({
      depth: 0,
      'where[watchlist][in][0]': 4,
      'where[watchlist][in][1]': 9,
    })
  })

  it('leaves params untouched for no values', () => {
    const params: Record<string, number | string> = {}

    appendInFilter(params, 'id', [])

    expect(params).toEqual({})
  })
})
