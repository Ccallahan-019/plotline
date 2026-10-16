import { describe, expect, it } from 'vitest'

import { isDefaultActivityFeedFilter } from './query-keys'

describe('isDefaultActivityFeedFilter', () => {
  it('is true for all activity, all media, and the last 30 days', () => {
    expect(isDefaultActivityFeedFilter({ kind: 'all', mediaType: 'all', range: '30d' })).toBe(true)
  })

  it('is false when any filter is narrowed', () => {
    expect(isDefaultActivityFeedFilter({ kind: 'watched', mediaType: 'all', range: '30d' })).toBe(
      false,
    )
    expect(isDefaultActivityFeedFilter({ kind: 'all', mediaType: 'movie', range: '30d' })).toBe(
      false,
    )
    expect(isDefaultActivityFeedFilter({ kind: 'all', mediaType: 'all', range: 'all' })).toBe(false)
  })
})
