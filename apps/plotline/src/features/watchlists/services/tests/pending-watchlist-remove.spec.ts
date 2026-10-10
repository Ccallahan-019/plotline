import type { LibraryItem, Media, WatchlistMembership } from '@plotline/payload-types'

import { describe, expect, it } from 'vitest'

import { omitPendingWatchlistRemoves, onListKeysForPendingRemoves } from '../pending-watchlist-remove'

describe('onListKeysForPendingRemoves', () => {
  it('keeps lookup keys for in-flight removes on this watchlist', () => {
    const keys = onListKeysForPendingRemoves(
      [
        { membershipId: 1, onListKey: 'movie:550', slug: 'weekend' },
        { membershipId: 2, onListKey: 'tv:1396', slug: 'other' },
        { membershipId: 3, onListKey: null, slug: 'weekend' },
        { slug: 'weekend' },
      ],
      'weekend',
    )

    expect(keys).toEqual(new Set(['movie:550']))
  })

  it('returns an empty set when nothing is in flight for this list', () => {
    expect(onListKeysForPendingRemoves([], 'weekend')).toEqual(new Set())
  })
})

describe('omitPendingWatchlistRemoves', () => {
  it('drops a row whose delete is still in flight', () => {
    const removed = membership({ id: 1, mediaType: 'movie', tmdbId: 550 })
    const kept = membership({ id: 2, mediaType: 'tv', tmdbId: 1396 })

    expect(omitPendingWatchlistRemoves([removed, kept], new Set(['movie:550']))).toEqual([kept])
  })

  it('returns the same array when no row is pending removal', () => {
    const memberships = [membership({ id: 1, mediaType: 'movie', tmdbId: 550 })]
    const pendingRemoveKeys = new Set(['tv:1396'])

    expect(omitPendingWatchlistRemoves(memberships, new Set())).toBe(memberships)
    expect(omitPendingWatchlistRemoves(memberships, pendingRemoveKeys)).toBe(memberships)
  })

  it('keeps a row that has no lookup key', () => {
    const unpopulated = { id: 1, libraryItem: 10 } as WatchlistMembership

    expect(omitPendingWatchlistRemoves([unpopulated], new Set(['movie:550']))).toEqual([
      unpopulated,
    ])
  })
})

function membership({
  id,
  mediaType,
  tmdbId,
}: {
  id: number
  mediaType: Media['mediaType']
  tmdbId: number
}): WatchlistMembership {
  return {
    id,
    libraryItem: {
      id: id + 100,
      media: {
        id: id + 200,
        mediaType,
        title: `Title ${id}`,
        tmdbId,
      } as Media,
    } as LibraryItem,
  } as WatchlistMembership
}
