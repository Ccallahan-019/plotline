import { beforeEach, describe, expect, it, vi } from 'vitest'

const { searchKeywords } = vi.hoisted(() => ({
  searchKeywords: vi.fn(),
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
  createTmdbClient: () => ({ searchKeywords }),
}))

import { GET } from '../route'

const FIRST_PAGE = {
  page: 1,
  results: [{ id: 1721, name: 'fight' }],
  total_pages: 4,
  total_results: 70,
}

function call(query = '') {
  const suffix = query ? `?${query}` : ''

  return GET(new Request(`http://localhost/api/tmdb/keywords${suffix}`))
}

describe('GET /api/tmdb/keywords', () => {
  beforeEach(() => {
    vi.stubEnv('TMDB_READ_ACCESS_TOKEN', 'token')
    searchKeywords.mockReset()
  })

  it('returns the first keyword page for a trimmed query', async () => {
    searchKeywords.mockResolvedValue(FIRST_PAGE)

    const response = await call('q=%20fight%20')

    expect(response.status).toBe(200)
    expect(searchKeywords).toHaveBeenCalledWith('fight', 1)
    await expect(response.json()).resolves.toEqual(FIRST_PAGE)
  })

  it('rejects queries shorter than 2 characters before calling TMDB', async () => {
    expect((await call('q=f')).status).toBe(400)
    expect((await call('q=%20%20')).status).toBe(400)
    expect((await call()).status).toBe(400)
    expect(searchKeywords).not.toHaveBeenCalled()
  })

  it('answers 503 when TMDB is not configured', async () => {
    vi.stubEnv('TMDB_READ_ACCESS_TOKEN', '')

    expect((await call('q=fight')).status).toBe(503)
    expect(searchKeywords).not.toHaveBeenCalled()
  })
})
