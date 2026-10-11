import { describe, expect, it } from 'vitest'

import { tmdbTitleWatchProvidersSchema } from './schemas'

describe('tmdb title watch providers schema', () => {
  it('keeps a country link and its offer lists', () => {
    const parsed = tmdbTitleWatchProvidersSchema.parse({
      id: 550,
      results: {
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
          rent: [
            {
              logo_path: null,
              provider_id: 2,
              provider_name: 'Apple TV',
            },
          ],
        },
      },
    })

    expect(parsed).toEqual({
      id: 550,
      results: {
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
          rent: [
            {
              logo_path: null,
              provider_id: 2,
              provider_name: 'Apple TV',
            },
          ],
        },
      },
    })
  })

  it('allows a country that omits an optional offer list', () => {
    const parsed = tmdbTitleWatchProvidersSchema.parse({
      id: 550,
      results: {
        FR: {
          link: 'https://www.themoviedb.org/movie/550/watch?locale=FR',
        },
      },
    })

    expect(parsed.results.FR).toEqual({
      link: 'https://www.themoviedb.org/movie/550/watch?locale=FR',
    })
    expect(parsed.results.FR?.flatrate).toBeUndefined()
    expect(parsed.results.FR?.free).toBeUndefined()
    expect(parsed.results.FR?.ads).toBeUndefined()
    expect(parsed.results.FR?.rent).toBeUndefined()
    expect(parsed.results.FR?.buy).toBeUndefined()
  })

  it('accepts a null country link', () => {
    const parsed = tmdbTitleWatchProvidersSchema.parse({
      id: 550,
      results: { FR: { link: null } },
    })

    expect(parsed.results.FR?.link).toBeNull()
  })

  it('strips an unknown key instead of failing the request', () => {
    const parsed = tmdbTitleWatchProvidersSchema.parse({
      id: 550,
      results: {
        US: {
          flatrate: [
            {
              display_priority: 0,
              extra_provider_field: true,
              logo_path: '/netflix.jpg',
              provider_id: 8,
              provider_name: 'Netflix',
            },
          ],
          unexpected_monetization: [{ provider_id: 1, provider_name: 'Nope' }],
        },
      },
      unexpected_root: true,
    })

    expect(parsed).toEqual({
      id: 550,
      results: {
        US: {
          flatrate: [
            {
              display_priority: 0,
              logo_path: '/netflix.jpg',
              provider_id: 8,
              provider_name: 'Netflix',
            },
          ],
        },
      },
    })
  })
})
