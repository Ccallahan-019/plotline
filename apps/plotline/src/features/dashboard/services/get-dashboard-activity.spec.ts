import type { WatchEvent } from '@plotline/payload-types'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getDashboardActivity } from './get-dashboard-activity'
import { loadChallengeWatchlists, loadReviews, loadWatchEvents } from './load-dashboard-sources'
import { DashboardQueryError, type ParsedDashboardActivityQuery } from './parse-dashboard-query'

vi.mock('./load-dashboard-sources', () => ({
  loadChallengeWatchlists: vi.fn(),
  loadReviews: vi.fn(),
  loadWatchEvents: vi.fn(),
}))

const NOW = new Date('2026-10-14T18:00:00.000Z')

type NewestFirst = {
  enough: (events: readonly WatchEvent[]) => boolean
  from?: null | string
  to?: null | string
}

describe('getDashboardActivity', () => {
  beforeEach(() => {
    vi.mocked(loadChallengeWatchlists).mockReset().mockResolvedValue([])
    vi.mocked(loadReviews).mockReset().mockResolvedValue([])
    vi.mocked(loadWatchEvents).mockReset().mockResolvedValue([])
  })

  it('reads the whole event history and every source for the all feed', async () => {
    await getDashboardActivity('user', query({ kind: 'all' }), NOW)

    expect(loadWatchEvents).toHaveBeenCalledWith('user', 1)
    expect(loadReviews).toHaveBeenCalled()
    expect(loadChallengeWatchlists).toHaveBeenCalled()
  })

  it('skips events for rated pages and loads no reviews for challenge pages', async () => {
    await getDashboardActivity('user', query({ kind: 'rated' }), NOW)

    expect(loadWatchEvents).not.toHaveBeenCalled()
    expect(loadChallengeWatchlists).not.toHaveBeenCalled()
    expect(loadReviews).toHaveBeenCalledTimes(1)

    await getDashboardActivity('user', query({ kind: 'challenge' }), NOW)

    expect(loadWatchEvents).not.toHaveBeenCalled()
    expect(loadReviews).toHaveBeenCalledTimes(1)
    expect(loadChallengeWatchlists).toHaveBeenCalledTimes(1)
  })

  it('loads watched pages newest first, bounded by the range and cursor', async () => {
    const cursor = btoa(
      JSON.stringify({ id: 'watch:00000009', occurredAt: '2026-10-10T12:00:00.000Z' }),
    )
      .replaceAll('+', '-')
      .replaceAll('/', '_')
      .replaceAll('=', '')

    await getDashboardActivity(
      'user',
      query({ cursor, kind: 'watched', range: { days: 7, type: 'rolling' } }),
      NOW,
    )

    const options = vi.mocked(loadWatchEvents).mock.calls[0]?.[2]
    const newestFirst = options?.newestFirst as NewestFirst

    expect(newestFirst.from).toBe('2026-10-07T00:00:00.000Z')
    expect(newestFirst.to).toBe('2026-10-10T12:00:00.000Z')
    expect(loadChallengeWatchlists).not.toHaveBeenCalled()
  })

  it('stops loading once a full page and one more row are covered', async () => {
    await getDashboardActivity('user', query({ kind: 'watched', limit: 2 }), NOW)

    const newestFirst = vi.mocked(loadWatchEvents).mock.calls[0]?.[2]?.newestFirst as NewestFirst
    const events = [3, 2, 1].map((id) => event(id))

    expect(newestFirst.enough(events.slice(0, 2))).toBe(false)
    expect(newestFirst.enough(events)).toBe(true)
  })

  it('rejects an unreadable cursor before loading anything', async () => {
    await expect(
      getDashboardActivity('user', query({ cursor: 'not-a-cursor', kind: 'watched' }), NOW),
    ).rejects.toBeInstanceOf(DashboardQueryError)
    expect(loadWatchEvents).not.toHaveBeenCalled()
  })
})

function event(id: number): WatchEvent {
  return {
    createdAt: '2026-10-01T00:00:00.000Z',
    eventType: 'completed',
    id,
    media: {
      createdAt: '2026-10-01T00:00:00.000Z',
      id,
      mediaType: 'movie',
      title: `Film ${id}`,
      tmdbId: id,
      updatedAt: '2026-10-01T00:00:00.000Z',
    },
    profile: 1,
    updatedAt: '2026-10-01T00:00:00.000Z',
    watchedAt: `2026-10-0${id}T12:00:00.000Z`,
  } as unknown as WatchEvent
}

function query(overrides: Partial<ParsedDashboardActivityQuery>): ParsedDashboardActivityQuery {
  return {
    cursor: null,
    kind: 'all',
    limit: 20,
    mediaType: 'all',
    range: { type: 'all' },
    timeZone: 'UTC',
    ...overrides,
  }
}
