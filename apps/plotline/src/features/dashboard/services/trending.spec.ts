import { describe, expect, it } from 'vitest'

import { mixTrendingTitles } from './trending'

describe('mixTrendingTitles', () => {
  it('interleaves movies and series and skips blank titles', () => {
    const mixed = mixTrendingTitles(
      [{ id: 1, title: ' ' }, { id: 2, title: 'Movie' }, { id: 3, title: 'Another' }],
      [{ id: 4, name: 'Series' }],
      8,
    )

    expect(mixed).toEqual([
      { mediaType: 'movie', posterPath: null, title: 'Movie', tmdbId: 2 },
      { mediaType: 'tv', posterPath: null, title: 'Series', tmdbId: 4 },
      { mediaType: 'movie', posterPath: null, title: 'Another', tmdbId: 3 },
    ])
  })

  it('stops at the requested limit', () => {
    expect(
      mixTrendingTitles(
        [
          { id: 1, title: 'One' },
          { id: 2, title: 'Two' },
        ],
        [
          { id: 3, name: 'Three' },
          { id: 4, name: 'Four' },
        ],
        3,
      ).map((item) => item.title),
    ).toEqual(['One', 'Three', 'Two'])
  })
})
