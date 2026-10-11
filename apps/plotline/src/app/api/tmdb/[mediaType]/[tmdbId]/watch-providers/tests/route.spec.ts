import { TmdbError } from '@plotline/shared/tmdb'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { getMovieTitleWatchProviders, getTvTitleWatchProviders } = vi.hoisted(() => ({
  getMovieTitleWatchProviders: vi.fn(),
  getTvTitleWatchProviders: vi.fn(),
}))

vi.mock('@/lib/api/handle-payload-error', () => ({
  handlePayloadError: vi.fn(() =>
    Response.json({ error: 'Internal server error' }, { status: 500 }),
  ),
}))

vi.mock('@/lib/api/require-clerk-user-id', () => ({
  requireClerkUserId: vi.fn(async () => 'user_1'),
}))

vi.mock('@plotline/shared/tmdb', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@plotline/shared/tmdb')>()),
  createTmdbClient: () => ({
    getMovieTitleWatchProviders,
    getTvTitleWatchProviders,
  }),
}))

import { GET } from '../route'

function call(mediaType: string, tmdbId: string) {
  return GET(new Request(`http://localhost/api/tmdb/${mediaType}/${tmdbId}/watch-providers`), {
    params: Promise.resolve({ mediaType, tmdbId }),
  })
}

describe('GET /api/tmdb/[mediaType]/[tmdbId]/watch-providers', () => {
  beforeEach(() => {
    vi.stubEnv('TMDB_READ_ACCESS_TOKEN', 'token')
    getMovieTitleWatchProviders.mockReset()
    getTvTitleWatchProviders.mockReset()
  })

  it('maps movie offers for every country', async () => {
    getMovieTitleWatchProviders.mockResolvedValue({
      id: 550,
      results: {
        FR: { link: 'https://www.themoviedb.org/movie/550/watch?locale=FR' },
        US: {
          flatrate: [
            {
              display_priority: 1,
              logo_path: '/netflix.jpg',
              provider_id: 8,
              provider_name: 'Netflix',
            },
          ],
          link: 'https://www.themoviedb.org/movie/550/watch?locale=US',
        },
      },
    })

    const response = await call('movie', '550')

    expect(response.status).toBe(200)
    expect(response.headers.get('Cache-Control')).toBe(
      'public, s-maxage=21600, stale-while-revalidate=86400',
    )
    expect(getMovieTitleWatchProviders).toHaveBeenCalledWith(550)
    expect(getTvTitleWatchProviders).not.toHaveBeenCalled()
    await expect(response.json()).resolves.toEqual({
      FR: {
        groups: [],
        link: 'https://www.themoviedb.org/movie/550/watch?locale=FR',
      },
      US: {
        groups: [
          {
            label: 'Stream',
            offers: [{ logoPath: '/netflix.jpg', name: 'Netflix', providerId: 8 }],
          },
        ],
        link: 'https://www.themoviedb.org/movie/550/watch?locale=US',
      },
    })
  })

  it('routes tv titles to the tv watch-providers endpoint', async () => {
    getTvTitleWatchProviders.mockResolvedValue({ id: 1396, results: {} })

    const response = await call('tv', '1396')

    expect(response.status).toBe(200)
    expect(getTvTitleWatchProviders).toHaveBeenCalledWith(1396)
    expect(getMovieTitleWatchProviders).not.toHaveBeenCalled()
    await expect(response.json()).resolves.toEqual({})
  })

  it('rejects an invalid title before calling TMDB', async () => {
    expect((await call('book', '1')).status).toBe(400)
    expect((await call('movie', '0')).status).toBe(400)
    expect(getMovieTitleWatchProviders).not.toHaveBeenCalled()
    expect(getTvTitleWatchProviders).not.toHaveBeenCalled()
  })

  it('answers 404 for a missing title', async () => {
    getMovieTitleWatchProviders.mockRejectedValueOnce(
      new TmdbError('Not Found', 404, '/movie/1/watch/providers'),
    )
    getTvTitleWatchProviders.mockRejectedValueOnce(
      new TmdbError('Not Found', 404, '/tv/1/watch/providers'),
    )

    expect((await call('movie', '1')).status).toBe(404)
    expect((await call('tv', '1')).status).toBe(404)
  })

  it.each([401, 403, 422, 429, 500])('reports upstream %i as 502', async (status) => {
    getMovieTitleWatchProviders.mockRejectedValue(
      new TmdbError('failed', status, '/movie/1/watch/providers'),
    )

    expect((await call('movie', '1')).status).toBe(502)
    expect(getTvTitleWatchProviders).not.toHaveBeenCalled()
  })

  it('answers 503 when TMDB is not configured', async () => {
    vi.stubEnv('TMDB_READ_ACCESS_TOKEN', '')

    expect((await call('movie', '550')).status).toBe(503)
    expect(getMovieTitleWatchProviders).not.toHaveBeenCalled()
  })
})
