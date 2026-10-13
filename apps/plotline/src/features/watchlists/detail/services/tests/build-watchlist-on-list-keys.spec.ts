import type { LibraryItem, Media, WatchlistMembership } from '@plotline/payload-types'

import { describe, expect, it } from 'vitest'

import { buildWatchlistOnListKeys } from '../build-watchlist-on-list-keys'

describe('buildWatchlistOnListKeys', () => {
  it('collects lookup keys from populated membership media', () => {
    const keys = buildWatchlistOnListKeys([
      membership({ id: 1, mediaType: 'movie', tmdbId: 550 }),
      membership({ id: 2, mediaType: 'tv', tmdbId: 1396 }),
    ])

    expect(keys).toEqual(new Set(['movie:550', 'tv:1396']))
  })

  it('skips memberships whose media was not populated', () => {
    const keys = buildWatchlistOnListKeys([
      { id: 1, libraryItem: 10 } as WatchlistMembership,
      { id: 2, libraryItem: { id: 20, media: 30 } as LibraryItem } as WatchlistMembership,
      membership({ id: 3, mediaType: 'movie', tmdbId: 680 }),
    ])

    expect([...keys]).toEqual(['movie:680'])
  })

  it('returns an empty set when the list has no titles', () => {
    expect(buildWatchlistOnListKeys([])).toEqual(new Set())
  })

  it('includes in-flight remove keys without mutating that set', () => {
    const pendingRemoveKeys = new Set(['movie:550'])

    const keys = buildWatchlistOnListKeys(
      [membership({ id: 2, mediaType: 'tv', tmdbId: 1396 })],
      pendingRemoveKeys,
    )

    expect(keys).toEqual(new Set(['movie:550', 'tv:1396']))
    expect(pendingRemoveKeys).toEqual(new Set(['movie:550']))
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
