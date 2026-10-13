import { afterEach, describe, expect, it, vi } from 'vitest'

import { TmdbClient } from './client'

describe('TmdbClient.getTrending', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('requests the weekly trending list for the media type', async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            page: 1,
            results: [{ id: 550, title: 'Fight Club' }],
            total_pages: 1,
            total_results: 1,
          }),
          { status: 200 },
        ),
    )
    vi.stubGlobal('fetch', fetchMock)

    const page = await new TmdbClient({ accessToken: 'token' }).getTrending('tv')

    expect(page.results[0]?.title).toBe('Fight Club')
    const url = String(fetchMock.mock.calls[0]?.[0])
    expect(url).toBe('https://api.themoviedb.org/3/trending/tv/week')
    const init = fetchMock.mock.calls[0]?.[1] as RequestInit
    expect(new Headers(init.headers).get('Authorization')).toBe('Bearer token')
  })
})
