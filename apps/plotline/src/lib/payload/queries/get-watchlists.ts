import type { Watchlist } from '@plotline/payload-types'

import { payloadFetch, type PayloadPaginatedDocs } from '../client'

export async function getWatchlistBySlug(
  clerkUserId: string,
  slug: string,
): Promise<null | Watchlist> {
  const result = await payloadFetch<PayloadPaginatedDocs<Watchlist>>('/api/watchlists', {
    clerkUserId,
    method: 'GET',
    searchParams: {
      depth: 1,
      limit: 1,
      'where[slug][equals]': slug,
    },
  })

  return result.docs[0] ?? null
}

export async function getWatchlists(clerkUserId: string): Promise<Watchlist[]> {
  const result = await payloadFetch<PayloadPaginatedDocs<Watchlist>>('/api/watchlists', {
    clerkUserId,
    method: 'GET',
    searchParams: {
      depth: 0,
      limit: 100,
      sort: 'sortOrder',
    },
  })

  return result.docs
}
