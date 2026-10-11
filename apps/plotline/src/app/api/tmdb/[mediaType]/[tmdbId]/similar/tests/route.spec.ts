import { TmdbError } from '@plotline/shared/tmdb'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { getRecommendations, getSimilar } = vi.hoisted(() => ({
  getRecommendations: vi.fn(),
  getSimilar: vi.fn(),
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
    getRecommendations,
    getSimilar,
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
    getRecommendations.mockReset()
    getSimilar.mockReset()
  })

  it('returns movie recommendations, stamps media_type and reports a single page', async () => {
    getRecommendations.mockResolvedValue({
      page: 1,
      results: [{ id: 680, title: 'Pulp Fiction' }],
      total_pages: 2,
      total_results: 20,
    })

    const response = await call('movie', '550', '?page=9')

    expect(response.status).toBe(200)
    expect(getRecommendations).toHaveBeenCalledWith('movie', 550)
    expect(getSimilar).not.toHaveBeenCalled()
    await expect(response.json()).resolves.toEqual({
      page: 1,
      results: [{ id: 680, media_type: 'movie', title: 'Pulp Fiction' }],
      total_pages: 1,
      total_results: 1,
    })
  })

  it('routes tv titles to the tv recommendations endpoint', async () => {
    getRecommendations.mockResolvedValue({
      page: 1,
      results: [{ id: 1396, name: 'Breaking Bad' }],
      total_pages: 1,
      total_results: 1,
    })

    const response = await call('tv', '95396')

    expect(response.status).toBe(200)
    expect(getRecommendations).toHaveBeenCalledWith('tv', 95396)
    expect(getSimilar).not.toHaveBeenCalled()
    await expect(response.json()).resolves.toEqual({
      page: 1,
      results: [{ id: 1396, media_type: 'tv', name: 'Breaking Bad' }],
      total_pages: 1,
      total_results: 1,
    })
  })

  it('falls back to similar titles only when recommendations are empty', async () => {
    getRecommendations.mockResolvedValue(EMPTY_PAGE)
    getSimilar.mockResolvedValue({
      page: 1,
      results: [{ id: 13, title: 'Forrest Gump' }],
      total_pages: 1,
      total_results: 1,
    })

    const response = await call('movie', '550')

    expect(getRecommendations).toHaveBeenCalledWith('movie', 550)
    expect(getSimilar).toHaveBeenCalledWith('movie', 550)
    await expect(response.json()).resolves.toEqual({
      page: 1,
      results: [{ id: 13, media_type: 'movie', title: 'Forrest Gump' }],
      total_pages: 1,
      total_results: 1,
    })
  })

  it('falls back to tv similar titles when tv recommendations are empty', async () => {
    getRecommendations.mockResolvedValue(EMPTY_PAGE)
    getSimilar.mockResolvedValue({
      page: 1,
      results: [{ id: 1399, name: 'Game of Thrones' }],
      total_pages: 1,
      total_results: 1,
    })

    const response = await call('tv', '1396')

    expect(getRecommendations).toHaveBeenCalledWith('tv', 1396)
    expect(getSimilar).toHaveBeenCalledWith('tv', 1396)
    await expect(response.json()).resolves.toEqual({
      page: 1,
      results: [{ id: 1399, media_type: 'tv', name: 'Game of Thrones' }],
      total_pages: 1,
      total_results: 1,
    })
  })

  it('reports an empty result set as zero pages', async () => {
    getRecommendations.mockResolvedValue(EMPTY_PAGE)
    getSimilar.mockResolvedValue({ ...EMPTY_PAGE, total_pages: 3, total_results: 60 })

    const response = await call('movie', '550')

    await expect(response.json()).resolves.toEqual(EMPTY_PAGE)
  })

  it('rejects an invalid title before calling TMDB', async () => {
    expect((await call('book', '1')).status).toBe(400)
    expect((await call('movie', '0')).status).toBe(400)
    expect(getRecommendations).not.toHaveBeenCalled()
    expect(getSimilar).not.toHaveBeenCalled()
  })

  it('answers 404 for a missing title and does not fall back after a recommendations error', async () => {
    getRecommendations.mockRejectedValueOnce(
      new TmdbError('Not Found', 404, '/movie/1/recommendations'),
    )

    expect((await call('movie', '1')).status).toBe(404)
    expect(getSimilar).not.toHaveBeenCalled()

    getRecommendations.mockResolvedValueOnce(EMPTY_PAGE)
    getSimilar.mockRejectedValueOnce(new TmdbError('Not Found', 404, '/movie/1/similar'))

    expect((await call('movie', '1')).status).toBe(404)
  })

  it.each([401, 403, 422, 429, 500])('reports upstream %i as 502', async (status) => {
    getRecommendations.mockRejectedValue(
      new TmdbError('failed', status, '/movie/1/recommendations'),
    )

    expect((await call('movie', '1')).status).toBe(502)
    expect(getSimilar).not.toHaveBeenCalled()
  })

  it('reports a similar-endpoint failure as 502', async () => {
    getRecommendations.mockResolvedValue(EMPTY_PAGE)
    getSimilar.mockRejectedValue(new TmdbError('failed', 500, '/tv/1/similar'))

    expect((await call('tv', '1')).status).toBe(502)
  })

  it('answers 503 when TMDB is not configured', async () => {
    vi.stubEnv('TMDB_READ_ACCESS_TOKEN', '')

    expect((await call('movie', '550')).status).toBe(503)
    expect(getRecommendations).not.toHaveBeenCalled()
  })
})
