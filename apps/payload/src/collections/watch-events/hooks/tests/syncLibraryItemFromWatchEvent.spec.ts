import type { PayloadRequest } from 'payload'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { SKIP_PROGRESS_SYNC_FROM_WATCH_EVENT } from '../../../library-items/context'
import { syncLibraryItemFromWatchEvent } from '../syncLibraryItemFromWatchEvent'

vi.mock('../../utils/withLibraryItemRowLock', () => {
  let mutex = Promise.resolve()

  return {
    withLibraryItemRowLock: async (
      _req: PayloadRequest,
      _libraryItemId: number | string,
      fn: () => Promise<unknown>,
    ) => {
      const previous = mutex
      let release = () => {}
      mutex = new Promise<void>((resolve) => {
        release = resolve
      })

      await previous

      try {
        return await fn()
      } finally {
        release()
      }
    },
  }
})

function createHookArgs(options: {
  context?: Record<string, unknown>
  doc?: Record<string, unknown>
  episodesWatchedRef?: { value: number }
  libraryItem?: Record<string, unknown>
  rewatchCountRef?: { value: number }
}) {
  const updates: Array<{ collection: string; data: Record<string, unknown> }> = []
  const episodesWatchedRef = options.episodesWatchedRef ?? { value: 0 }
  const rewatchCountRef = options.rewatchCountRef ?? { value: 0 }

  const req = {
    context: {},
    payload: {
      findByID: vi.fn(async () => ({
        progress: {
          episodesWatched: episodesWatchedRef.value,
          type: 'tv',
        },
        rewatchCount: rewatchCountRef.value,
        ...options.libraryItem,
      })),
      update: vi.fn(async ({ collection, data }: { collection: string; data: Record<string, unknown> }) => {
        updates.push({ collection, data })

        if (collection === 'library-items' && data.progress != null) {
          const progress = data.progress as { episodesWatched?: number }
          if (progress.episodesWatched != null) {
            episodesWatchedRef.value = progress.episodesWatched
          }
        }

        if (collection === 'library-items' && typeof data.rewatchCount === 'number') {
          rewatchCountRef.value = data.rewatchCount
        }
      }),
    },
  } as unknown as PayloadRequest

  return {
    args: {
      context: options.context ?? {},
      doc: {
        eventType: 'progress',
        isRewatch: false,
        libraryItem: 11,
        profile: 22,
        tvContext: { episode: 2, season: 1 },
        watchedAt: '2026-08-17T12:00:00.000Z',
        ...options.doc,
      },
      operation: 'create' as const,
      req,
    } as Parameters<typeof syncLibraryItemFromWatchEvent>[0],
    req,
    updates,
  }
}

describe('syncLibraryItemFromWatchEvent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('still updates lastWatchedAt and clears statsCache when progress sync is skipped', async () => {
    const { args, req, updates } = createHookArgs({
      context: { [SKIP_PROGRESS_SYNC_FROM_WATCH_EVENT]: true },
      episodesWatchedRef: { value: 4 },
    })

    await syncLibraryItemFromWatchEvent(args)

    expect(req.payload.findByID).not.toHaveBeenCalled()
    expect(updates).toEqual([
      {
        collection: 'library-items',
        data: { lastWatchedAt: '2026-08-17T12:00:00.000Z' },
      },
      {
        collection: 'profiles',
        data: { statsCache: null },
      },
    ])
  })

  it('serializes concurrent progress creates so episodesWatched is incremented once per event', async () => {
    const episodesWatchedRef = { value: 5 }
    const first = createHookArgs({ episodesWatchedRef })
    const second = createHookArgs({ episodesWatchedRef })

    await Promise.all([
      syncLibraryItemFromWatchEvent(first.args),
      syncLibraryItemFromWatchEvent(second.args),
    ])

    const libraryItemUpdates = [...first.updates, ...second.updates].filter(
      (update) => update.collection === 'library-items',
    )
    const watchedCounts = libraryItemUpdates.map(
      (update) => (update.data.progress as { episodesWatched?: number } | undefined)?.episodesWatched,
    )

    expect(watchedCounts.sort((a, b) => (a ?? 0) - (b ?? 0))).toEqual([6, 7])
    expect(episodesWatchedRef.value).toBe(7)
  })

  it('marks a movie as watched on a completed first-watch event', async () => {
    const { args, updates } = createHookArgs({
      doc: {
        eventType: 'completed',
        isRewatch: false,
        tvContext: undefined,
      },
      libraryItem: {
        progress: { type: 'movie', watched: false },
        rewatchCount: 0,
      },
    })

    await syncLibraryItemFromWatchEvent(args)

    expect(updates).toEqual([
      {
        collection: 'library-items',
        data: {
          lastWatchedAt: '2026-08-17T12:00:00.000Z',
          progress: { type: 'movie', watched: true },
        },
      },
      {
        collection: 'profiles',
        data: { statsCache: null },
      },
    ])
  })

  it('increments movie rewatchCount and keeps watched true on a rewatch event', async () => {
    const rewatchCountRef = { value: 0 }
    const { args, updates } = createHookArgs({
      doc: {
        eventType: 'rewatched',
        isRewatch: true,
        tvContext: undefined,
      },
      libraryItem: {
        progress: { type: 'movie', watched: true },
        rewatchCount: 0,
      },
      rewatchCountRef,
    })

    await syncLibraryItemFromWatchEvent(args)

    expect(rewatchCountRef.value).toBe(1)
    expect(updates).toEqual([
      {
        collection: 'library-items',
        data: {
          lastWatchedAt: '2026-08-17T12:00:00.000Z',
          progress: { type: 'movie', watched: true },
          rewatchCount: 1,
        },
      },
      {
        collection: 'profiles',
        data: { statsCache: null },
      },
    ])
  })
})
