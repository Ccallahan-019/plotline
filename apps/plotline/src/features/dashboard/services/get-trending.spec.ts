import type { TmdbClient, TmdbSearchResponse } from '@plotline/shared/tmdb'

import { describe, expect, it, vi } from 'vitest'

import { getTrendingTitles } from './get-trending'

function trendingClient(overrides: Partial<TmdbClient>): TmdbClient {
  return {
    getMovieDetails: vi.fn(),
    getTrending: vi.fn(async (mediaType: 'movie' | 'tv') =>
      mediaType === 'movie'
        ? trendingPage([{ id: 1, title: 'Movie' }])
        : trendingPage([{ id: 2, name: 'Series' }]),
    ),
    getTvDetails: vi.fn(),
    ...overrides,
  } as unknown as TmdbClient
}

function trendingPage(results: TmdbSearchResponse['results']): TmdbSearchResponse {
  return { page: 1, results, total_pages: 1, total_results: results.length }
}

describe('getTrendingTitles', () => {
  it('fills movie runtime and series episode count from title details', async () => {
    const client = trendingClient({
      getMovieDetails: vi.fn().mockResolvedValue({ runtime: 124 }),
      getTvDetails: vi.fn().mockResolvedValue({ number_of_episodes: 8 }),
    })

    const trending = await getTrendingTitles(client)

    expect(trending.items).toEqual([
      expect.objectContaining({ mediaType: 'movie', runtime: 124, title: 'Movie' }),
      expect.objectContaining({ episodeCount: 8, mediaType: 'tv', title: 'Series' }),
    ])
  })

  it('skips a details call when the chart already includes the length', async () => {
    const getMovieDetails = vi.fn()
    const client = trendingClient({
      getMovieDetails,
      getTrending: vi.fn(async (mediaType: 'movie' | 'tv') =>
        mediaType === 'movie'
          ? trendingPage([{ id: 1, runtime: 90, title: 'Movie' }])
          : trendingPage([]),
      ),
    })

    const trending = await getTrendingTitles(client)

    expect(trending.items[0]).toMatchObject({ runtime: 90, title: 'Movie' })
    expect(getMovieDetails).not.toHaveBeenCalled()
  })

  it('keeps a title when its length lookup fails', async () => {
    const error = new Error('TMDB request failed')
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const client = trendingClient({
      getMovieDetails: vi.fn().mockRejectedValue(error),
      getTrending: vi.fn(async (mediaType: 'movie' | 'tv') =>
        mediaType === 'movie' ? trendingPage([{ id: 1, title: 'Movie' }]) : trendingPage([]),
      ),
    })

    const trending = await getTrendingTitles(client)

    expect(trending.items[0]).toMatchObject({ runtime: null, title: 'Movie' })
    expect(consoleError).toHaveBeenCalledWith(error)

    consoleError.mockRestore()
  })
})
