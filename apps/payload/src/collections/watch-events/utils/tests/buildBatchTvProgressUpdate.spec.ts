import { toWatchedEpisodeKey } from '@plotline/shared/log-watch'
import { describe, expect, it } from 'vitest'

import { buildBatchTvProgressUpdate } from '../buildBatchTvProgressUpdate'

function watchedKeys(pairs: ReadonlyArray<readonly [number, number]>): Set<string> {
  return new Set(pairs.map(([season, episode]) => toWatchedEpisodeKey(season, episode)))
}

describe('buildBatchTvProgressUpdate', () => {
  it('increments only non-rewatch episodes and keeps last position from the latest log, including rewatches', () => {
    const progress = buildBatchTvProgressUpdate(
      [
        { episode: 1, season: 1 },
        { episode: 2, isRewatch: true, season: 1 },
        { episode: 3, season: 1 },
        { episode: 4, isRewatch: true, season: 2 },
      ],
      {
        episodesWatched: 10,
        seasonsCompleted: [1],
        type: 'tv',
      },
    )

    expect(progress).toEqual({
      episodesWatched: 12,
      lastEpisode: 4,
      lastSeason: 2,
      seasonsCompleted: [1],
      type: 'tv',
    })
  })

  it('preserves episodesWatched when every logged episode is a rewatch', () => {
    const progress = buildBatchTvProgressUpdate(
      [
        { episode: 1, isRewatch: true, season: 1 },
        { episode: 2, isRewatch: true, season: 3 },
      ],
      {
        episodesWatched: 8,
        type: 'tv',
      },
    )

    expect(progress).toEqual({
      episodesWatched: 8,
      lastEpisode: 2,
      lastSeason: 3,
      type: 'tv',
    })
  })

  it('increments episodesWatched once when the same non-rewatch pair is listed twice', () => {
    const progress = buildBatchTvProgressUpdate(
      [
        { episode: 1, season: 1 },
        { episode: 1, season: 1 },
      ],
      {
        episodesWatched: 4,
        type: 'tv',
      },
    )

    expect(progress).toEqual({
      episodesWatched: 5,
      lastEpisode: 1,
      lastSeason: 1,
      type: 'tv',
    })
  })

  it('counts a mixed rewatch and first-watch of the same pair as one new episode', () => {
    const progress = buildBatchTvProgressUpdate(
      [
        { episode: 1, isRewatch: true, season: 1 },
        { episode: 1, season: 1 },
      ],
      {
        episodesWatched: 4,
        type: 'tv',
      },
    )

    expect(progress.episodesWatched).toBe(5)
  })

  it('increments once per distinct non-rewatch episode', () => {
    const progress = buildBatchTvProgressUpdate(
      [
        { episode: 1, season: 1 },
        { episode: 2, season: 1 },
      ],
      {
        episodesWatched: 4,
        type: 'tv',
      },
    )

    expect(progress.episodesWatched).toBe(6)
  })

  it('appends a season when first-watch keys cover episodes 1 through its stored length', () => {
    const progress = buildBatchTvProgressUpdate(
      [{ episode: 2, season: 1 }],
      { episodesWatched: 1, seasonsCompleted: [3], type: 'tv' },
      {
        seasonEpisodeCounts: [{ episodeCount: 2, season: 1 }],
        watchedEpisodeKeys: watchedKeys([
          [1, 1],
          [1, 2],
        ]),
      },
    )

    expect(progress).toEqual({
      episodesWatched: 2,
      lastEpisode: 2,
      lastSeason: 1,
      seasonsCompleted: [3, 1],
      type: 'tv',
    })
  })

  it('leaves seasonsCompleted unchanged when the watched season has no stored length', () => {
    const progress = buildBatchTvProgressUpdate(
      [{ episode: 2, season: 2 }],
      { episodesWatched: 4, seasonsCompleted: [1], type: 'tv' },
      {
        seasonEpisodeCounts: [{ episodeCount: 0, season: 2 }],
        watchedEpisodeKeys: watchedKeys([
          [2, 1],
          [2, 2],
        ]),
      },
    )

    expect(progress.seasonsCompleted).toEqual([1])
  })

  it('does not drop a completed season when a rewatch leaves that season uncovered', () => {
    const progress = buildBatchTvProgressUpdate(
      [{ episode: 1, isRewatch: true, season: 1 }],
      { episodesWatched: 8, seasonsCompleted: [1, 2], type: 'tv' },
      {
        seasonEpisodeCounts: [{ episodeCount: 10, season: 1 }],
        watchedEpisodeKeys: watchedKeys([[1, 1]]),
      },
    )

    expect(progress).toEqual({
      episodesWatched: 8,
      lastEpisode: 1,
      lastSeason: 1,
      seasonsCompleted: [1, 2],
      type: 'tv',
    })
  })
})
