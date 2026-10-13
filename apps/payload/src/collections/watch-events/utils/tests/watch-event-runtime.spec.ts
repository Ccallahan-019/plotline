import { describe, expect, it, vi } from 'vitest'

import {
  loadTvEpisodeRuntimes,
  positiveRuntimeMinutes,
  runtimeForEpisode,
} from '../watch-event-runtime'

describe('positiveRuntimeMinutes', () => {
  it('keeps a positive length', () => {
    expect(positiveRuntimeMinutes(48)).toBe(48)
  })

  it('drops missing, zero, and non-finite lengths', () => {
    expect(positiveRuntimeMinutes(null)).toBeUndefined()
    expect(positiveRuntimeMinutes(undefined)).toBeUndefined()
    expect(positiveRuntimeMinutes(0)).toBeUndefined()
    expect(positiveRuntimeMinutes(-5)).toBeUndefined()
    expect(positiveRuntimeMinutes(Number.NaN)).toBeUndefined()
  })
})

describe('loadTvEpisodeRuntimes', () => {
  it('loads each season once and keeps positive episode lengths', async () => {
    const fetchSeason = vi.fn(async (season: number) => ({
      episodes: [
        { episode_number: 1, name: null, runtime: season === 1 ? 42 : 55 },
        { episode_number: 2, name: null, runtime: 0 },
        { episode_number: 3, name: null, runtime: null },
      ],
      season_number: season,
    }))

    const runtimes = await loadTvEpisodeRuntimes(
      [
        { episode: 1, season: 1 },
        { episode: 2, season: 1 },
        { episode: 1, season: 2 },
      ],
      fetchSeason,
    )

    expect(fetchSeason).toHaveBeenCalledTimes(2)
    expect(fetchSeason).toHaveBeenNthCalledWith(1, 1)
    expect(fetchSeason).toHaveBeenNthCalledWith(2, 2)
    expect(runtimes.get('1:1')).toBe(42)
    expect(runtimes.get('2:1')).toBe(55)
    expect(runtimes.has('1:2')).toBe(false)
    expect(runtimes.has('1:3')).toBe(false)
    expect(runtimeForEpisode(runtimes, { episode: 1, season: 1 })).toBe(42)
    expect(runtimeForEpisode(runtimes, { episode: 9, season: 1 })).toBeUndefined()
  })

  it('skips a season that fails to load and keeps the others', async () => {
    const fetchSeason = vi.fn(async (season: number) => {
      if (season === 2) {
        throw new Error('tmdb down')
      }

      return {
        episodes: [{ episode_number: 4, name: null, runtime: 47 }],
        season_number: season,
      }
    })

    const runtimes = await loadTvEpisodeRuntimes(
      [
        { episode: 4, season: 1 },
        { episode: 1, season: 2 },
      ],
      fetchSeason,
    )

    expect(runtimes.get('1:4')).toBe(47)
    expect(runtimes.has('2:1')).toBe(false)
  })
})
