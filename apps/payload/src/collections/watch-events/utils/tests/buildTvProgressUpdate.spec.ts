import { toWatchedEpisodeKey } from '@plotline/shared/log-watch'
import { describe, expect, it } from 'vitest'

import { buildTvProgressUpdate } from '../buildTvProgressUpdate'

function watchedKeys(pairs: ReadonlyArray<readonly [number, number]>): Set<string> {
  return new Set(pairs.map(([season, episode]) => toWatchedEpisodeKey(season, episode)))
}

describe('buildTvProgressUpdate', () => {
  it('appends a season when first-watch keys cover episodes 1 through its stored length', () => {
    const progress = buildTvProgressUpdate(
      { episode: 2, season: 1 },
      { episodesWatched: 1, seasonsCompleted: [2], type: 'tv' },
      {
        isRewatch: false,
        seasonEpisodeCounts: [
          { episodeCount: 2, season: 1 },
          { episodeCount: 1, season: 0 },
        ],
        watchedEpisodeKeys: watchedKeys([
          [0, 1],
          [1, 1],
          [1, 2],
        ]),
      },
    )

    expect(progress).toEqual({
      episodesWatched: 2,
      lastEpisode: 2,
      lastSeason: 1,
      seasonsCompleted: [2, 1, 0],
      type: 'tv',
    })
  })

  it('leaves seasonsCompleted unchanged when the watched season has no stored length', () => {
    const progress = buildTvProgressUpdate(
      { episode: 2, season: 1 },
      { episodesWatched: 1, seasonsCompleted: [3], type: 'tv' },
      {
        isRewatch: false,
        seasonEpisodeCounts: [
          { episodeCount: 0, season: 1 },
          { episodeCount: 4, season: 2 },
        ],
        watchedEpisodeKeys: watchedKeys([
          [1, 1],
          [1, 2],
          [2, 1],
        ]),
      },
    )

    expect(progress.seasonsCompleted).toEqual([3])
    expect(progress.episodesWatched).toBe(2)
  })

  it('does not drop a completed season when a rewatch leaves that season uncovered', () => {
    const progress = buildTvProgressUpdate(
      { episode: 1, season: 1 },
      { episodesWatched: 8, seasonsCompleted: [1, 2], type: 'tv' },
      {
        isRewatch: true,
        seasonEpisodeCounts: [
          { episodeCount: 10, season: 1 },
          { episodeCount: 8, season: 2 },
        ],
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

  it('does not finish a season from the cursor when earlier episodes were skipped', () => {
    const progress = buildTvProgressUpdate(
      { episode: 3, season: 1 },
      { episodesWatched: 0, type: 'tv' },
      {
        isRewatch: false,
        seasonEpisodeCounts: [{ episodeCount: 3, season: 1 }],
        watchedEpisodeKeys: watchedKeys([[1, 3]]),
      },
    )

    expect(progress.seasonsCompleted).toBeUndefined()
    expect(progress).toEqual({
      episodesWatched: 1,
      lastEpisode: 3,
      lastSeason: 1,
      type: 'tv',
    })
  })

  it('appends a season whose keys are complete even when the rewatch cursor moved backward', () => {
    const progress = buildTvProgressUpdate(
      { episode: 1, season: 1 },
      { episodesWatched: 3, type: 'tv' },
      {
        isRewatch: true,
        seasonEpisodeCounts: [{ episodeCount: 3, season: 1 }],
        watchedEpisodeKeys: watchedKeys([
          [1, 1],
          [1, 2],
          [1, 3],
        ]),
      },
    )

    expect(progress).toEqual({
      episodesWatched: 3,
      lastEpisode: 1,
      lastSeason: 1,
      seasonsCompleted: [1],
      type: 'tv',
    })
  })

  it('uses the first positive length when the same season is listed twice', () => {
    const progress = buildTvProgressUpdate(
      { episode: 1, season: 1 },
      { episodesWatched: 0, type: 'tv' },
      {
        seasonEpisodeCounts: [
          { episodeCount: 3, season: 1 },
          { episodeCount: 1, season: 1 },
        ],
        watchedEpisodeKeys: watchedKeys([[1, 1]]),
      },
    )

    expect(progress.seasonsCompleted).toBeUndefined()
  })

  it('copies seasonsCompleted through when season lengths or watched keys are omitted', () => {
    expect(
      buildTvProgressUpdate(
        { episode: 1, season: 1 },
        { episodesWatched: 4, seasonsCompleted: [1], type: 'tv' },
        { isRewatch: false, watchedEpisodeKeys: watchedKeys([[1, 1]]) },
      ).seasonsCompleted,
    ).toEqual([1])

    expect(
      buildTvProgressUpdate(
        { episode: 1, season: 1 },
        { episodesWatched: 4, seasonsCompleted: [1], type: 'tv' },
      ).seasonsCompleted,
    ).toEqual([1])
  })
})
