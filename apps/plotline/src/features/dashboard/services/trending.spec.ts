import { describe, expect, it } from 'vitest'

import { mixTrendingTitles } from './trending'

describe('mixTrendingTitles', () => {
  it('interleaves movies and series and skips blank titles', () => {
    const mixed = mixTrendingTitles(
      [
        { id: 1, title: ' ' },
        { id: 2, title: 'Movie' },
        { id: 3, title: 'Another' },
      ],
      [{ id: 4, name: 'Series' }],
      8,
    )

    expect(mixed).toEqual([
      {
        backdropPath: null,
        mediaType: 'movie',
        overview: null,
        posterPath: null,
        releaseYear: null,
        title: 'Movie',
        tmdbId: 2,
        voteAverage: null,
      },
      {
        backdropPath: null,
        mediaType: 'tv',
        overview: null,
        posterPath: null,
        releaseYear: null,
        title: 'Series',
        tmdbId: 4,
        voteAverage: null,
      },
      {
        backdropPath: null,
        mediaType: 'movie',
        overview: null,
        posterPath: null,
        releaseYear: null,
        title: 'Another',
        tmdbId: 3,
        voteAverage: null,
      },
    ])
  })

  it('keeps a synopsis and backdrop, and drops blank ones', () => {
    expect(
      mixTrendingTitles(
        [{ backdrop_path: '  /still.jpg  ', id: 1, overview: '  A heist.  ', title: 'Movie' }],
        [{ backdrop_path: '   ', id: 2, name: 'Series', overview: '   ' }],
      ),
    ).toEqual([
      {
        backdropPath: '/still.jpg',
        mediaType: 'movie',
        overview: 'A heist.',
        posterPath: null,
        releaseYear: null,
        title: 'Movie',
        tmdbId: 1,
        voteAverage: null,
      },
      {
        backdropPath: null,
        mediaType: 'tv',
        overview: null,
        posterPath: null,
        releaseYear: null,
        title: 'Series',
        tmdbId: 2,
        voteAverage: null,
      },
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

  it('keeps a release year and score, and drops missing ones', () => {
    expect(
      mixTrendingTitles(
        [{ id: 1, release_date: '2024-05-01', title: 'Movie', vote_average: 8.4 }],
        [{ first_air_date: 'not-a-date', id: 2, name: 'Series' }],
      ),
    ).toEqual([
      {
        backdropPath: null,
        mediaType: 'movie',
        overview: null,
        posterPath: null,
        releaseYear: '2024',
        title: 'Movie',
        tmdbId: 1,
        voteAverage: 8.4,
      },
      {
        backdropPath: null,
        mediaType: 'tv',
        overview: null,
        posterPath: null,
        releaseYear: null,
        title: 'Series',
        tmdbId: 2,
        voteAverage: null,
      },
    ])
  })
})
