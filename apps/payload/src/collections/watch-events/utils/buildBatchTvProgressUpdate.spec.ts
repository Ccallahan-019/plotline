import { describe, expect, it } from 'vitest'

import { buildBatchTvProgressUpdate } from './buildBatchTvProgressUpdate'

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
})
