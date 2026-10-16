import { describe, expect, it } from 'vitest'

import type { ContinueWatchingItem } from './continue-watching'

import { selectUpNextItems } from './up-next'

describe('selectUpNextItems', () => {
  it('keeps the six most recently watched titles and does not promote a stalled one', () => {
    const items = [
      item({ id: 1, lastWatchedAt: '2026-09-01T00:00:00.000Z', stalledDays: 30, title: 'Stalled' }),
      item({ id: 2, lastWatchedAt: '2026-10-12T00:00:00.000Z', title: 'Newest' }),
      item({ id: 3, lastWatchedAt: '2026-10-10T00:00:00.000Z', title: 'Middle' }),
      item({ id: 4, lastWatchedAt: null, title: 'Unwatched' }),
      item({ id: 5, lastWatchedAt: '2026-10-01T00:00:00.000Z', title: 'Older' }),
      item({ id: 6, lastWatchedAt: '2026-10-11T00:00:00.000Z', title: 'Recent' }),
      item({ id: 7, lastWatchedAt: '2026-08-01T00:00:00.000Z', title: 'Oldest' }),
      item({ id: 8, lastWatchedAt: '2026-07-01T00:00:00.000Z', title: 'Dropped from six' }),
    ]

    expect(selectUpNextItems(items).map((row) => row.title)).toEqual([
      'Newest',
      'Recent',
      'Middle',
      'Older',
      'Stalled',
      'Oldest',
    ])
  })
})

function item(
  overrides: Partial<ContinueWatchingItem> & Pick<ContinueWatchingItem, 'id' | 'lastWatchedAt'>,
): ContinueWatchingItem {
  return {
    contextLabel: 'Film · In progress',
    logLabel: 'Log as watched',
    mediaType: 'movie',
    percent: 50,
    posterPath: null,
    progressLabel: 'In progress',
    stalledDays: null,
    title: `Title ${overrides.id}`,
    tmdbId: overrides.id,
    ...overrides,
  }
}
