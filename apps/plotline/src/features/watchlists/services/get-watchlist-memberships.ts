import type { WatchlistMembership } from '@plotline/payload-types'

import { payloadFetch, type PayloadPaginatedDocs } from '@/lib/payload/payload-fetch'

export type WatchlistMembershipFilters = {
  libraryItemId: number
}

export async function getWatchlistMemberships(
  clerkUserId: string,
  filters: WatchlistMembershipFilters,
): Promise<WatchlistMembership[]> {
  const result = await payloadFetch<PayloadPaginatedDocs<WatchlistMembership>>(
    '/api/watchlist-memberships',
    {
      clerkUserId,
      method: 'GET',
      searchParams: {
        depth: 1,
        limit: 100,
        'where[libraryItem][equals]': filters.libraryItemId,
      },
    },
  )

  return result.docs
}
