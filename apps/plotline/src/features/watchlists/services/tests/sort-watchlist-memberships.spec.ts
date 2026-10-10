import type { LibraryItem, Media, WatchlistMembership } from '@plotline/payload-types'

import { describe, expect, it } from 'vitest'

import { sortWatchlistMemberships } from '../sort-watchlist-memberships'

describe('sortWatchlistMemberships', () => {
  it('orders manual rows by sortOrder, then addedAt, then id, without mutating the input', () => {
    const rows = [
      membership({ addedAt: '2026-02-01T00:00:00.000Z', id: 4, sortOrder: null }),
      membership({ addedAt: '2026-01-02T00:00:00.000Z', id: 2, sortOrder: 0 }),
      membership({ addedAt: '2026-03-01T00:00:00.000Z', id: 5, sortOrder: null }),
      membership({ addedAt: '2026-01-01T00:00:00.000Z', id: 3, sortOrder: 0 }),
      membership({ addedAt: '2026-04-01T00:00:00.000Z', id: 1, sortOrder: 1 }),
    ]
    const originalIds = rows.map((row) => row.id)

    expect(sortWatchlistMemberships(rows).map((row) => row.id)).toEqual([3, 2, 1, 4, 5])
    expect(sortWatchlistMemberships(rows, 'manual').map((row) => row.id)).toEqual([3, 2, 1, 4, 5])
    expect(rows.map((row) => row.id)).toEqual(originalIds)
  })

  it('sorts titles case-insensitively and keeps missing titles last', () => {
    const rows = [
      membership({ id: 1, media: { title: 'Zebra' } }),
      membership({ id: 4, media: { title: '   ' } }),
      membership({ id: 2, media: { title: 'alpha' } }),
      membership({ id: 3, media: { title: 'Alpha' } }),
      membership({ id: 5, media: null }),
    ]

    expect(sortWatchlistMemberships(rows, 'title-asc').map((row) => row.id)).toEqual([
      2, 3, 1, 4, 5,
    ])
    expect(sortWatchlistMemberships(rows, 'title-desc').map((row) => row.id)).toEqual([
      1, 2, 3, 4, 5,
    ])
  })

  it('sorts recently added newest first, then title, then id', () => {
    const rows = [
      membership({ addedAt: '2026-01-01T00:00:00.000Z', id: 1, media: { title: 'Old' } }),
      membership({ addedAt: '2026-06-01T00:00:00.000Z', id: 3, media: { title: 'Same' } }),
      membership({ addedAt: '2026-06-01T00:00:00.000Z', id: 2, media: { title: 'Same' } }),
    ]

    expect(sortWatchlistMemberships(rows, 'recently-added').map((row) => row.id)).toEqual([2, 3, 1])
  })

  it('sorts release dates newest first and keeps a missing date last', () => {
    const rows = [
      membership({ id: 1, media: { releaseDate: '2010-01-01', title: 'Old' } }),
      membership({ id: 2, media: { releaseDate: '2024-05-01', title: 'New' } }),
      membership({ id: 3, media: { releaseDate: null, title: 'Undated' } }),
      membership({ id: 4, media: { releaseDate: '2024-05-01', title: 'Also new' } }),
    ]

    expect(sortWatchlistMemberships(rows, 'release-date').map((row) => row.id)).toEqual([
      4, 2, 1, 3,
    ])
  })
})

function membership({
  addedAt = '2026-03-04T15:00:00.000Z',
  id,
  media = { releaseDate: '2020-01-01', title: `Title ${id}` },
  sortOrder = id,
}: {
  addedAt?: string
  id: number
  media?: { releaseDate?: null | string; title: string } | null
  sortOrder?: null | number
}): WatchlistMembership {
  return {
    addedAt,
    id,
    libraryItem:
      media == null
        ? id
        : ({
            id: id + 100,
            media: {
              id: id + 200,
              mediaType: 'movie',
              releaseDate: media.releaseDate,
              title: media.title,
              tmdbId: id,
            } as Media,
            status: 'planned',
          } as LibraryItem),
    sortOrder,
    watchlist: 1,
  } as WatchlistMembership
}
