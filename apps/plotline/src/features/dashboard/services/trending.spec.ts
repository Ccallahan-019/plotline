import { describe, expect, it } from 'vitest'

import { mixTrendingTitles, trendingTitleDescription } from './trending'

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
        episodeCount: null,
        mediaType: 'movie',
        posterPath: null,
        releaseYear: null,
        runtime: null,
        title: 'Movie',
        tmdbId: 2,
        voteAverage: null,
      },
      {
        backdropPath: null,
        episodeCount: null,
        mediaType: 'tv',
        posterPath: null,
        releaseYear: null,
        runtime: null,
        title: 'Series',
        tmdbId: 4,
        voteAverage: null,
      },
      {
        backdropPath: null,
        episodeCount: null,
        mediaType: 'movie',
        posterPath: null,
        releaseYear: null,
        runtime: null,
        title: 'Another',
        tmdbId: 3,
        voteAverage: null,
      },
    ])
  })

  it('keeps a backdrop and drops a blank one', () => {
    expect(
      mixTrendingTitles(
        [{ backdrop_path: '  /still.jpg  ', id: 1, title: 'Movie' }],
        [{ backdrop_path: '   ', id: 2, name: 'Series' }],
      ),
    ).toEqual([
      {
        backdropPath: '/still.jpg',
        episodeCount: null,
        mediaType: 'movie',
        posterPath: null,
        releaseYear: null,
        runtime: null,
        title: 'Movie',
        tmdbId: 1,
        voteAverage: null,
      },
      {
        backdropPath: null,
        episodeCount: null,
        mediaType: 'tv',
        posterPath: null,
        releaseYear: null,
        runtime: null,
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
        episodeCount: null,
        mediaType: 'movie',
        posterPath: null,
        releaseYear: '2024',
        runtime: null,
        title: 'Movie',
        tmdbId: 1,
        voteAverage: 8.4,
      },
      {
        backdropPath: null,
        episodeCount: null,
        mediaType: 'tv',
        posterPath: null,
        releaseYear: null,
        runtime: null,
        title: 'Series',
        tmdbId: 2,
        voteAverage: null,
      },
    ])
  })

  it('keeps a movie runtime and a series episode count, and drops invalid lengths', () => {
    expect(
      mixTrendingTitles(
        [
          { id: 1, runtime: 124, title: 'Movie' },
          { id: 3, runtime: 0, title: 'Short' },
        ],
        [
          { id: 2, name: 'Series', number_of_episodes: 10 },
          { id: 4, name: 'Empty', number_of_episodes: Number.NaN },
        ],
      ),
    ).toEqual([
      {
        backdropPath: null,
        episodeCount: null,
        mediaType: 'movie',
        posterPath: null,
        releaseYear: null,
        runtime: 124,
        title: 'Movie',
        tmdbId: 1,
        voteAverage: null,
      },
      {
        backdropPath: null,
        episodeCount: 10,
        mediaType: 'tv',
        posterPath: null,
        releaseYear: null,
        runtime: null,
        title: 'Series',
        tmdbId: 2,
        voteAverage: null,
      },
      {
        backdropPath: null,
        episodeCount: null,
        mediaType: 'movie',
        posterPath: null,
        releaseYear: null,
        runtime: null,
        title: 'Short',
        tmdbId: 3,
        voteAverage: null,
      },
      {
        backdropPath: null,
        episodeCount: null,
        mediaType: 'tv',
        posterPath: null,
        releaseYear: null,
        runtime: null,
        title: 'Empty',
        tmdbId: 4,
        voteAverage: null,
      },
    ])
  })
})

describe('trendingTitleDescription', () => {
  it('joins a film with its runtime', () => {
    expect(trendingTitleDescription({ episodeCount: null, mediaType: 'movie', runtime: 124 })).toBe(
      'Film · 2h 4m',
    )
  })

  it('joins a series with its episode count', () => {
    expect(trendingTitleDescription({ episodeCount: 12, mediaType: 'tv', runtime: null })).toBe(
      'Series · 12 episodes',
    )
  })

  it('leaves the type when the length is missing', () => {
    expect(
      trendingTitleDescription({ episodeCount: null, mediaType: 'movie', runtime: null }),
    ).toBe('Film')
    expect(trendingTitleDescription({ episodeCount: null, mediaType: 'tv', runtime: 40 })).toBe(
      'Series',
    )
  })
})
