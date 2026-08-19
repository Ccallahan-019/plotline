import type { LibraryItem, Media, WatchEvent } from '@plotline/payload-types'
import type { MediaStatus } from '@plotline/shared/constants'
import type { PayloadRequest } from 'payload'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { withLibraryItemRowLock } from '../../collections/watch-events/utils/withLibraryItemRowLock'
import { createWatchEvent } from './create-watch-event'
import { logWatchBatchEndpoint } from './log-watch-batch'
import { resolveOrCreateLibraryItem } from './resolve-or-create-library-item'

vi.mock('../helpers', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../helpers')>()

  return {
    ...actual,
    requireProfileContext: vi.fn(async () => ({ profileId: 22 })),
    requireServiceAuth: vi.fn(async () => null),
  }
})

vi.mock('./create-watch-event')

vi.mock('./resolve-or-create-library-item', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./resolve-or-create-library-item')>()

  return {
    ...actual,
    resolveOrCreateLibraryItem: vi.fn(actual.resolveOrCreateLibraryItem),
  }
})

vi.mock('../../collections/watch-events/utils/withLibraryItemRowLock', () => ({
  withLibraryItemRowLock: vi.fn(
    async (_req: PayloadRequest, _libraryItemId: number | string, fn: () => Promise<unknown>) =>
      fn(),
  ),
}))

type BatchDb = {
  libraryItem: null | Pick<LibraryItem, 'id' | 'progress' | 'status'>
  media: Pick<Media, 'id' | 'mediaType'>
  profile: { id: number; statsCache: null | object }
  watchEvents: Array<Pick<WatchEvent, 'id'>>
}

function cloneDb(db: BatchDb): BatchDb {
  return structuredClone(db)
}

function createMovieLibraryItem(): Pick<LibraryItem, 'id' | 'progress' | 'status'> {
  return {
    id: 11,
    progress: {
      type: 'movie',
      watched: false,
    },
    status: 'watching',
  }
}

function createTvLibraryItem(
  status: MediaStatus = 'watching',
): Pick<LibraryItem, 'id' | 'progress' | 'status'> {
  return {
    id: 11,
    progress: {
      episodesWatched: 3,
      type: 'tv',
    },
    status,
  }
}

describe('logWatchBatchEndpoint', () => {
  let callOrder: string[]
  let db: BatchDb
  let snapshot: BatchDb | null

  beforeEach(() => {
    vi.clearAllMocks()
    callOrder = []
    snapshot = null
    db = {
      libraryItem: createTvLibraryItem(),
      media: { id: 5, mediaType: 'tv' },
      profile: { id: 22, statsCache: { stale: true } },
      watchEvents: [],
    }
    vi.mocked(withLibraryItemRowLock).mockImplementation(async (_req, _id, fn) => fn())
  })

  function createReq(body: {
    episodes: Array<{ episode: number; isRewatch?: boolean; season: number }>
    libraryItemStatus?: MediaStatus
    mediaId: number
  }) {
    const beginTransaction = vi.fn(async () => {
      callOrder.push('begin')
      snapshot = cloneDb(db)
      return 'tx-1'
    })
    const commitTransaction = vi.fn(async () => {
      callOrder.push('commit')
      snapshot = null
    })
    const rollbackTransaction = vi.fn(async () => {
      callOrder.push('rollback')

      if (snapshot) {
        db = cloneDb(snapshot)
        snapshot = null
      }
    })

    const req = {
      json: async () => body,
      payload: {
        create: vi.fn(
          async ({ collection, data }: { collection: string; data: Record<string, unknown> }) => {
            if (collection === 'library-items') {
              db.libraryItem = {
                id: 11,
                progress: data.progress as LibraryItem['progress'],
                status: data.status as LibraryItem['status'],
              }
              return db.libraryItem
            }

            return data
          },
        ),
        db: {
          beginTransaction,
          commitTransaction,
          rollbackTransaction,
        },
        find: vi.fn(async ({ collection }: { collection: string }) => {
          if (collection === 'library-items') {
            return { docs: db.libraryItem ? [db.libraryItem] : [] }
          }

          return { docs: [] }
        }),
        findByID: vi.fn(async ({ collection }: { collection: string }) => {
          if (collection === 'media') {
            return db.media
          }

          return db.libraryItem
        }),
        update: vi.fn(
          async ({ collection, data }: { collection: string; data: Record<string, unknown> }) => {
            if (collection === 'library-items') {
              if (!db.libraryItem) {
                throw new Error('library item missing')
              }

              db.libraryItem = {
                ...db.libraryItem,
                ...data,
                progress: (data.progress as LibraryItem['progress']) ?? db.libraryItem.progress,
              }
              return db.libraryItem
            }

            if (collection === 'profiles') {
              db.profile = { ...db.profile, ...data }
              return db.profile
            }

            return data
          },
        ),
      },
    } as unknown as PayloadRequest

    return { beginTransaction, commitTransaction, req, rollbackTransaction }
  }

  function mockCreateWatchEvent(options?: { failAfter?: number }) {
    vi.mocked(createWatchEvent).mockImplementation(async () => {
      if (options?.failAfter != null && db.watchEvents.length >= options.failAfter) {
        throw new Error('simulated failure after watch-event create')
      }

      callOrder.push('create')
      const watchEvent = { id: db.watchEvents.length + 1 }
      db.watchEvents.push(watchEvent)
      return watchEvent as WatchEvent
    })
  }

  it('rolls back watch events and progress when a later write fails', async () => {
    mockCreateWatchEvent({ failAfter: 1 })
    vi.mocked(withLibraryItemRowLock).mockImplementation(async (req, _id, fn) => {
      callOrder.push('lock')
      expect(await req.transactionID).toBe('tx-1')
      return fn()
    })

    const { req, rollbackTransaction } = createReq({
      episodes: [
        { episode: 1, season: 1 },
        { episode: 2, season: 1 },
      ],
      mediaId: 5,
    })

    await expect(logWatchBatchEndpoint.handler(req)).rejects.toThrow(
      'simulated failure after watch-event create',
    )

    expect(db.watchEvents).toEqual([])
    expect(db.libraryItem?.progress).toEqual({
      episodesWatched: 3,
      type: 'tv',
    })
    expect(db.profile.statsCache).toEqual({ stale: true })
    expect(rollbackTransaction).toHaveBeenCalled()
    expect(callOrder).toEqual(['begin', 'lock', 'create', 'rollback'])
  })

  it('rolls back library item status when a later write fails', async () => {
    db.libraryItem = createTvLibraryItem('planned')
    mockCreateWatchEvent({ failAfter: 1 })

    const { req, rollbackTransaction } = createReq({
      episodes: [
        { episode: 1, season: 1 },
        { episode: 2, season: 1 },
      ],
      libraryItemStatus: 'completed',
      mediaId: 5,
    })

    await expect(logWatchBatchEndpoint.handler(req)).rejects.toThrow(
      'simulated failure after watch-event create',
    )

    expect(db.libraryItem?.status).toBe('planned')
    expect(db.watchEvents).toEqual([])
    expect(rollbackTransaction).toHaveBeenCalled()
    expect(req.payload.create).not.toHaveBeenCalled()
  })

  it('returns 400 and leaves movie progress unchanged when the library item is a movie', async () => {
    const movieItem = createMovieLibraryItem()
    db.libraryItem = movieItem
    db.media = { id: 5, mediaType: 'movie' }
    mockCreateWatchEvent()

    const { beginTransaction, req } = createReq({
      episodes: [{ episode: 1, season: 1 }],
      mediaId: 5,
    })

    const response = await logWatchBatchEndpoint.handler(req)

    expect(response).toBeInstanceOf(Response)
    expect(response).toHaveProperty('status', 400)
    expect(await response.json()).toEqual({
      error: 'Batch log-watch is only supported for TV shows',
    })
    expect(resolveOrCreateLibraryItem).not.toHaveBeenCalled()
    expect(createWatchEvent).not.toHaveBeenCalled()
    expect(req.payload.create).not.toHaveBeenCalled()
    expect(req.payload.update).not.toHaveBeenCalled()
    expect(beginTransaction).not.toHaveBeenCalled()
    expect(db.watchEvents).toEqual([])
    expect(db.libraryItem?.progress).toEqual({
      type: 'movie',
      watched: false,
    })
  })

  it('returns 400 and does not create a library item when media is a movie and none exists', async () => {
    db.libraryItem = null
    db.media = { id: 5, mediaType: 'movie' }
    mockCreateWatchEvent()

    const { beginTransaction, req } = createReq({
      episodes: [{ episode: 1, season: 1 }],
      libraryItemStatus: 'watching',
      mediaId: 5,
    })

    const response = await logWatchBatchEndpoint.handler(req)

    expect(response).toBeInstanceOf(Response)
    expect(response).toHaveProperty('status', 400)
    expect(await response.json()).toEqual({
      error: 'Batch log-watch is only supported for TV shows',
    })
    expect(resolveOrCreateLibraryItem).not.toHaveBeenCalled()
    expect(req.payload.create).not.toHaveBeenCalled()
    expect(createWatchEvent).not.toHaveBeenCalled()
    expect(beginTransaction).not.toHaveBeenCalled()
    expect(db.libraryItem).toBeNull()
  })

  it('creates one watch event and increments episodesWatched once for a duplicated season/episode pair', async () => {
    mockCreateWatchEvent()

    const { commitTransaction, req } = createReq({
      episodes: [
        { episode: 1, season: 1 },
        { episode: 1, season: 1 },
      ],
      mediaId: 5,
    })

    const response = await logWatchBatchEndpoint.handler(req)

    expect(response).toBeInstanceOf(Response)
    expect(response).toHaveProperty('status', 200)
    expect(createWatchEvent).toHaveBeenCalledTimes(1)
    expect(db.watchEvents).toHaveLength(1)
    expect(db.libraryItem?.progress.episodesWatched).toBe(4)
    expect(commitTransaction).toHaveBeenCalled()
  })

  it('creates a first-watch event and increments episodesWatched when a rewatch precedes a first-watch of the same pair', async () => {
    mockCreateWatchEvent()

    const { commitTransaction, req } = createReq({
      episodes: [
        { episode: 1, isRewatch: true, season: 1 },
        { episode: 1, season: 1 },
      ],
      mediaId: 5,
    })

    const response = await logWatchBatchEndpoint.handler(req)

    expect(response).toBeInstanceOf(Response)
    expect(response).toHaveProperty('status', 200)
    expect(createWatchEvent).toHaveBeenCalledTimes(1)
    expect(createWatchEvent).toHaveBeenCalledWith(
      req,
      expect.objectContaining({
        eventType: 'progress',
        tvContext: { episode: 1, season: 1 },
      }),
    )
    expect(db.watchEvents).toHaveLength(1)
    expect(db.libraryItem?.progress.episodesWatched).toBe(4)
    expect(commitTransaction).toHaveBeenCalled()
  })
})
