import { describe, expect, it } from 'vitest'

import type { TmdbCommunityReview } from '../../types'

import { dedupeTmdbReviews } from '../dedupe-tmdb-reviews'

function review(id: string, body = ''): TmdbCommunityReview {
  return { avatarUrl: null, body, id, initials: '', name: 'Casey', rating: null, writtenAt: '' }
}

describe('dedupeTmdbReviews', () => {
  it('keeps the first occurrence of each id, in order', () => {
    const result = dedupeTmdbReviews([review('a', 'first'), review('b'), review('a', 'later')])

    expect(result.map((entry) => entry.id)).toEqual(['a', 'b'])
    expect(result[0]?.body).toBe('first')
  })
})
