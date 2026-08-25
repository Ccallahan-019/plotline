import type { LibraryItem, WatchEvent } from '@plotline/payload-types'
import type { MediaStatus } from '@plotline/shared/constants'
import type { PayloadRequest } from 'payload'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { withLibraryItemRowLock } from '../../../collections/watch-events/utils/withLibraryItemRowLock'
import { createWatchEvent } from '../create-watch-event'
import { logWatchEndpoint } from '../log-watch'

vi.mock('../../helpers', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../helpers')>()

  return {
    ...actual,
    requireProfileContext: vi.fn(async () => ({ profileId: 22 })),
    requireServiceAuth: vi.fn(async () => null),
  }
})

vi.mock('../create-watch-event')

vi.mock('../../../collections/watch-events/utils/withLibraryItemRowLock', () => ({
  withLibraryItemRowLock: vi.fn(
    async (_req: PayloadRequest, _libraryItemId: number | string, fn: () => Promise<unknown>) =>
      fn(),
  ),
}))

type LogWatchDb = {
  existingWatchEvents: Array<{ tvContext?: null | WatchEvent['tvContext'] }>
  libraryItem: Pick<LibraryItem, 'id' | 'progress' | 'rewatchCount' | 'status'>
}

function cloneDb(db: LogWatchDb): LogWatchDb {
  return structuredClone(db)
}

function createMovieLibraryItem(
  status: MediaStatus = 'watching',
  watched = false,
): Pick<LibraryItem, 'id' | 'progress' | 'rewatchCount' | 'status'> {
  return {
    id: 11,
    progress: {
      type: 'movie',
      watched,
    },
    rewatchCount: 0,
    status,
  }
}

function createTvLibraryItem(
  status: MediaStatus = 'watching',
): Pick<LibraryItem, 'id' | 'progress' | 'rewatchCount' | 'status'> {
  return {
    id: 11,
    progress: {
      episodesWatched: 3,
      type: 'tv',
    },
    rewatchCount: 0,
    status,
  }
}

describe('logWatchEndpoint', () => {
  let callOrder: string[]
  let db: LogWatchDb
  let snapshot: LogWatchDb | null

  beforeEach(() => {
    vi.clearAllMocks()
    callOrder = []
    snapshot = null
    db = {
      existingWatchEvents: [],
      libraryItem: createMovieLibraryItem(),
    }
    vi.mocked(withLibraryItemRowLock).mockImplementation(async (_req, _id, fn) => fn())
  })

  function createReq(body: Record<string, unknown>) {
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
        create: vi.fn(),
        db: {
          beginTransaction,
          commitTransaction,
          rollbackTransaction,
        },
        find: vi.fn(async ({ collection }: { collection: string }) => {
          if (collection === 'library-items') {
            return { docs: [db.libraryItem] }
          }

          if (collection === 'watch-events') {
            return { docs: db.existingWatchEvents, hasNextPage: false }
          }

          return { docs: [] }
        }),
        findByID: vi.fn(async ({ collection }: { collection: string }) => {
          if (collection === 'media') {
            return { id: 5, mediaType: db.libraryItem.progress.type }
          }

          return db.libraryItem
        }),
        update: vi.fn(
          async ({ collection, data }: { collection: string; data: Record<string, unknown> }) => {
            if (collection === 'library-items') {
              db.libraryItem = {
                ...db.libraryItem,
                ...data,
                progress: (data.progress as LibraryItem['progress']) ?? db.libraryItem.progress,
              }
              return db.libraryItem
            }

            return data
          },
        ),
      },
    } as unknown as PayloadRequest

    return { beginTransaction, commitTransaction, req, rollbackTransaction }
  }

  function mockCreateWatchEvent() {
    vi.mocked(createWatchEvent).mockImplementation(async (_req, input) => {
      callOrder.push('create')
      return {
        eventType: input.eventType,
        id: 1,
        isRewatch: input.isRewatch ?? false,
        tvContext: input.tvContext,
      } as WatchEvent
    })
  }

  it('returns 400 when mediaId is missing without requiring eventType', async () => {
    mockCreateWatchEvent()
    const { beginTransaction, req } = createReq({ eventType: 'completed' })

    const response = await logWatchEndpoint.handler(req)

    expect(response).toBeInstanceOf(Response)
    expect(response).toHaveProperty('status', 400)
    expect(await response.json()).toEqual({ error: 'mediaId is required' })
    expect(createWatchEvent).not.toHaveBeenCalled()
    expect(beginTransaction).not.toHaveBeenCalled()
  })

  it('locks the library item before deriving and creating the watch event', async () => {
    mockCreateWatchEvent()
    vi.mocked(withLibraryItemRowLock).mockImplementation(async (req, _id, fn) => {
      callOrder.push('lock')
      expect(await req.transactionID).toBe('tx-1')
      return fn()
    })

    const { commitTransaction, req } = createReq({ mediaId: 5 })

    const response = await logWatchEndpoint.handler(req)

    expect(response).toBeInstanceOf(Response)
    expect(response).toHaveProperty('status', 200)
    expect(callOrder).toEqual(['begin', 'lock', 'create', 'commit'])
    expect(commitTransaction).toHaveBeenCalled()
  })

  it('derives a movie first-watch even when the body asks for rewatch and completed status', async () => {
    mockCreateWatchEvent()

    const { req } = createReq({
      eventType: 'rewatched',
      isRewatch: true,
      libraryItemStatus: 'completed',
      mediaId: 5,
    })

    const response = await logWatchEndpoint.handler(req)

    expect(response).toBeInstanceOf(Response)
    expect(response).toHaveProperty('status', 200)
    expect(createWatchEvent).toHaveBeenCalledWith(
      req,
      expect.objectContaining({
        eventType: 'completed',
        isRewatch: false,
        skipProgressSync: true,
      }),
    )
    expect(db.libraryItem.status).toBe('completed')
    expect(db.libraryItem.progress).toEqual({ type: 'movie', watched: true })
    expect(db.libraryItem.rewatchCount).toBe(0)
  })

  it('derives a movie rewatch from persisted watched progress and increments rewatchCount', async () => {
    db.libraryItem = createMovieLibraryItem('completed', true)
    mockCreateWatchEvent()

    const { req } = createReq({
      eventType: 'completed',
      isRewatch: false,
      mediaId: 5,
    })

    const response = await logWatchEndpoint.handler(req)

    expect(response).toBeInstanceOf(Response)
    expect(response).toHaveProperty('status', 200)
    expect(createWatchEvent).toHaveBeenCalledWith(
      req,
      expect.objectContaining({
        eventType: 'rewatched',
        isRewatch: true,
      }),
    )
    expect(db.libraryItem.rewatchCount).toBe(1)
    expect(db.libraryItem.progress).toEqual({ type: 'movie', watched: true })
  })

  it('increments TV episodesWatched on a first-watch progress event', async () => {
    db.libraryItem = createTvLibraryItem()
    mockCreateWatchEvent()

    const { req } = createReq({
      mediaId: 5,
      tvContext: { episode: 4, season: 1 },
    })

    const response = await logWatchEndpoint.handler(req)

    expect(response).toBeInstanceOf(Response)
    expect(response).toHaveProperty('status', 200)
    expect(createWatchEvent).toHaveBeenCalledWith(
      req,
      expect.objectContaining({
        eventType: 'progress',
        isRewatch: false,
        tvContext: { episode: 4, season: 1 },
      }),
    )
    expect(db.libraryItem.progress).toEqual({
      episodesWatched: 4,
      lastEpisode: 4,
      lastSeason: 1,
      type: 'tv',
    })
  })

  it('derives a TV rewatch from prior episode events and does not increment episodesWatched', async () => {
    db.libraryItem = createTvLibraryItem()
    db.existingWatchEvents = [{ tvContext: { episode: 4, season: 1 } }]
    mockCreateWatchEvent()

    const { req } = createReq({
      mediaId: 5,
      tvContext: { episode: 4, season: 1 },
    })

    const response = await logWatchEndpoint.handler(req)

    expect(response).toBeInstanceOf(Response)
    expect(response).toHaveProperty('status', 200)
    expect(createWatchEvent).toHaveBeenCalledWith(
      req,
      expect.objectContaining({
        eventType: 'rewatched',
        isRewatch: true,
      }),
    )
    expect(db.libraryItem.progress.episodesWatched).toBe(3)
  })

  it('derives a TV rewatch when the show is already completed', async () => {
    db.libraryItem = createTvLibraryItem('completed')
    mockCreateWatchEvent()

    const { req } = createReq({
      mediaId: 5,
      tvContext: { episode: 1, season: 1 },
    })

    const response = await logWatchEndpoint.handler(req)

    expect(response).toBeInstanceOf(Response)
    expect(response).toHaveProperty('status', 200)
    expect(createWatchEvent).toHaveBeenCalledWith(
      req,
      expect.objectContaining({
        eventType: 'rewatched',
        isRewatch: true,
      }),
    )
    expect(db.libraryItem.progress.episodesWatched).toBe(3)
  })
})
