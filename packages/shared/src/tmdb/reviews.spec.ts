import { describe, expect, it } from 'vitest'

import { tmdbReviewsResponseSchema } from './schemas'

describe('tmdb reviews schema', () => {
  it('keeps author, rating, and page totals', () => {
    const page = tmdbReviewsResponseSchema.parse({
      page: 1,
      results: [
        {
          author: 'Goddard',
          author_details: {
            avatar_path: '/https://secure.gravatar.com/avatar/abc.jpg',
            name: '',
            rating: 8.5,
            username: 'Goddard',
          },
          content: 'Pretty awesome movie.',
          created_at: '2018-06-09T17:51:53.359Z',
          id: '5b1c13b9c3a36848f2026384',
        },
        {
          author_details: { rating: null },
          id: 'no-rating',
        },
      ],
      total_pages: 2,
      total_results: 21,
    })

    expect(page.page).toBe(1)
    expect(page.total_pages).toBe(2)
    expect(page.total_results).toBe(21)
    expect(page.results[0]?.author_details?.rating).toBe(8.5)
    expect(page.results[0]?.author_details?.avatar_path).toBe(
      '/https://secure.gravatar.com/avatar/abc.jpg',
    )
    expect(page.results[1]?.author_details?.rating).toBeNull()
  })
})
