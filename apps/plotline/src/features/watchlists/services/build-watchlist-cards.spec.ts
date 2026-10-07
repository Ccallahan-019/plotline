import type { LibraryItem, Media, Watchlist, WatchlistMembership } from '@plotline/payload-types'

import { describe, expect, it } from 'vitest'

import type { WatchlistCard } from '../types'

import {
  buildWatchlistCards,
  collectPreviewLibraryItemIds,
  sortWatchlistCards,
} from './build-watchlist-cards'

describe('buildWatchlistCards', () => {
  it('keeps watchlist order and normalizes blank descriptions', () => {
    const cards = buildWatchlistCards({
      libraryItems: [],
      memberships: [],
      watchlists: [
        watchlist({ description: '  ', id: 2, name: 'Zed', slug: 'zed' }),
        watchlist({
          description: '  Weekend queue  ',
          id: 1,
          name: 'Amy',
          slug: 'amy',
          visibility: 'public',
        }),
        watchlist({ description: null, id: 3, name: 'Empty', slug: 'empty' }),
      ],
    })

    expect(cards.map((card) => card.name)).toEqual(['Zed', 'Amy', 'Empty'])
    expect(cards[1]).toMatchObject({
      description: '  Weekend queue  ',
      slug: 'amy',
      titleCount: 0,
      visibility: 'public',
    })
    expect(cards[0]?.description).toBeNull()
    expect(cards[2]?.description).toBeNull()
    expect(cards[0]?.previews).toEqual([])
  })

  it('counts every membership and previews only the first three in list order', () => {
    const list = watchlist({
      id: 1,
      name: 'Queue',
      slug: 'queue',
      statsCache: {
        completed: 0,
        inProgress: 0,
        lastCalculatedAt: '2026-01-01T00:00:00.000Z',
        percentComplete: 0,
        remaining: 40,
        totalEligible: 40,
      },
    })
    const items = [10, 11, 12, 13].map((id, index) =>
      libraryItem({
        id,
        media: media({ id, posterPath: `/p${id}.jpg`, title: `Title ${index + 1}` }),
      }),
    )

    const cards = buildWatchlistCards({
      libraryItems: items,
      memberships: [
        membership({ id: 1, libraryItem: 10, watchlist: 1 }),
        membership({
          id: 2,
          libraryItem: {
            ...items[1]!,
            media: media({ id: 11, posterPath: '/from-membership.jpg', title: 'From membership' }),
          },
          watchlist: list,
        }),
        membership({ id: 3, libraryItem: 12, watchlist: 1 }),
        membership({ id: 4, libraryItem: 13, watchlist: 1 }),
        membership({ id: 5, libraryItem: 99, watchlist: 2 }),
      ],
      watchlists: [list],
    })

    expect(cards).toHaveLength(1)
    expect(cards[0]?.titleCount).toBe(4)
    expect(cards[0]?.previews).toEqual([
      { posterPath: '/p10.jpg', title: 'Title 1' },
      { posterPath: '/p11.jpg', title: 'Title 2' },
      { posterPath: '/p12.jpg', title: 'Title 3' },
    ])
  })

  it('keeps a preview slot when the poster or library item is missing', () => {
    const cards = buildWatchlistCards({
      libraryItems: [
        libraryItem({
          id: 1,
          media: media({ id: 1, posterPath: null, title: 'No poster' }),
        }),
        libraryItem({
          id: 2,
          media: media({ id: 2, posterPath: '   ', title: 'Blank poster' }),
        }),
        libraryItem({
          id: 3,
          media: 3,
        }),
        libraryItem({
          id: 5,
          media: media({ id: 5, posterPath: '/later.jpg', title: 'Fourth title' }),
        }),
      ],
      memberships: [
        membership({ id: 1, libraryItem: 1, watchlist: 1 }),
        membership({ id: 2, libraryItem: 2, watchlist: 1 }),
        membership({ id: 3, libraryItem: 4, watchlist: 1 }),
        membership({ id: 4, libraryItem: 5, watchlist: 1 }),
        membership({ id: 5, libraryItem: 3, watchlist: 2 }),
      ],
      watchlists: [
        watchlist({ id: 1, name: 'Gaps', slug: 'gaps' }),
        watchlist({ id: 2, name: 'Unpopulated', slug: 'unpopulated' }),
      ],
    })

    expect(cards[0]?.titleCount).toBe(4)
    expect(cards[0]?.previews).toEqual([
      { posterPath: null, title: 'No poster' },
      { posterPath: null, title: 'Blank poster' },
      { posterPath: null, title: '' },
    ])
    expect(cards[1]?.previews).toEqual([{ posterPath: null, title: '' }])
  })

  it('reads posters from the library items, including when memberships are interleaved', () => {
    const cards = buildWatchlistCards({
      libraryItems: [
        libraryItem({
          id: 10,
          media: media({ id: 10, posterPath: '/from-library.jpg', title: 'From library' }),
        }),
        libraryItem({
          id: 20,
          media: media({ id: 20, posterPath: '/other.jpg', title: 'Other' }),
        }),
      ],
      memberships: [
        membership({ id: 1, libraryItem: 10, watchlist: 1 }),
        membership({ id: 2, libraryItem: 20, watchlist: 2 }),
        membership({ id: 3, libraryItem: 11, watchlist: 1 }),
      ],
      watchlists: [
        watchlist({ id: 1, name: 'First', slug: 'first' }),
        watchlist({ id: 2, name: 'Second', slug: 'second' }),
      ],
    })

    expect(cards[0]?.previews).toEqual([
      { posterPath: '/from-library.jpg', title: 'From library' },
      { posterPath: null, title: '' },
    ])
    expect(cards[0]?.titleCount).toBe(2)
    expect(cards[1]?.previews).toEqual([{ posterPath: '/other.jpg', title: 'Other' }])
    expect(cards[1]?.titleCount).toBe(1)
  })
})

describe('collectPreviewLibraryItemIds', () => {
  it('returns the first three ids per list and skips duplicates and later titles', () => {
    const ids = collectPreviewLibraryItemIds(
      [{ id: 1 }, { id: 2 }],
      [
        membership({ id: 1, libraryItem: 10, watchlist: 1 }),
        membership({ id: 2, libraryItem: 11, watchlist: 1 }),
        membership({ id: 3, libraryItem: 12, watchlist: 1 }),
        membership({ id: 4, libraryItem: 13, watchlist: 1 }),
        membership({ id: 5, libraryItem: 10, watchlist: 2 }),
        membership({ id: 6, libraryItem: 20, watchlist: 2 }),
      ],
    )

    expect(ids).toEqual([10, 11, 12, 20])
  })
})

describe('sortWatchlistCards', () => {
  const cards = [
    card({
      createdAt: '2026-03-01T00:00:00.000Z',
      id: 2,
      name: 'Alpha',
      titleCount: 5,
      updatedAt: '2026-01-01T00:00:00.000Z',
    }),
    card({
      createdAt: '2026-01-01T00:00:00.000Z',
      id: 1,
      name: 'alpha',
      titleCount: 5,
      updatedAt: '2026-06-01T00:00:00.000Z',
    }),
    card({
      createdAt: '2026-02-01T00:00:00.000Z',
      id: 3,
      name: 'Middle',
      titleCount: 1,
      updatedAt: '2026-03-01T00:00:00.000Z',
    }),
    card({
      createdAt: '2026-04-01T00:00:00.000Z',
      id: 4,
      name: 'zeta',
      titleCount: 2,
      updatedAt: '2026-02-01T00:00:00.000Z',
    }),
  ]

  it('sorts by name, recently updated, newest, and title count without mutating the input', () => {
    const snapshot = cards.map((item) => item.id)

    expect(sortWatchlistCards(cards).map((item) => item.id)).toEqual([1, 2, 3, 4])
    expect(sortWatchlistCards(cards, 'name-asc').map((item) => item.id)).toEqual([1, 2, 3, 4])
    expect(sortWatchlistCards(cards, 'name-desc').map((item) => item.id)).toEqual([4, 3, 1, 2])
    expect(sortWatchlistCards(cards, 'recently-updated').map((item) => item.id)).toEqual([
      1, 3, 4, 2,
    ])
    expect(sortWatchlistCards(cards, 'newest').map((item) => item.id)).toEqual([4, 2, 3, 1])
    expect(sortWatchlistCards(cards, 'most-titles').map((item) => item.id)).toEqual([1, 2, 4, 3])
    expect(cards.map((item) => item.id)).toEqual(snapshot)
  })
})

function card(
  overrides: Partial<WatchlistCard> & Pick<WatchlistCard, 'id' | 'name'>,
): WatchlistCard {
  return {
    createdAt: '2026-01-01T00:00:00.000Z',
    description: null,
    previews: [],
    slug: 'list',
    titleCount: 0,
    updatedAt: '2026-01-01T00:00:00.000Z',
    visibility: 'private',
    ...overrides,
  }
}

function libraryItem(
  overrides: Partial<LibraryItem> & Pick<LibraryItem, 'id' | 'media'>,
): LibraryItem {
  return {
    createdAt: '2026-01-01T00:00:00.000Z',
    profile: 1,
    progress: { type: 'movie', watched: false },
    status: 'planned',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

function media(overrides: Partial<Media> & Pick<Media, 'id' | 'title'>): Media {
  return {
    createdAt: '2026-01-01T00:00:00.000Z',
    mediaType: 'movie',
    tmdbId: overrides.id,
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

function membership(
  overrides: Partial<WatchlistMembership> &
    Pick<WatchlistMembership, 'id' | 'libraryItem' | 'watchlist'>,
): WatchlistMembership {
  return {
    addedAt: '2026-01-01T00:00:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

function watchlist(
  overrides: Partial<Watchlist> & Pick<Watchlist, 'id' | 'name' | 'slug'>,
): Watchlist {
  return {
    createdAt: '2026-01-01T00:00:00.000Z',
    owner: 1,
    updatedAt: '2026-01-01T00:00:00.000Z',
    visibility: 'private',
    ...overrides,
  }
}
