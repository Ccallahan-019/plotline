import { describe, expect, it } from 'vitest'

import {
  MAX_LOGGED_EPISODES,
  parseLoggedEpisodes,
  parseLogWatchTvContext,
} from '../parseLoggedEpisodes'

async function errorMessage(result: unknown): Promise<string | undefined> {
  if (!(result instanceof Response)) {
    return undefined
  }

  const body = (await result.json()) as { error?: string }

  return body.error
}

describe('parseLoggedEpisodes', () => {
  it('accepts integer season/episode values including season 0 specials', () => {
    expect(
      parseLoggedEpisodes([
        { episode: 1, season: 0 },
        { episode: '2', season: 1 },
      ]),
    ).toEqual([
      { episode: 1, season: 0 },
      { episode: 2, season: 1 },
    ])
  })

  it('ignores client isRewatch flags and keeps unique season/episode pairs only', () => {
    expect(
      parseLoggedEpisodes([
        { episode: 1, isRewatch: true, season: 1 },
        { episode: 1, season: 1 },
        { episode: 2, isRewatch: false, season: 1 },
      ]),
    ).toEqual([
      { episode: 1, season: 1 },
      { episode: 2, season: 1 },
    ])
  })

  it('rejects an empty episodes array', async () => {
    const result = parseLoggedEpisodes([])

    expect(result).toBeInstanceOf(Response)
    expect(result).toHaveProperty('status', 400)
    expect(await errorMessage(result)).toBe('episodes must contain at least one entry')
  })

  it('rejects missing or fractional season/episode numbers', async () => {
    const result = parseLoggedEpisodes([{ episode: 1.5, season: 1 }])

    expect(result).toBeInstanceOf(Response)
    expect(result).toHaveProperty('status', 400)
    expect(await errorMessage(result)).toBe(
      'each episode must include valid season and episode numbers',
    )
  })

  it('deduplicates the same season/episode pair by keeping the first occurrence', () => {
    expect(
      parseLoggedEpisodes([
        { episode: 1, season: 1 },
        { episode: 1, season: 1 },
        { episode: 2, season: 1 },
      ]),
    ).toEqual([
      { episode: 1, season: 1 },
      { episode: 2, season: 1 },
    ])
  })
})

describe('parseLoggedEpisodes limits', () => {
  it('rejects batches above the episode cap', async () => {
    const episodes = Array.from({ length: MAX_LOGGED_EPISODES + 1 }, (_, index) => ({
      episode: index + 1,
      season: 1,
    }))

    expect(await errorMessage(parseLoggedEpisodes(episodes))).toBe(
      `episodes must contain at most ${MAX_LOGGED_EPISODES} entries`,
    )
  })
})

describe('parseLogWatchTvContext', () => {
  it('treats a missing or empty context as a series-level log', () => {
    expect(parseLogWatchTvContext(undefined)).toBeUndefined()
    expect(parseLogWatchTvContext({ episode: null, season: null })).toBeUndefined()
  })

  it('coerces numeric strings to integers', () => {
    expect(parseLogWatchTvContext({ episode: '3', season: '2' })).toEqual({ episode: 3, season: 2 })
  })

  it('rejects negative, fractional, or half-filled coordinates', async () => {
    const message = 'tvContext must include valid season and episode numbers'

    expect(await errorMessage(parseLogWatchTvContext({ episode: 1, season: -1 }))).toBe(message)
    expect(await errorMessage(parseLogWatchTvContext({ episode: 1.5, season: 1 }))).toBe(message)
    expect(await errorMessage(parseLogWatchTvContext({ season: 1 }))).toBe(message)
  })
})
