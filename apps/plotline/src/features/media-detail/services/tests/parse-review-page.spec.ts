import { describe, expect, it } from 'vitest'

import { parseReviewPage } from '../parse-review-page'

const BASE = 'http://localhost/api/tmdb/movie/1/reviews'

describe('parseReviewPage', () => {
  it('defaults to page 1 when the param is missing or blank', () => {
    expect(parseReviewPage(BASE)).toBe(1)
    expect(parseReviewPage(`${BASE}?page=`)).toBe(1)
    expect(parseReviewPage(`${BASE}?page=%20`)).toBe(1)
  })

  it('accepts positive integers', () => {
    expect(parseReviewPage(`${BASE}?page=3`)).toBe(3)
  })

  it.each(['0', '-1', '1.5', 'abc'])('rejects %s', (value) => {
    expect(parseReviewPage(`${BASE}?page=${value}`)).toBeNull()
  })
})
