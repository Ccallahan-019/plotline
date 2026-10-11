import { afterEach, describe, expect, it, vi } from 'vitest'

import { fetchTvEpisodeRuntimes } from '../fetch-tv-episode-runtimes'

describe('fetchTvEpisodeRuntimes', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('returns an empty map when the series has no TMDB id', async () => {
    vi.stubEnv('TMDB_READ_ACCESS_TOKEN', 'token')

    await expect(
      fetchTvEpisodeRuntimes(undefined, [{ episode: 1, season: 1 }]),
    ).resolves.toEqual(new Map())
    await expect(fetchTvEpisodeRuntimes(0, [{ episode: 1, season: 1 }])).resolves.toEqual(
      new Map(),
    )
  })

  it('returns an empty map when no episodes were logged', async () => {
    vi.stubEnv('TMDB_READ_ACCESS_TOKEN', 'token')

    await expect(fetchTvEpisodeRuntimes(1396, [])).resolves.toEqual(new Map())
  })

  it('returns an empty map when TMDB is not configured', async () => {
    vi.stubEnv('TMDB_READ_ACCESS_TOKEN', '   ')

    await expect(fetchTvEpisodeRuntimes(1396, [{ episode: 1, season: 1 }])).resolves.toEqual(
      new Map(),
    )
  })
})
