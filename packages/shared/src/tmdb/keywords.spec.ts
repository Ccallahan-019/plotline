import { describe, expect, it } from 'vitest'

import { tmdbKeywordSearchResponseSchema } from './schemas'

describe('tmdb keyword search schema', () => {
  it('keeps keyword ids, names, and page totals', () => {
    const page = tmdbKeywordSearchResponseSchema.parse({
      page: 1,
      results: [{ id: 1721, name: 'fight' }],
      total_pages: 4,
      total_results: 70,
    })

    expect(page).toEqual({
      page: 1,
      results: [{ id: 1721, name: 'fight' }],
      total_pages: 4,
      total_results: 70,
    })
  })
})
