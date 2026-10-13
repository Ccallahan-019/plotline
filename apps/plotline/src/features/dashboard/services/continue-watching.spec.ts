import type { LibraryItem, Media } from '@plotline/payload-types'

import { describe, expect, it } from 'vitest'

import {
  buildContinueWatchingView,
  type ContinueWatchingItem,
  countContinueWatchingItems,
  sortContinueWatchingItems,
  toContinueWatchingItems,
} from './continue-watching'

const NOW = new Date('2026-10-12T00:00:00.000Z')

describe('toContinueWatchingItems', () => {
  it('keeps a film at 50% with an in-progress label', () => {
    const [film] = toContinueWatchingItems(
      [
        libraryItem({
          id: 1,
          media: media({ mediaType: 'movie', title: 'Heat', tmdbId: 10 }),
        }),
      ],
      NOW,
    )

    expect(film).toMatchObject({
      contextLabel: 'Film · In progress',
      logLabel: 'Log as watched',
      mediaType: 'movie',
      percent: 50,
      progressLabel: 'In progress',
      title: 'Heat',
    })
  })

  it('uses the series total and the next episode for TV', () => {
    const [show] = toContinueWatchingItems(
      [
        libraryItem({
          id: 2,
          media: media({
            mediaType: 'tv',
            title: 'The Show',
            tmdbId: 99,
            tvMeta: { episodeCount: 48 },
          }),
          progress: {
            episodesWatched: 37,
            lastEpisode: 1,
            lastSeason: 4,
            type: 'tv',
          },
        }),
      ],
      NOW,
    )

    expect(show).toMatchObject({
      contextLabel: 'TV · Next: S4 E2',
      logLabel: 'Log S4 E2',
      percent: 77,
      progressLabel: '37 / 48 eps · 77%',
    })
  })

  it('omits the TV percent when the catalog has no episode total', () => {
    const [show] = toContinueWatchingItems(
      [
        libraryItem({
          id: 3,
          media: media({ mediaType: 'tv', title: 'Partial', tmdbId: 8 }),
          progress: { episodesWatched: 12, lastEpisode: 2, lastSeason: 1, type: 'tv' },
        }),
      ],
      NOW,
    )

    expect(show?.percent).toBeNull()
    expect(show?.progressLabel).toBe('12 eps')
    expect(show?.contextLabel).toBe('TV · Next: S1 E3')
  })
})

describe('buildContinueWatchingView', () => {
  it('features the oldest stalled title and leaves the rest in order', () => {
    const recent = row({ id: 1, lastWatchedAt: '2026-10-10T00:00:00.000Z' })
    const stalledNewer = row({ id: 2, lastWatchedAt: '2026-09-28T00:00:00.000Z' })
    const stalledOlder = row({ id: 3, lastWatchedAt: '2026-09-01T00:00:00.000Z' })
    const items = toContinueWatchingItems(
      [recent, stalledNewer, stalledOlder].map((item, index) =>
        libraryItem({
          id: item.id,
          lastWatchedAt: item.lastWatchedAt,
          media: media({ mediaType: 'movie', title: `Title ${index}`, tmdbId: item.id }),
        }),
      ),
      NOW,
    )
    const view = buildContinueWatchingView(items)

    expect(view.hero).toMatchObject({ id: 3, stalledLabel: 'Stalled · 41d' })
    expect(view.alsoInProgress.map((item) => item.id)).toEqual([1, 2])
    expect(view.counts).toEqual({ all: 3, film: 3, tv: 0 })
  })

  it('features the most recently watched title when nothing is stalled', () => {
    const items = toContinueWatchingItems(
      [
        libraryItem({
          id: 1,
          lastWatchedAt: '2026-10-01T00:00:00.000Z',
          media: media({ mediaType: 'tv', title: 'Older', tmdbId: 1 }),
          progress: { type: 'tv' },
        }),
        libraryItem({
          id: 2,
          lastWatchedAt: '2026-10-11T00:00:00.000Z',
          media: media({ mediaType: 'movie', title: 'Newer', tmdbId: 2 }),
        }),
      ],
      NOW,
    )
    const view = buildContinueWatchingView(items)

    expect(view.hero).toMatchObject({ id: 2, stalledLabel: null })
    expect(view.alsoInProgress.map((item) => item.id)).toEqual([1])
  })

  it('keeps chip counts on the full set when the remainder is filtered', () => {
    const items = [
      progressRow({
        id: 1,
        lastWatchedAt: '2026-10-11T00:00:00.000Z',
        mediaType: 'tv',
        percent: 80,
      }),
      progressRow({
        id: 2,
        lastWatchedAt: '2026-10-01T00:00:00.000Z',
        mediaType: 'movie',
        percent: 50,
      }),
    ]
    const view = buildContinueWatchingView(items, { mediaType: 'movie' })

    expect(view.counts).toEqual({ all: 2, film: 1, tv: 1 })
    expect(view.hero?.mediaType).toBe('tv')
    expect(view.alsoInProgress.map((item) => item.id)).toEqual([2])
  })
})

describe('sortContinueWatchingItems', () => {
  const items = [
    progressRow({
      id: 1,
      lastWatchedAt: '2026-10-01T00:00:00.000Z',
      mediaType: 'tv',
      percent: 90,
    }),
    progressRow({
      id: 2,
      lastWatchedAt: '2026-10-11T00:00:00.000Z',
      mediaType: 'movie',
      percent: 50,
    }),
    progressRow({
      id: 3,
      lastWatchedAt: '2026-10-05T00:00:00.000Z',
      mediaType: 'tv',
      percent: 10,
    }),
    progressRow({
      id: 4,
      lastWatchedAt: null,
      mediaType: 'tv',
      percent: null,
    }),
  ]

  it('sorts last watched descending and leaves missing dates last', () => {
    expect(sortContinueWatchingItems(items, 'last-watched').map((item) => item.id)).toEqual([
      2, 3, 1, 4,
    ])
  })

  it('sorts most progress with films at 50%', () => {
    expect(sortContinueWatchingItems(items, 'most-progress').map((item) => item.id)).toEqual([
      1, 2, 3, 4,
    ])
  })

  it('sorts almost done by TV percent and places films last', () => {
    expect(sortContinueWatchingItems(items, 'almost-done').map((item) => item.id)).toEqual([
      1, 3, 4, 2,
    ])
  })
})

describe('countContinueWatchingItems', () => {
  it('counts films and series from the full watching set', () => {
    expect(
      countContinueWatchingItems([
        progressRow({ id: 1, mediaType: 'movie', percent: 50 }),
        progressRow({ id: 2, mediaType: 'tv', percent: 10 }),
        progressRow({ id: 3, mediaType: 'movie', percent: 50 }),
      ]),
    ).toEqual({ all: 3, film: 2, tv: 1 })
  })
})

function libraryItem(
  overrides: Partial<LibraryItem> & Pick<LibraryItem, 'id' | 'media'>,
): LibraryItem {
  return {
    createdAt: '2026-01-01T00:00:00.000Z',
    profile: 1,
    progress: { type: 'movie' },
    status: 'watching',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

function media(overrides: Partial<Media> & Pick<Media, 'mediaType' | 'title' | 'tmdbId'>): Media {
  return {
    createdAt: '2026-01-01T00:00:00.000Z',
    id: overrides.tmdbId,
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

function progressRow(
  overrides: Partial<ContinueWatchingItem> &
    Pick<ContinueWatchingItem, 'id' | 'mediaType' | 'percent'>,
): ContinueWatchingItem {
  return {
    contextLabel: 'Film · In progress',
    lastWatchedAt: '2026-10-10T00:00:00.000Z',
    logLabel: 'Log as watched',
    posterPath: null,
    progressLabel: 'In progress',
    stalledDays: null,
    title: `Title ${overrides.id}`,
    tmdbId: overrides.id,
    ...overrides,
  }
}

function row(overrides: Pick<ContinueWatchingItem, 'id' | 'lastWatchedAt'>): ContinueWatchingItem {
  return progressRow({ ...overrides, mediaType: 'movie', percent: 50 })
}
