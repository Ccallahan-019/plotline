import type { LibraryItem, WatchEvent } from '@plotline/payload-types'
import type { PayloadRequest } from 'payload'

import { describe, expect, it, vi } from 'vitest'

import { deriveLogWatchRewatch, loadLogWatchRewatchContext } from '../derive-rewatch'

function createMovieLibraryItem(
  overrides?: Partial<Pick<LibraryItem, 'progress' | 'status'>>,
): LibraryItem {
  return {
    createdAt: '2026-01-01T00:00:00.000Z',
    id: 11,
    media: 5,
    profile: 22,
    progress: {
      type: 'movie',
      watched: false,
      ...overrides?.progress,
    },
    status: overrides?.status ?? 'watching',
    updatedAt: '2026-01-01T00:00:00.000Z',
  }
}

function createReq(options: {
  libraryItem: LibraryItem
  watchEventPages?: Array<Array<{ tvContext?: null | WatchEvent['tvContext'] }>>
}): PayloadRequest {
  const pages = options.watchEventPages ?? [[]]

  return {
    payload: {
      find: vi.fn(async ({ page }: { page?: number }) => {
        const index = (page ?? 1) - 1
        const docs = pages[index] ?? []

        return {
          docs,
          hasNextPage: index < pages.length - 1,
        }
      }),
      findByID: vi.fn(async () => options.libraryItem),
    },
  } as unknown as PayloadRequest
}

function createTvLibraryItem(
  overrides?: Partial<Pick<LibraryItem, 'progress' | 'status'>>,
): LibraryItem {
  return {
    createdAt: '2026-01-01T00:00:00.000Z',
    id: 11,
    media: 5,
    profile: 22,
    progress: {
      episodesWatched: 3,
      type: 'tv',
      ...overrides?.progress,
    },
    status: overrides?.status ?? 'watching',
    updatedAt: '2026-01-01T00:00:00.000Z',
  }
}

describe('loadLogWatchRewatchContext', () => {
  it('reloads the library item and skips watch-event paging for movies', async () => {
    const libraryItem = createMovieLibraryItem({
      progress: { type: 'movie', watched: true },
      status: 'completed',
    })
    const req = createReq({ libraryItem })

    const context = await loadLogWatchRewatchContext(req, 11)

    expect(context.libraryItem).toBe(libraryItem)
    expect(context.watchedEpisodeKeys).toEqual(new Set())
    expect(req.payload.find).not.toHaveBeenCalled()
  })

  it('pages TV watch events until exhausted and ignores rows without tvContext', async () => {
    const libraryItem = createTvLibraryItem()
    const req = createReq({
      libraryItem,
      watchEventPages: [
        [
          { tvContext: { episode: 1, season: 1 } },
          { tvContext: null },
          {},
        ],
        [{ tvContext: { episode: 2, season: 1 } }],
      ],
    })

    const context = await loadLogWatchRewatchContext(req, 11)

    expect(context.watchedEpisodeKeys).toEqual(new Set(['1:1', '1:2']))
    expect(req.payload.find).toHaveBeenCalledTimes(2)
    expect(req.payload.find).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        collection: 'watch-events',
        page: 1,
        where: { libraryItem: { equals: 11 } },
      }),
    )
    expect(req.payload.find).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        collection: 'watch-events',
        page: 2,
      }),
    )
  })
})

describe('deriveLogWatchRewatch', () => {
  it('classifies a movie first watch from persisted progress, not a client rewatch flag', () => {
    const context = {
      libraryItem: createMovieLibraryItem(),
      watchedEpisodeKeys: new Set<string>(),
    }

    expect(deriveLogWatchRewatch(context)).toEqual({
      eventType: 'completed',
      isRewatch: false,
    })
  })

  it('classifies a movie rewatch when the title is already watched', () => {
    const context = {
      libraryItem: createMovieLibraryItem({
        progress: { type: 'movie', watched: true },
        status: 'completed',
      }),
      watchedEpisodeKeys: new Set<string>(),
    }

    expect(deriveLogWatchRewatch(context)).toEqual({
      eventType: 'rewatched',
      isRewatch: true,
    })
  })

  it('classifies a TV first watch and records the pair for later rows in this batch', () => {
    const context = {
      libraryItem: createTvLibraryItem(),
      watchedEpisodeKeys: new Set<string>(),
    }

    expect(
      deriveLogWatchRewatch(context, { episode: 4, season: 1 }),
    ).toEqual({
      eventType: 'progress',
      isRewatch: false,
    })
    expect(context.watchedEpisodeKeys).toEqual(new Set(['1:4']))
    expect(
      deriveLogWatchRewatch(context, { episode: 4, season: 1 }),
    ).toEqual({
      eventType: 'rewatched',
      isRewatch: true,
    })
  })

  it('classifies a TV rewatch when a prior event already covered the pair', () => {
    const context = {
      libraryItem: createTvLibraryItem(),
      watchedEpisodeKeys: new Set(['2:3']),
    }

    expect(
      deriveLogWatchRewatch(context, { episode: 3, season: 2 }),
    ).toEqual({
      eventType: 'rewatched',
      isRewatch: true,
    })
    expect(context.watchedEpisodeKeys).toEqual(new Set(['2:3']))
  })

  it('classifies every TV episode as a rewatch when the show is completed', () => {
    const context = {
      libraryItem: createTvLibraryItem({ status: 'completed' }),
      watchedEpisodeKeys: new Set<string>(),
    }

    expect(
      deriveLogWatchRewatch(context, { episode: 1, season: 1 }),
    ).toEqual({
      eventType: 'rewatched',
      isRewatch: true,
    })
    expect(context.watchedEpisodeKeys.size).toBe(0)
  })
})
