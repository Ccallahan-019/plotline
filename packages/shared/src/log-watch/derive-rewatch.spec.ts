import { describe, expect, it } from 'vitest'

import {
  collectWatchedEpisodeKeys,
  deriveRewatch,
  isMovieRewatch,
  isTvEpisodeRewatch,
  toWatchedEpisodeKey,
  toWatchedEpisodeKeyFromTvContext,
  toWatchedEpisodeKeySet,
} from './derive-rewatch'

describe('deriveRewatch', () => {
  describe('movie', () => {
    it('classifies a first watch when the title is not watched or completed', () => {
      expect(
        deriveRewatch({
          libraryItem: { progress: { watched: false }, status: 'watching' },
          mediaType: 'movie',
        }),
      ).toEqual({ eventType: 'completed', isRewatch: false })
    })

    it('classifies a rewatch when progress.watched is true', () => {
      expect(
        deriveRewatch({
          libraryItem: { progress: { watched: true }, status: 'watching' },
          mediaType: 'movie',
        }),
      ).toEqual({ eventType: 'rewatched', isRewatch: true })
    })

    it('classifies a rewatch when status is completed even if watched is unset', () => {
      expect(
        deriveRewatch({
          libraryItem: { status: 'completed' },
          mediaType: 'movie',
        }),
      ).toEqual({ eventType: 'rewatched', isRewatch: true })
    })
  })

  describe('tv', () => {
    it('classifies a first watch when the pair is new and the show is not completed', () => {
      expect(
        deriveRewatch({
          episode: 1,
          libraryItemStatus: 'watching',
          mediaType: 'tv',
          season: 1,
          watchedEpisodeKeys: new Set(),
        }),
      ).toEqual({ eventType: 'progress', isRewatch: false })
    })

    it('classifies a rewatch when a prior event already covered the pair', () => {
      expect(
        deriveRewatch({
          episode: 3,
          libraryItemStatus: 'watching',
          mediaType: 'tv',
          season: 2,
          watchedEpisodeKeys: new Set([toWatchedEpisodeKey(2, 3)]),
        }),
      ).toEqual({ eventType: 'rewatched', isRewatch: true })
    })

    it('classifies a rewatch when the show is completed even if the pair is not in the key set', () => {
      expect(
        deriveRewatch({
          episode: 1,
          libraryItemStatus: 'completed',
          mediaType: 'tv',
          season: 1,
          watchedEpisodeKeys: new Set(),
        }),
      ).toEqual({ eventType: 'rewatched', isRewatch: true })
    })

    it('classifies a later batch occurrence as a rewatch after the first-watch key is recorded', () => {
      const watchedEpisodeKeys = new Set<string>()
      const episode = { episode: 4, season: 1 }

      const first = deriveRewatch({
        ...episode,
        libraryItemStatus: 'watching',
        mediaType: 'tv',
        watchedEpisodeKeys,
      })

      watchedEpisodeKeys.add(toWatchedEpisodeKey(episode.season, episode.episode))

      const second = deriveRewatch({
        ...episode,
        libraryItemStatus: 'watching',
        mediaType: 'tv',
        watchedEpisodeKeys,
      })

      expect(first).toEqual({ eventType: 'progress', isRewatch: false })
      expect(second).toEqual({ eventType: 'rewatched', isRewatch: true })
    })

    it('does not treat lastSeason/lastEpisode as a watermark', () => {
      const libraryItemWithCursor = {
        progress: { lastEpisode: 2, lastSeason: 1, watched: false },
        status: 'watching' as const,
      }

      expect(
        isTvEpisodeRewatch({
          episode: 2,
          libraryItemStatus: libraryItemWithCursor.status,
          season: 1,
          watchedEpisodeKeys: new Set(),
        }),
      ).toBe(false)

      expect(isMovieRewatch(libraryItemWithCursor)).toBe(false)
    })
  })
})

describe('collectWatchedEpisodeKeys', () => {
  it('collects unique keys from events with tvContext and ignores missing context', () => {
    expect(
      collectWatchedEpisodeKeys([
        { tvContext: { episode: 1, season: 1 } },
        {},
        { tvContext: null },
        { tvContext: { episode: 2, season: 1 } },
        { tvContext: { episode: 1, season: 1 } },
        { tvContext: { season: 2 } },
        { tvContext: { episode: 1 } },
      ]),
    ).toEqual(new Set(['1:1', '1:2']))
  })
})

describe('toWatchedEpisodeKeyFromTvContext', () => {
  it('returns null when tvContext is missing or incomplete', () => {
    expect(toWatchedEpisodeKeyFromTvContext(undefined)).toBeNull()
    expect(toWatchedEpisodeKeyFromTvContext(null)).toBeNull()
    expect(toWatchedEpisodeKeyFromTvContext({})).toBeNull()
    expect(toWatchedEpisodeKeyFromTvContext({ episode: 1, season: 0 })).toBe('0:1')
  })
})

describe('toWatchedEpisodeKeySet', () => {
  it('maps season/episode pairs onto identity keys', () => {
    expect(
      toWatchedEpisodeKeySet([
        { episode: 1, season: 1 },
        { episode: 2, season: 1 },
      ]),
    ).toEqual(new Set(['1:1', '1:2']))
  })
})
