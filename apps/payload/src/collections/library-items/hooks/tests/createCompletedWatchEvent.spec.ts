import type { PayloadRequest } from 'payload'

import { describe, expect, it, vi } from 'vitest'

import { SKIP_COMPLETED_WATCH_EVENT } from '../../context'
import { createCompletedWatchEvent } from '../createCompletedWatchEvent'

function createHookArgs(options: {
  context?: Record<string, unknown>
  doc?: Record<string, unknown>
  media?: null | Record<string, unknown>
  previousStatus?: string
}) {
  const creates: Array<{ collection: string; data: Record<string, unknown> }> = []

  const req = {
    context: {},
    payload: {
      create: vi.fn(
        async ({ collection, data }: { collection: string; data: Record<string, unknown> }) => {
          creates.push({ collection, data })
          return data
        },
      ),
      findByID: vi.fn(async () => options.media),
    },
  } as unknown as PayloadRequest

  const args = {
    context: options.context ?? {},
    doc: {
      completedAt: '2024-01-02T00:00:00.000Z',
      id: 11,
      media: 5,
      profile: 22,
      status: 'completed',
      ...options.doc,
    },
    operation: 'update' as const,
    previousDoc: {
      status: options.previousStatus ?? 'watching',
    },
    req,
  } as Parameters<typeof createCompletedWatchEvent>[0]

  return { args, creates, req }
}

describe('createCompletedWatchEvent', () => {
  it('copies a movie runtime onto the completed event', async () => {
    const { args, creates } = createHookArgs({
      media: { id: 5, mediaType: 'movie', runtime: 124 },
    })

    await createCompletedWatchEvent(args)

    expect(creates).toEqual([
      {
        collection: 'watch-events',
        data: expect.objectContaining({
          eventType: 'completed',
          libraryItem: 11,
          media: 5,
          runtimeMinutes: 124,
        }),
      },
    ])
  })

  it('omits runtime for a movie with no length', async () => {
    const { args, creates } = createHookArgs({
      media: { id: 5, mediaType: 'movie', runtime: null },
    })

    await createCompletedWatchEvent(args)

    expect(creates[0]?.data).not.toHaveProperty('runtimeMinutes')
  })

  it('omits runtime when a series is marked completed', async () => {
    const { args, creates } = createHookArgs({
      media: { id: 5, mediaType: 'tv', runtime: 47 },
    })

    await createCompletedWatchEvent(args)

    expect(creates[0]?.data.eventType).toBe('completed')
    expect(creates[0]?.data).not.toHaveProperty('runtimeMinutes')
  })

  it('does nothing when log-watch already wrote the watch event', async () => {
    const { args, creates, req } = createHookArgs({
      context: { [SKIP_COMPLETED_WATCH_EVENT]: true },
      media: { id: 5, mediaType: 'movie', runtime: 124 },
    })

    await createCompletedWatchEvent(args)

    expect(req.payload.findByID).not.toHaveBeenCalled()
    expect(creates).toEqual([])
  })

  it('does nothing when the item was already completed', async () => {
    const { args, creates, req } = createHookArgs({
      media: { id: 5, mediaType: 'movie', runtime: 124 },
      previousStatus: 'completed',
    })

    await createCompletedWatchEvent(args)

    expect(req.payload.findByID).not.toHaveBeenCalled()
    expect(creates).toEqual([])
  })
})
