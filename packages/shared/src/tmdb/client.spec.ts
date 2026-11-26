import { afterEach, describe, expect, it, vi } from 'vitest'

import { TmdbClient } from './client'

describe('TmdbClient title videos', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('requests English and untagged videos with movie details', async () => {
    const fetchMock = stubTitleFetch({ id: 1, title: 'Perfect Days' })
    const client = new TmdbClient({ accessToken: 'token' })

    await client.getMovieTitleDetails(1)

    const url = requestUrl(fetchMock)
    expect(url.pathname).toBe('/3/movie/1')
    expect(url.searchParams.get('append_to_response')).toBe(
      'credits,external_ids,release_dates,videos',
    )
    expect(url.searchParams.get('include_video_language')).toBe('en,null')
  })

  it('adds a caller language ahead of English for series details', async () => {
    const fetchMock = stubTitleFetch({ id: 2, name: 'Severance' })
    const client = new TmdbClient({ accessToken: 'token' })

    await client.getTvTitleDetails(2, ['fr'])

    const url = requestUrl(fetchMock)
    expect(url.pathname).toBe('/3/tv/2')
    expect(url.searchParams.get('append_to_response')).toBe(
      'aggregate_credits,content_ratings,external_ids,videos',
    )
    expect(url.searchParams.get('include_video_language')).toBe('fr,en,null')
  })
})

function requestUrl(fetchMock: ReturnType<typeof vi.fn>): URL {
  const input: unknown = fetchMock.mock.calls[0]?.[0]

  if (input instanceof URL) {
    return input
  }

  if (typeof input === 'string') {
    return new URL(input)
  }

  throw new Error('Expected fetch to be called with a URL')
}

function stubTitleFetch(body: unknown) {
  const fetchMock = vi.fn(async () => Response.json(body))
  vi.stubGlobal('fetch', fetchMock)

  return fetchMock
}
