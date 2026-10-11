import { TmdbError } from '@plotline/shared/tmdb'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { getMovieRecommendations, getMovieSimilar, getTvRecommendations, getTvSimilar } =
  vi.hoisted(() => ({
    getMovieRecommendations: vi.fn(),
    getMovieSimilar: vi.fn(),
    getTvRecommendations: vi.fn(),
    getTvSimilar: vi.fn(),
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
    getMovieRecommendations,
    getMovieSimilar,
    getTvRecommendations,
    getTvSimilar,
  }),
}))

import { GET } from '../route'

const EMPTY_PAGE = { page: 1, results: [], total_pages: 0, total_results: 0 }

function call(mediaType: string, tmdbId: string, query = '') {
  return GET(new Request(`http://localhost/api/tmdb/${mediaType}/${tmdbId}/similar${query}`), {
    params: Promise.resolve({ mediaType, tmdbId }),
  })
}

describe('GET /api/tmdb/[mediaType]/[tmdbId]/similar', () => {
  beforeEach(() => {
    vi.stubEnv('TMDB_READ_ACCESS_TOKEN', 'token')
    getMovieRecommendations.mockReset()
    getMovieSimilar.mockReset()
    getTvRecommendations.mockReset()
    getTvSimilar.mockReset()
  })

  it('returns movie recommendations and stamps media_type', async () => {
    getMovieRecommendations.mockResolvedValue({
      page: 1,
      results: [{ id: 680, title: 'Pulp Fiction' }],
      total_pages: 2,
      total_results: 20,
    })

    const response = await call('movie', '550', '?page=9')

    expect(response.status).toBe(200)
    expect(getMovieRecommendations).toHaveBeenCalledWith(550)
    expect(getMovieSimilar).not.toHaveBeenCalled()
    expect(getTvRecommendations).not.toHaveBeenCalled()
    await expect(response.json()).resolves.toEqual({
      page: 1,
      results: [{ id: 680, media_type: 'movie', title: 'Pulp Fiction' }],
      total_pages: 2,
      total_results: 20,
    })
  })

  it('routes tv titles to the tv recommendations endpoint', async () => {
    getTvRecommendations.mockResolvedValue({
      page: 1,
      results: [{ id: 1396, name: 'Breaking Bad' }],
      total_pages: 1,
      total_results: 1,
    })

    const response = await call('tv', '95396')

    expect(response.status).toBe(200)
    expect(getTvRecommendations).toHaveBeenCalledWith(95396)
    expect(getTvSimilar).not.toHaveBeenCalled()
    expect(getMovieRecommendations).not.toHaveBeenCalled()
    await expect(response.json()).resolves.toEqual({
      page: 1,
      results: [{ id: 1396, media_type: 'tv', name: 'Breaking Bad' }],
      total_pages: 1,
      total_results: 1,
    })
  })

  it('falls back to similar titles only when recommendations are empty', async () => {
    getMovieRecommendations.mockResolvedValue(EMPTY_PAGE)
    getMovieSimilar.mockResolvedValue({
      page: 1,
      results: [{ id: 13, title: 'Forrest Gump' }],
      total_pages: 1,
      total_results: 1,
    })

    const response = await call('movie', '550')

    expect(getMovieRecommendations).toHaveBeenCalledWith(550)
    expect(getMovieSimilar).toHaveBeenCalledWith(550)
    await expect(response.json()).resolves.toEqual({
      page: 1,
      results: [{ id: 13, media_type: 'movie', title: 'Forrest Gump' }],
      total_pages: 1,
      total_results: 1,
    })
  })

  it('falls back to tv similar titles when tv recommendations are empty', async () => {
    getTvRecommendations.mockResolvedValue(EMPTY_PAGE)
    getTvSimilar.mockResolvedValue({
      page: 1,
      results: [{ id: 1399, name: 'Game of Thrones' }],
      total_pages: 1,
      total_results: 1,
    })

    const response = await call('tv', '1396')

    expect(getTvRecommendations).toHaveBeenCalledWith(1396)
    expect(getTvSimilar).toHaveBeenCalledWith(1396)
    expect(getMovieSimilar).not.toHaveBeenCalled()
    await expect(response.json()).resolves.toEqual({
      page: 1,
      results: [{ id: 1399, media_type: 'tv', name: 'Game of Thrones' }],
      total_pages: 1,
      total_results: 1,
    })
  })

  it('rejects an invalid title before calling TMDB', async () => {
    expect((await call('book', '1')).status).toBe(400)
    expect((await call('movie', '0')).status).toBe(400)
    expect(getMovieRecommendations).not.toHaveBeenCalled()
    expect(getMovieSimilar).not.toHaveBeenCalled()
    expect(getTvRecommendations).not.toHaveBeenCalled()
    expect(getTvSimilar).not.toHaveBeenCalled()
  })

  it('answers 404 for a missing title and does not fall back after a recommendations error', async () => {
    getMovieRecommendations.mockRejectedValueOnce(
      new TmdbError('Not Found', 404, '/movie/1/recommendations'),
    )

    expect((await call('movie', '1')).status).toBe(404)
    expect(getMovieSimilar).not.toHaveBeenCalled()

    getMovieRecommendations.mockResolvedValueOnce(EMPTY_PAGE)
    getMovieSimilar.mockRejectedValueOnce(new TmdbError('Not Found', 404, '/movie/1/similar'))

    expect((await call('movie', '1')).status).toBe(404)
  })

  it.each([401, 403, 422, 429, 500])('reports upstream %i as 502', async (status) => {
    getMovieRecommendations.mockRejectedValue(
      new TmdbError('failed', status, '/movie/1/recommendations'),
    )

    expect((await call('movie', '1')).status).toBe(502)
    expect(getMovieSimilar).not.toHaveBeenCalled()
  })

  it('reports a similar-endpoint failure as 502', async () => {
    getTvRecommendations.mockResolvedValue(EMPTY_PAGE)
    getTvSimilar.mockRejectedValue(new TmdbError('failed', 500, '/tv/1/similar'))

    expect((await call('tv', '1')).status).toBe(502)
  })

  it('answers 503 when TMDB is not configured', async () => {
    vi.stubEnv('TMDB_READ_ACCESS_TOKEN', '')

    expect((await call('movie', '550')).status).toBe(503)
    expect(getMovieRecommendations).not.toHaveBeenCalled()
  })
})
