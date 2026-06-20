import type { Review } from '@plotline/payload-types'

import { useQuery, type UseQueryOptions } from '@tanstack/react-query'

import { fetchReviews } from '../services/fetch-reviews'
import { type ReviewFilters, reviewQueryKeys } from '../services/query-keys'

type UseReviewsOptions = {
  initialData?: Review[]
}

export function useReviews(filters?: ReviewFilters, options?: UseReviewsOptions) {
  return useQuery({
    initialData: options?.initialData,
    queryFn: () => fetchReviews(filters),
    queryKey: reviewQueryKeys.reviews(filters),
  } satisfies UseQueryOptions<Review[]>)
}
