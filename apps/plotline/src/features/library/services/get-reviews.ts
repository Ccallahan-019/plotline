import type { Review } from '@plotline/payload-types'

import { payloadFetch, type PayloadPaginatedDocs } from '@/lib/payload/payload-fetch'

export type ReviewQueryFilters = {
  hasBody?: boolean
}

export async function getReviews(
  clerkUserId: string,
  filters?: ReviewQueryFilters,
): Promise<Review[]> {
  const searchParams: Record<string, number | string> = {
    depth: 1,
    limit: 100,
    sort: '-updatedAt',
  }

  if (filters?.hasBody === true) {
    searchParams['where[body][exists]'] = 'true'
  } else if (filters?.hasBody === false) {
    searchParams['where[body][exists]'] = 'false'
  }

  const result = await payloadFetch<PayloadPaginatedDocs<Review>>('/api/reviews', {
    clerkUserId,
    method: 'GET',
    searchParams,
  })

  return result.docs
}
