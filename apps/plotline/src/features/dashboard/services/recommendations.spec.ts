import { describe, expect, it } from 'vitest'

import {
  libraryMediaKeys,
  selectRecommendationPosters,
  selectRecommendationSeeds,
} from './recommendations'

describe('selectRecommendationSeeds', () => {
  it('keeps the two newest ratings of 7 or higher', () => {
    const selection = selectRecommendationSeeds({
      completed: [completed('Old', 1, '2026-10-01T00:00:00.000Z')],
      rated: [
        rated('Newest', 3, 9, '2026-03-01T00:00:00.000Z'),
        rated('Low', 4, 6, '2026-04-01T00:00:00.000Z'),
        rated('Older high', 5, 10, '2026-01-01T00:00:00.000Z'),
        rated('Middle', 6, 8, '2026-02-01T00:00:00.000Z'),
        rated('Newest again', 3, 7, '2026-01-15T00:00:00.000Z'),
      ],
    })

    expect(selection.reason).toBe('rated')
    expect(selection.seeds.map((seed) => [seed.title, seed.rating])).toEqual([
      ['Newest', 9],
      ['Middle', 8],
    ])
  })

  it('does not fill a single high rating with a completed title', () => {
    const selection = selectRecommendationSeeds({
      completed: [completed('Finished', 2, '2026-05-01T00:00:00.000Z')],
      rated: [rated('Only', 1, 8, '2026-04-01T00:00:00.000Z')],
    })

    expect(selection.seeds.map((seed) => seed.title)).toEqual(['Only'])
  })

  it('falls back to the two most recently completed titles', () => {
    const selection = selectRecommendationSeeds({
      completed: [
        completed('Older', 1, '2026-01-01T00:00:00.000Z'),
        completed('Newest', 2, '2026-03-01T00:00:00.000Z'),
        { ...completed('Fallback', 3, null), lastWatchedAt: '2026-02-01T00:00:00.000Z' },
      ],
      rated: [rated('Low', 9, 5, '2026-04-01T00:00:00.000Z')],
    })

    expect(selection.reason).toBe('completed')
    expect(selection.seeds.map((seed) => seed.title)).toEqual(['Newest', 'Fallback'])
    expect(selection.seeds.every((seed) => seed.rating == null)).toBe(true)
  })

  it('returns no seeds when nothing is rated highly or completed', () => {
    expect(selectRecommendationSeeds({ completed: [], rated: [] })).toEqual({
      reason: null,
      seeds: [],
    })
  })
})

describe('selectRecommendationPosters', () => {
  it('drops library titles and stops at four posters in seed order', () => {
    const posters = selectRecommendationPosters({
      libraryKeys: libraryMediaKeys([
        { media: { mediaType: 'movie', title: 'Owned', tmdbId: 680 } },
      ]),
      pages: [
        {
          mediaType: 'movie',
          results: [
            { id: 680, title: 'Owned' },
            { id: 13, title: 'First' },
            { id: 14, title: 'Second' },
            { id: 15, title: 'Third' },
            { id: 16, title: 'Fourth' },
          ],
        },
        {
          mediaType: 'tv',
          results: [{ id: 1396, name: 'Fifth' }],
        },
      ],
      seeds: [{ mediaType: 'movie', tmdbId: 550 }],
    })

    expect(posters).toEqual([
      { mediaType: 'movie', posterPath: null, title: 'First', tmdbId: 13 },
      { mediaType: 'movie', posterPath: null, title: 'Second', tmdbId: 14 },
      { mediaType: 'movie', posterPath: null, title: 'Third', tmdbId: 15 },
      { mediaType: 'movie', posterPath: null, title: 'Fourth', tmdbId: 16 },
    ])
  })

  it('fills from the next seed when the first page has one new title', () => {
    const posters = selectRecommendationPosters({
      libraryKeys: new Set(['movie:550']),
      pages: [
        {
          mediaType: 'movie',
          results: [
            { id: 550, title: 'Seed' },
            { id: 13, title: 'First' },
          ],
        },
        { mediaType: 'tv', results: [{ id: 1396, name: 'Next' }] },
      ],
      seeds: [
        { mediaType: 'movie', tmdbId: 550 },
        { mediaType: 'tv', tmdbId: 100 },
      ],
    })

    expect(posters.map((poster) => poster.title)).toEqual(['First', 'Next'])
  })
})

function completed(title: string, tmdbId: number, completedAt: null | string) {
  return {
    completedAt,
    media: { mediaType: 'movie' as const, title, tmdbId },
    updatedAt: '2026-01-01T00:00:00.000Z',
  }
}

function rated(title: string, tmdbId: number, rating: number, updatedAt: string) {
  return {
    media: { mediaType: 'movie' as const, title, tmdbId },
    rating,
    updatedAt,
  }
}
