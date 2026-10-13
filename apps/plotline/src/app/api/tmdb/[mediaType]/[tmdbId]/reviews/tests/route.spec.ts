import { TmdbError } from '@plotline/shared/tmdb'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { getMovieReviews, getTvReviews } = vi.hoisted(() => ({
  getMovieReviews: vi.fn(),
  getTvReviews: vi.fn(),
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
  createTmdbClient: () => ({ getMovieReviews, getTvReviews }),
}))

import { GET } from '../route'

const EMPTY_PAGE = { page: 1, results: [], total_pages: 1, total_results: 0 }

function call(mediaType: string, tmdbId: string, query = '') {
  return GET(new Request(`http://localhost/api/tmdb/${mediaType}/${tmdbId}/reviews${query}`), {
    params: Promise.resolve({ mediaType, tmdbId }),
  })
}

describe('GET /api/tmdb/[mediaType]/[tmdbId]/reviews', () => {
  beforeEach(() => {
    vi.stubEnv('TMDB_READ_ACCESS_TOKEN', 'token')
    getMovieReviews.mockReset()
    getTvReviews.mockReset()
  })

  it('maps a TMDB page and defaults to page 1', async () => {
    getMovieReviews.mockResolvedValue(EMPTY_PAGE)

    const response = await call('movie', '550')

    expect(response.status).toBe(200)
    expect(getMovieReviews).toHaveBeenCalledWith(550, 1)
    await expect(response.json()).resolves.toEqual({
      page: 1,
      reviews: [],
      totalPages: 1,
      totalResults: 0,
    })
  })

  it('routes tv titles to the tv endpoint with the requested page', async () => {
    getTvReviews.mockResolvedValue({ ...EMPTY_PAGE, page: 2 })

    await call('tv', '95396', '?page=2')

    expect(getTvReviews).toHaveBeenCalledWith(95396, 2)
  })

  it('rejects an invalid title or page before calling TMDB', async () => {
    expect((await call('book', '1')).status).toBe(400)
    expect((await call('movie', '550', '?page=0')).status).toBe(400)
    expect(getMovieReviews).not.toHaveBeenCalled()
  })

  it('answers 404 for a missing title and 400 for a page TMDB rejects', async () => {
    getMovieReviews.mockRejectedValueOnce(new TmdbError('Not Found', 404, '/movie/1/reviews'))
    getMovieReviews.mockRejectedValueOnce(new TmdbError('Unprocessable', 422, '/movie/1/reviews'))

    expect((await call('movie', '1')).status).toBe(404)
    expect((await call('movie', '1', '?page=900')).status).toBe(400)
  })

  it.each([401, 403, 429, 500])('reports upstream %i as 502', async (status) => {
    getMovieReviews.mockRejectedValue(new TmdbError('failed', status, '/movie/1/reviews'))

    expect((await call('movie', '1')).status).toBe(502)
  })
})
