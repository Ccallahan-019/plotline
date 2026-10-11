import type { TmdbTitleWatchProviders, TmdbWatchProvider } from '@plotline/shared/tmdb'

import { describe, expect, it } from 'vitest'

import { mapTitleWatchOffers } from '../map-title-watch-offers'

function payload(results: TmdbTitleWatchProviders['results']): TmdbTitleWatchProviders {
  return { id: 550, results }
}

function provider(
  overrides: Partial<TmdbWatchProvider> & Pick<TmdbWatchProvider, 'provider_id' | 'provider_name'>,
): TmdbWatchProvider {
  return {
    logo_path: null,
    ...overrides,
  }
}

describe('mapTitleWatchOffers', () => {
  it('lists groups as Stream, Free, Ads, Rent, Buy and drops empty lists', () => {
    const mapped = mapTitleWatchOffers(
      payload({
        CA: {
          ads: [],
          buy: [provider({ provider_id: 5, provider_name: 'Apple TV' })],
          flatrate: [provider({ provider_id: 8, provider_name: 'Netflix' })],
          rent: [provider({ provider_id: 4, provider_name: 'Prime Video' })],
        },
        US: {
          ads: [provider({ provider_id: 3, provider_name: 'Tubi' })],
          buy: [provider({ provider_id: 5, provider_name: 'Apple TV' })],
          flatrate: [provider({ provider_id: 8, provider_name: 'Netflix' })],
          free: [provider({ provider_id: 2, provider_name: 'Pluto' })],
          link: 'https://www.themoviedb.org/movie/550/watch?locale=US',
          rent: [provider({ provider_id: 4, provider_name: 'Prime Video' })],
        },
      }),
    )

    expect(mapped.US?.groups.map((group) => group.label)).toEqual([
      'Stream',
      'Free',
      'Ads',
      'Rent',
      'Buy',
    ])
    expect(mapped.US?.link).toBe('https://www.themoviedb.org/movie/550/watch?locale=US')
    expect(mapped.CA?.groups.map((group) => group.label)).toEqual(['Stream', 'Rent', 'Buy'])
    expect(mapped.CA?.link).toBeNull()
  })

  it('sorts a group by display priority, then name', () => {
    const mapped = mapTitleWatchOffers(
      payload({
        US: {
          flatrate: [
            provider({ display_priority: 2, provider_id: 1, provider_name: 'Netflix' }),
            provider({ provider_id: 2, provider_name: 'Disney Plus' }),
            provider({ display_priority: 0, provider_id: 3, provider_name: 'Hulu' }),
            provider({ display_priority: 2, provider_id: 4, provider_name: 'Max' }),
          ],
        },
      }),
    )

    expect(mapped.US?.groups[0]?.offers.map((offer) => offer.name)).toEqual([
      'Hulu',
      'Max',
      'Netflix',
      'Disney Plus',
    ])
  })

  it('keeps the lower display priority when a provider is listed twice', () => {
    const mapped = mapTitleWatchOffers(
      payload({
        US: {
          flatrate: [
            provider({
              display_priority: 8,
              logo_path: '/first.jpg',
              provider_id: 8,
              provider_name: 'Netflix Later',
            }),
            provider({
              display_priority: 1,
              logo_path: '/second.jpg',
              provider_id: 8,
              provider_name: 'Netflix',
            }),
            provider({
              display_priority: 4,
              logo_path: '/keep.jpg',
              provider_id: 9,
              provider_name: 'Max',
            }),
            provider({
              display_priority: 4,
              logo_path: '/drop.jpg',
              provider_id: 9,
              provider_name: 'Max Duplicate',
            }),
          ],
        },
      }),
    )

    expect(mapped.US?.groups[0]?.offers).toEqual([
      { logoPath: '/second.jpg', name: 'Netflix', providerId: 8 },
      { logoPath: '/keep.jpg', name: 'Max', providerId: 9 },
    ])
  })

  it('keeps the same provider on both rent and buy', () => {
    const apple = provider({
      display_priority: 2,
      logo_path: '/apple.jpg',
      provider_id: 2,
      provider_name: 'Apple TV',
    })

    const mapped = mapTitleWatchOffers(
      payload({
        US: {
          buy: [apple],
          rent: [apple],
        },
      }),
    )

    expect(mapped.US?.groups).toEqual([
      {
        label: 'Rent',
        offers: [{ logoPath: '/apple.jpg', name: 'Apple TV', providerId: 2 }],
      },
      {
        label: 'Buy',
        offers: [{ logoPath: '/apple.jpg', name: 'Apple TV', providerId: 2 }],
      },
    ])
  })

  it('returns an empty group list when a region has no offers', () => {
    const mapped = mapTitleWatchOffers(
      payload({
        DE: {},
        FR: { link: 'https://www.themoviedb.org/movie/550/watch?locale=FR' },
      }),
    )

    expect(mapped.DE).toEqual({ groups: [], link: null })
    expect(mapped.FR).toEqual({
      groups: [],
      link: 'https://www.themoviedb.org/movie/550/watch?locale=FR',
    })
    expect(mapped.JP).toBeUndefined()
  })
})
