import type { PayloadRequest } from 'payload'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  SKIP_MEMBERSHIP_SYNC_FROM_LIBRARY,
  SKIP_WATCHLIST_STATS_RECALC,
} from '../../../watchlists/context'
import { recalculateWatchlistsForLibraryItem } from '../../utils/recalculateWatchlistsForLibraryItem'
import { syncMembershipsFromLibraryItem } from '../syncMembershipsFromLibraryItem'

vi.mock('../../utils/recalculateWatchlistsForLibraryItem', () => ({
  recalculateWatchlistsForLibraryItem: vi.fn(async () => undefined),
}))

const addedAt = '2026-06-01T00:00:00.000Z'
const completedBefore = '2026-01-15T00:00:00.000Z'

const watchedMovieProgress = { type: 'movie' as const, watched: true }

function challenge(includeRewatches: boolean) {
  return {
    enabled: true,
    goalCount: 10,
    goalType: 'count' as const,
    includeRewatches,
    priorCompletionRule: 'exclude_if_already_completed' as const,
    tvCountRule: 'tv_as_series' as const,
  }
}

function createHookArgs(options: {
  doc: Record<string, unknown>
  includeRewatches?: boolean
  membership?: Record<string, unknown>
  previousDoc: Record<string, unknown>
}) {
  const updates: Array<{
    collection: string
    context?: Record<string, unknown>
    data: Record<string, unknown>
  }> = []

  const req = {
    context: {} as Record<string, unknown>,
    payload: {
      find: vi.fn(async () => ({
        docs: [
          {
            addedAt,
            countsTowardGoal: false,
            episodesAtJoin: 0,
            episodesCountedForList: 0,
            goalWeight: 1,
            id: 7,
            listStatus: 'planned',
            ...options.membership,
            watchlist: {
              challenge: challenge(options.includeRewatches ?? true),
              id: 3,
            },
          },
        ],
      })),
      findByID: vi.fn(async () => null),
      update: vi.fn(
        async ({
          collection,
          context,
          data,
        }: {
          collection: string
          context?: Record<string, unknown>
          data: Record<string, unknown>
        }) => {
          if (context) {
            req.context =
              Object.keys(req.context).length === 0
                ? { ...context }
                : { ...req.context, ...context }
          }

          updates.push({
            collection,
            context: context ? { ...context } : undefined,
            data: { ...data },
          })

          return data
        },
      ),
    },
  } as unknown as PayloadRequest

  const args = {
    context: {},
    doc: options.doc,
    operation: 'update' as const,
    previousDoc: options.previousDoc,
    req,
  } as Parameters<typeof syncMembershipsFromLibraryItem>[0]

  return { args, req, updates }
}

function watchedMovie(rewatchCount: number) {
  return {
    completedAt: completedBefore,
    id: 11,
    media: { id: 5, mediaType: 'movie', runtime: 120 },
    progress: watchedMovieProgress,
    rewatchCount,
    status: 'completed',
  }
}

describe('syncMembershipsFromLibraryItem', () => {
  beforeEach(() => {
    vi.mocked(recalculateWatchlistsForLibraryItem).mockClear()
  })

  it('re-derives memberships when a movie rewatch only increments rewatchCount', async () => {
    const { args, req, updates } = createHookArgs({
      doc: watchedMovie(1),
      previousDoc: watchedMovie(0),
    })

    await syncMembershipsFromLibraryItem(args)

    expect(updates).toEqual([
      expect.objectContaining({
        collection: 'watchlist-memberships',
        context: {
          [SKIP_MEMBERSHIP_SYNC_FROM_LIBRARY]: true,
          [SKIP_WATCHLIST_STATS_RECALC]: true,
        },
        data: expect.objectContaining({
          completedForListAt: completedBefore,
          countsTowardGoal: true,
          listStatus: 'completed',
        }),
      }),
    ])
    expect(updates[0]?.data).not.toHaveProperty('excludeFromGoal')
    expect(req.context[SKIP_WATCHLIST_STATS_RECALC]).toBeUndefined()
    expect(req.context[SKIP_MEMBERSHIP_SYNC_FROM_LIBRARY]).toBeUndefined()
    expect(recalculateWatchlistsForLibraryItem).toHaveBeenCalledWith(req.payload, 11, req)
  })

  it('keeps a pre-join rewatch excluded when includeRewatches is off', async () => {
    const { args, updates } = createHookArgs({
      doc: watchedMovie(1),
      includeRewatches: false,
      previousDoc: watchedMovie(0),
    })

    await syncMembershipsFromLibraryItem(args)

    expect(updates[0]?.data).toMatchObject({
      countsTowardGoal: false,
      listStatus: 'planned',
    })
    expect(updates[0]?.data).not.toHaveProperty('completedForListAt')
    expect(updates[0]?.data).not.toHaveProperty('excludeFromGoal')
  })

  it('keeps a manual exclusion when a rewatch would otherwise count', async () => {
    const { args, updates } = createHookArgs({
      doc: watchedMovie(1),
      membership: { excludeFromGoal: true },
      previousDoc: watchedMovie(0),
    })

    await syncMembershipsFromLibraryItem(args)

    expect(updates[0]?.data).toMatchObject({
      countsTowardGoal: false,
      listStatus: 'planned',
    })
    expect(updates[0]?.data).not.toHaveProperty('completedForListAt')
    expect(updates[0]?.data).not.toHaveProperty('excludeFromGoal')
  })

  it('returns before loading memberships when status, progress, and rewatchCount are unchanged', async () => {
    const previousDoc = {
      ...watchedMovie(1),
      lastWatchedAt: '2026-06-02T00:00:00.000Z',
    }
    const { args, req } = createHookArgs({
      doc: {
        ...previousDoc,
        lastWatchedAt: '2026-08-01T00:00:00.000Z',
      },
      previousDoc,
    })

    await syncMembershipsFromLibraryItem(args)

    expect(req.payload.find).not.toHaveBeenCalled()
    expect(req.payload.update).not.toHaveBeenCalled()
    expect(recalculateWatchlistsForLibraryItem).not.toHaveBeenCalled()
  })

  it('still syncs when status changes and rewatchCount does not', async () => {
    const movie = watchedMovie(0)
    const { args, req } = createHookArgs({
      doc: { ...movie, status: 'completed' },
      previousDoc: { ...movie, status: 'watching' },
    })

    await syncMembershipsFromLibraryItem(args)

    expect(req.payload.find).toHaveBeenCalled()
    expect(recalculateWatchlistsForLibraryItem).toHaveBeenCalled()
  })
})
