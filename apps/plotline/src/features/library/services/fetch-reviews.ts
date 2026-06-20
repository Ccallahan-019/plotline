import type { Review } from '@plotline/payload-types'

import { buildSearchParams } from '@/lib/api/build-search-params'
import { fetchJson } from '@/lib/api/fetch-json'

import type { ReviewFilters } from './query-keys'

export function fetchReviews(filters?: ReviewFilters): Promise<Review[]> {
  return fetchJson<Review[]>(
    `/api/reviews${buildSearchParams({
      hasBody: filters?.hasBody === undefined ? undefined : String(filters.hasBody),
    })}`,
  )
}
