import type { TmdbReview, TmdbReviewsResponse } from '@plotline/shared/tmdb'

import { describe, expect, it } from 'vitest'

import { mapTmdbCommunityReviews } from '../map-tmdb-reviews'

function page(
  results: TmdbReview[],
  overrides: Partial<TmdbReviewsResponse> = {},
): TmdbReviewsResponse {
  return {
    page: 1,
    results,
    total_pages: 3,
    total_results: 41,
    ...overrides,
  }
}

function review(overrides: Partial<TmdbReview> = {}): TmdbReview {
  return {
    author: 'Casey',
    author_details: {
      avatar_path: null,
      name: 'Casey Ng',
      rating: 8,
      username: 'casey',
    },
    content: 'A quiet film.',
    created_at: '2024-03-04T12:00:00.000Z',
    id: 'abc',
    ...overrides,
  }
}

describe('mapTmdbCommunityReviews', () => {
  it('keeps page totals and the reviewer name, rating, and body', () => {
    const mapped = mapTmdbCommunityReviews(page([review()]))

    expect(mapped.page).toBe(1)
    expect(mapped.totalPages).toBe(3)
    expect(mapped.totalResults).toBe(41)
    expect(mapped.reviews[0]).toMatchObject({
      avatarUrl: null,
      body: 'A quiet film.',
      id: 'abc',
      initials: 'CN',
      name: 'Casey Ng',
      rating: 8,
      writtenAt: '2024-03-04T12:00:00.000Z',
    })
  })

  it('uses the username, then the author, then a fallback when the name is blank', () => {
    const mapped = mapTmdbCommunityReviews(
      page([
        review({
          author_details: { name: '  ', username: 'casey' },
          id: 'username',
        }),
        review({
          author: 'Pat Lee',
          author_details: undefined,
          id: 'author',
        }),
        review({
          author: '  ',
          author_details: undefined,
          id: 'fallback',
        }),
      ]),
    )

    expect(mapped.reviews.map((entry) => entry.name)).toEqual(['casey', 'Pat Lee', 'TMDB User'])
    expect(mapped.reviews.map((entry) => entry.initials)).toEqual(['CA', 'PL', 'TU'])
  })

  it('turns gravatar and TMDB avatar paths into image URLs', () => {
    const mapped = mapTmdbCommunityReviews(
      page([
        review({
          author_details: {
            avatar_path: '/https://secure.gravatar.com/avatar/abc.jpg',
            name: 'Casey Ng',
          },
          id: 'gravatar',
        }),
        review({
          author_details: { avatar_path: '/abc.jpg', name: 'Casey Ng' },
          id: 'tmdb',
        }),
      ]),
    )

    expect(mapped.reviews[0]?.avatarUrl).toBe('https://secure.gravatar.com/avatar/abc.jpg')
    expect(mapped.reviews[1]?.avatarUrl).toBe('https://image.tmdb.org/t/p/w185/abc.jpg')
  })

  it('drops a missing rating and blank body', () => {
    const mapped = mapTmdbCommunityReviews(
      page([
        review({
          author_details: { name: 'Casey Ng', rating: null },
          content: '   ',
          created_at: undefined,
        }),
      ]),
    )

    expect(mapped.reviews[0]).toMatchObject({
      body: '',
      rating: null,
      writtenAt: '',
    })
  })
})
