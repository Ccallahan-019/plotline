import { describe, expect, it } from 'vitest'

import { parseLoggedEpisodes } from './parseLoggedEpisodes'

async function errorMessage(result: unknown): Promise<string | undefined> {
  if (!(result instanceof Response)) {
    return undefined
  }

  const body = (await result.json()) as { error?: string }

  return body.error
}

describe('parseLoggedEpisodes', () => {
  it('accepts integer season/episode values and per-episode isRewatch', () => {
    expect(
      parseLoggedEpisodes([
        { episode: 1, season: 0 },
        { episode: '2', isRewatch: true, season: 1 },
      ]),
    ).toEqual([
      { episode: 1, season: 0 },
      { episode: 2, isRewatch: true, season: 1 },
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

  it('prefers first-watch when a rewatch of the same pair is listed first', () => {
    expect(
      parseLoggedEpisodes([
        { episode: 1, isRewatch: true, season: 1 },
        { episode: 1, season: 1 },
      ]),
    ).toEqual([{ episode: 1, season: 1 }])
  })

  it('keeps first-watch when a rewatch of the same pair is listed later', () => {
    expect(
      parseLoggedEpisodes([
        { episode: 1, season: 1 },
        { episode: 1, isRewatch: true, season: 1 },
      ]),
    ).toEqual([{ episode: 1, season: 1 }])
  })

  it('keeps rewatch when every occurrence of the same pair is a rewatch', () => {
    expect(
      parseLoggedEpisodes([
        { episode: 1, isRewatch: true, season: 1 },
        { episode: 1, isRewatch: true, season: 1 },
      ]),
    ).toEqual([{ episode: 1, isRewatch: true, season: 1 }])
  })
})
