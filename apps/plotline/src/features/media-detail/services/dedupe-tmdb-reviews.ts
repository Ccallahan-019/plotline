import type { TmdbCommunityReview } from '../types'

/**
 * Drops repeat reviews when TMDB reshuffles results between page fetches.
 *
 * @param reviews - Reviews from every loaded page, in page order
 * @returns The same reviews with only the first occurrence of each id kept
 */
export function dedupeTmdbReviews(reviews: TmdbCommunityReview[]): TmdbCommunityReview[] {
  const seen = new Set<string>()

  return reviews.filter((review) => {
    if (seen.has(review.id)) {
      return false
    }

    seen.add(review.id)

    return true
  })
}
