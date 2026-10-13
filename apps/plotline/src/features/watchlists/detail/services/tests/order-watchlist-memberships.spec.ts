import type { LibraryItem, Media, WatchlistMembership } from '@plotline/payload-types'

import { describe, expect, it } from 'vitest'

import { formatAddedToListLabel, formatMembershipMediaLabel } from '../format-membership-metadata'
import {
  arrangeMembershipsByIds,
  orderWatchlistMemberships,
  patchMembershipLibraryStatus,
  restoreMembershipAfterFailedRemove,
  restoreMembershipOrderAfterReorder,
  sameMembershipIdOrder,
  submittedMembershipIdsStillPresent,
  withMembershipSortOrder,
} from '../order-watchlist-memberships'

function libraryStatus(
  membership: undefined | WatchlistMembership,
): LibraryItem['status'] | undefined {
  const libraryItem = membership?.libraryItem

  return typeof libraryItem === 'object' ? libraryItem.status : undefined
}

function membership(
  id: number,
  sortOrder: null | number,
  status: LibraryItem['status'] = 'planned',
): WatchlistMembership {
  return {
    addedAt: '2026-03-04T15:00:00.000Z',
    id,
    libraryItem: {
      id: id + 100,
      media: {
        id: id + 200,
        mediaType: 'movie',
        releaseDate: '2020-01-01',
        title: `Title ${id}`,
        tmdbId: id,
      } as Media,
      status,
    } as LibraryItem,
    sortOrder,
    watchlist: 1,
  } as WatchlistMembership
}

describe('orderWatchlistMemberships', () => {
  it('rewrites sortOrder to the submitted index', () => {
    const ordered = orderWatchlistMemberships(
      [membership(1, 0), membership(2, 1), membership(3, 2)],
      [3, 1, 2],
    )

    expect(ordered?.map((row) => [row.id, row.sortOrder])).toEqual([
      [3, 0],
      [1, 1],
      [2, 2],
    ])
  })

  it('returns null when an id is missing', () => {
    expect(orderWatchlistMemberships([membership(1, 0), membership(2, 1)], [1])).toBeNull()
  })
})

describe('restoreMembershipOrderAfterReorder', () => {
  it('drops a membership removed while the reorder was in flight', () => {
    const previous = [membership(1, 0), membership(2, 1), membership(3, 2)]
    const current = [membership(3, 0, 'watching'), membership(1, 1)]

    const restored = restoreMembershipOrderAfterReorder(current, previous)

    expect(restored.map((row) => row.id)).toEqual([1, 3])
    expect(restored.map((row) => row.sortOrder)).toEqual([0, 1])
    expect(libraryStatus(restored[1])).toBe('watching')
  })

  it('appends a row that was added after the snapshot', () => {
    const previous = [membership(1, 0), membership(2, 1)]
    const current = [membership(2, 0), membership(1, 1), membership(4, 2)]

    expect(restoreMembershipOrderAfterReorder(current, previous).map((row) => row.id)).toEqual([
      1, 2, 4,
    ])
  })
})

describe('restoreMembershipAfterFailedRemove', () => {
  it('puts the row back ahead of the next snapshot neighbor', () => {
    const previous = [membership(1, 0), membership(2, 1), membership(3, 2)]
    const current = [membership(3, 0), membership(1, 1)]

    expect(restoreMembershipAfterFailedRemove(current, previous, 2).map((row) => row.id)).toEqual([
      2, 3, 1,
    ])
  })

  it('inserts after the previous neighbor when later neighbors are gone', () => {
    const previous = [membership(1, 0), membership(2, 1), membership(3, 2)]
    const current = [membership(1, 0)]

    expect(restoreMembershipAfterFailedRemove(current, previous, 3).map((row) => row.id)).toEqual([
      1, 3,
    ])
  })

  it('keeps the current list when the row is already present', () => {
    const current = [membership(2, 0), membership(1, 1)]

    expect(
      restoreMembershipAfterFailedRemove(current, [membership(1, 0), membership(2, 1)], 2).map(
        (row) => row.id,
      ),
    ).toEqual([2, 1])
  })
})

describe('arrangeMembershipsByIds', () => {
  it('keeps the dragged order while taking row updates from a refetch with the old order', () => {
    const refetched = [membership(1, 0, 'completed'), membership(2, 1), membership(3, 2)]

    const arranged = arrangeMembershipsByIds(refetched, [3, 1, 2])

    expect(arranged.map((row) => [row.id, row.sortOrder])).toEqual([
      [3, 0],
      [1, 1],
      [2, 2],
    ])
    expect(libraryStatus(arranged[1])).toBe('completed')
  })

  it('skips ids the cache no longer has, so a removed title stays gone', () => {
    const arranged = arrangeMembershipsByIds([membership(1, 0), membership(3, 1)], [3, 2, 1])

    expect(arranged.map((row) => row.id)).toEqual([3, 1])
  })

  it('puts rows missing from the order after the ordered ones', () => {
    const arranged = arrangeMembershipsByIds(
      [membership(1, 0), membership(2, 1), membership(4, 2)],
      [2, 1],
    )

    expect(arranged.map((row) => row.id)).toEqual([2, 1, 4])
  })

  it('keeps row identity when sortOrder already matches', () => {
    const rows = [membership(1, 0), membership(2, 1)]
    const arranged = arrangeMembershipsByIds(rows, [1, 2])

    expect(arranged[0]).toBe(rows[0])
    expect(arranged[1]).toBe(rows[1])
  })
})

describe('submittedMembershipIdsStillPresent', () => {
  it('is false when a submitted title was removed', () => {
    expect(
      submittedMembershipIdsStillPresent([membership(1, 0), membership(3, 1)], [3, 1, 2]),
    ).toBe(false)
  })

  it('is true when every submitted id is still present', () => {
    expect(submittedMembershipIdsStillPresent([membership(1, 0), membership(2, 1)], [2, 1])).toBe(
      true,
    )
  })

  it('is true when the cache is missing', () => {
    expect(submittedMembershipIdsStillPresent(undefined, [1])).toBe(true)
  })
})

describe('sameMembershipIdOrder', () => {
  it('is true only when ids match in order', () => {
    expect(sameMembershipIdOrder([{ id: 1 }, { id: 2 }], [{ id: 1 }, { id: 2 }])).toBe(true)
    expect(sameMembershipIdOrder([{ id: 1 }, { id: 2 }], [{ id: 2 }, { id: 1 }])).toBe(false)
  })
})

describe('withMembershipSortOrder', () => {
  it('keeps a row object when its sortOrder already matches the index', () => {
    const rows = [membership(4, 0), membership(5, null)]
    const ordered = withMembershipSortOrder(rows)

    expect(ordered[0]).toBe(rows[0])
    expect(ordered[1]?.sortOrder).toBe(1)
  })
})

describe('patchMembershipLibraryStatus', () => {
  it('updates only the targeted row status', () => {
    const rows = [membership(1, 0, 'planned'), membership(2, 1, 'watching')]
    const patched = patchMembershipLibraryStatus(rows, 1, 'completed')
    const first = patched[0]?.libraryItem
    const second = patched[1]?.libraryItem

    expect(typeof first === 'object' && first?.status).toBe('completed')
    expect(patched[1]).toBe(rows[1])
    expect(typeof second === 'object' && second?.status).toBe('watching')
  })
})

describe('formatMembershipMediaLabel', () => {
  it('joins year and film', () => {
    expect(
      formatMembershipMediaLabel({
        mediaType: 'movie',
        releaseDate: '2020-06-01',
      } as Media),
    ).toBe('2020 · Film')
  })

  it('labels a series and omits a missing year', () => {
    expect(
      formatMembershipMediaLabel({
        mediaType: 'tv',
        releaseDate: null,
      } as Media),
    ).toBe('Series')
  })
})

describe('formatAddedToListLabel', () => {
  it('prefixes a parsed date', () => {
    expect(formatAddedToListLabel('2026-03-04T15:00:00.000Z')).toMatch(/^Added to list /)
  })

  it('returns null when the date cannot be parsed', () => {
    expect(formatAddedToListLabel('not-a-date')).toBeNull()
  })
})
