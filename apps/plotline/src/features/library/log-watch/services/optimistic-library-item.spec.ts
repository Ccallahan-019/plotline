import type { LibraryItem } from '@plotline/payload-types'

import { QueryClient } from '@tanstack/react-query'
import { describe, expect, it } from 'vitest'

import { watchedEpisodeQueryKeys } from '../../watch-events/services/query-keys'
import {
  cachedWatchedEpisodeKeys,
  patchLibraryItemFromBatch,
  patchLibraryItemFromLogWatch,
} from './optimistic-library-item'

// Minimal library item for optimistic patch assertions.
function libraryItem(
  overrides: Partial<LibraryItem> & Pick<LibraryItem, 'media' | 'progress' | 'status'>,
): LibraryItem {
  return {
    createdAt: '2026-01-01T00:00:00.000Z',
    id: 10,
    profile: 1,
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('patchLibraryItemFromLogWatch', () => {
  it('marks a movie watched without incrementing rewatchCount on a first watch', () => {
    const item = libraryItem({
      media: 7,
      progress: { type: 'movie', watched: false },
      rewatchCount: 0,
      status: 'watching',
    })

    const patched = patchLibraryItemFromLogWatch(item, { mediaId: 7 })

    expect(patched.progress).toEqual({ type: 'movie', watched: true })
    expect(patched.rewatchCount).toBe(0)
  })

  it('increments movie rewatchCount when progress.watched is already true', () => {
    const item = libraryItem({
      media: 7,
      progress: { type: 'movie', watched: true },
      rewatchCount: 2,
      status: 'watching',
    })

    const patched = patchLibraryItemFromLogWatch(item, { mediaId: 7 })

    expect(patched.progress).toMatchObject({ type: 'movie', watched: true })
    expect(patched.rewatchCount).toBe(3)
  })

  it('increments movie rewatchCount when status is completed even if watched is unset', () => {
    const item = libraryItem({
      media: 7,
      progress: { type: 'movie' },
      rewatchCount: null,
      status: 'completed',
    })

    const patched = patchLibraryItemFromLogWatch(item, {
      libraryItemStatus: 'completed',
      mediaId: '7',
    })

    expect(patched.progress).toMatchObject({ watched: true })
    expect(patched.rewatchCount).toBe(1)
    expect(patched.status).toBe('completed')
  })

  it('leaves a cached item unchanged when the media id does not match', () => {
    const item = libraryItem({
      media: 7,
      progress: { type: 'movie', watched: true },
      rewatchCount: 1,
      status: 'completed',
    })

    expect(patchLibraryItemFromLogWatch(item, { mediaId: 8 })).toBe(item)
  })

  it('patches a single TV episode from watched keys the same way as a one-episode batch', () => {
    const item = libraryItem({
      media: { id: 4 } as LibraryItem['media'],
      progress: { episodesWatched: 4, lastEpisode: 5, lastSeason: 2, type: 'tv' },
      status: 'watching',
    })

    const patched = patchLibraryItemFromLogWatch(
      item,
      {
        mediaId: 4,
        tvContext: { episode: 1, season: 1 },
      },
      new Set(['1:1']),
    )

    expect(patched.progress).toEqual({
      episodesWatched: 4,
      lastEpisode: 1,
      lastSeason: 1,
      type: 'tv',
    })
  })
})

describe('patchLibraryItemFromBatch', () => {
  it('increments episodesWatched only for pairs missing from the key set and this payload', () => {
    const item = libraryItem({
      media: 4,
      progress: { episodesWatched: 3, seasonsCompleted: [1], type: 'tv' },
      status: 'watching',
    })
    const watchedEpisodeKeys = new Set(['1:2'])

    const patched = patchLibraryItemFromBatch(
      item,
      {
        episodes: [
          { episode: 2, season: 1 },
          { episode: 3, season: 1 },
          { episode: 3, season: 1 },
          { episode: 1, season: 2 },
        ],
        mediaId: 4,
      },
      watchedEpisodeKeys,
    )

    expect(patched.progress).toEqual({
      episodesWatched: 5,
      lastEpisode: 1,
      lastSeason: 2,
      seasonsCompleted: [1],
      type: 'tv',
    })
    expect(watchedEpisodeKeys).toEqual(new Set(['1:2']))
  })

  it('does not change episodesWatched when the show is already completed', () => {
    const item = libraryItem({
      media: 4,
      progress: { episodesWatched: 10, lastEpisode: 8, lastSeason: 2, type: 'tv' },
      status: 'completed',
    })

    const patched = patchLibraryItemFromBatch(item, {
      episodes: [{ episode: 1, season: 3 }],
      libraryItemStatus: 'completed',
      mediaId: 4,
    })

    expect(patched.progress).toEqual({
      episodesWatched: 10,
      lastEpisode: 1,
      lastSeason: 3,
      type: 'tv',
    })
    expect(patched.status).toBe('completed')
  })

  it('still counts new episodes when this request is what marks the show completed', () => {
    const item = libraryItem({
      media: 4,
      progress: { episodesWatched: 1, type: 'tv' },
      status: 'watching',
    })

    const patched = patchLibraryItemFromBatch(item, {
      episodes: [{ episode: 2, season: 1 }],
      libraryItemStatus: 'completed',
      mediaId: 4,
    })

    expect(patched.status).toBe('completed')
    expect(patched.progress.episodesWatched).toBe(2)
  })

  it('counts episodes when watched-episode coverage has not loaded, except for a completed show', () => {
    const watching = libraryItem({
      media: 4,
      progress: { episodesWatched: 1, type: 'tv' },
      status: 'watching',
    })
    const completed = libraryItem({
      ...watching,
      progress: { episodesWatched: 10, type: 'tv' },
      status: 'completed',
    })

    expect(
      patchLibraryItemFromBatch(watching, {
        episodes: [{ episode: 2, season: 1 }],
        mediaId: 4,
      }).progress.episodesWatched,
    ).toBe(2)
    expect(
      patchLibraryItemFromBatch(completed, {
        episodes: [{ episode: 2, season: 1 }],
        mediaId: 4,
      }).progress.episodesWatched,
    ).toBe(10)
  })
})

describe('cachedWatchedEpisodeKeys', () => {
  it('reads season:episode keys from the watched-episodes query cache', () => {
    const queryClient = new QueryClient()
    const item = libraryItem({
      id: 42,
      media: 4,
      progress: { episodesWatched: 2, type: 'tv' },
      status: 'watching',
    })

    expect(cachedWatchedEpisodeKeys(queryClient, item.id).size).toBe(0)

    queryClient.setQueryData(watchedEpisodeQueryKeys.forLibraryItem(item.id), [
      { episode: 1, season: 1 },
      { episode: 1, season: 2 },
    ])

    const patched = patchLibraryItemFromBatch(
      item,
      {
        episodes: [
          { episode: 1, season: 1 },
          { episode: 2, season: 1 },
        ],
        mediaId: 4,
      },
      cachedWatchedEpisodeKeys(queryClient, item.id),
    )

    expect(patched.progress).toMatchObject({
      episodesWatched: 3,
      lastEpisode: 2,
      lastSeason: 1,
    })
  })
})
