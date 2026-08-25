import { describe, expect, it } from 'vitest'

import { buildWatchEventLibraryItemProgressUpdate } from '../buildWatchEventLibraryItemProgressUpdate'

describe('buildWatchEventLibraryItemProgressUpdate', () => {
  it('sets movie progress.watched on a first-watch completed event without incrementing rewatchCount', () => {
    expect(
      buildWatchEventLibraryItemProgressUpdate(
        { eventType: 'completed', isRewatch: false },
        { progress: { type: 'movie', watched: false }, rewatchCount: 0 },
      ),
    ).toEqual({
      progress: { type: 'movie', watched: true },
    })
  })

  it('sets movie progress.watched and increments rewatchCount on a rewatch', () => {
    expect(
      buildWatchEventLibraryItemProgressUpdate(
        { eventType: 'rewatched', isRewatch: true },
        { progress: { type: 'movie', watched: true }, rewatchCount: 2 },
      ),
    ).toEqual({
      progress: { type: 'movie', watched: true },
      rewatchCount: 3,
    })
  })

  it('treats eventType rewatched as a rewatch even when isRewatch is omitted', () => {
    expect(
      buildWatchEventLibraryItemProgressUpdate(
        { eventType: 'rewatched' },
        { progress: { type: 'movie', watched: false }, rewatchCount: null },
      ),
    ).toEqual({
      progress: { type: 'movie', watched: true },
      rewatchCount: 1,
    })
  })

  it('does not mark a TV title watched or increment rewatchCount for a completed event', () => {
    expect(
      buildWatchEventLibraryItemProgressUpdate(
        { eventType: 'completed' },
        { progress: { episodesWatched: 8, type: 'tv' }, rewatchCount: 0 },
      ),
    ).toEqual({})
  })

  it('still rebuilds TV progress for a progress event', () => {
    expect(
      buildWatchEventLibraryItemProgressUpdate(
        {
          eventType: 'progress',
          isRewatch: false,
          tvContext: { episode: 3, season: 1 },
        },
        { progress: { episodesWatched: 4, type: 'tv' }, rewatchCount: 0 },
      ),
    ).toEqual({
      progress: {
        episodesWatched: 5,
        lastEpisode: 3,
        lastSeason: 1,
        type: 'tv',
      },
    })
  })
})
