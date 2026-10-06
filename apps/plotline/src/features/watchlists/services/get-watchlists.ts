import type { Watchlist } from '@plotline/payload-types'

import { payloadFetch, type PayloadPaginatedDocs } from '@/lib/payload/payload-fetch'

export type WatchlistQueryFilters = {
  filter?: 'challenge' | 'custom' | 'system'
}

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

export async function getWatchlists(
  clerkUserId: string,
  filters?: WatchlistQueryFilters,
): Promise<Watchlist[]> {
  const searchParams: Record<string, number | string> = {
    depth: 0,
    limit: 100,
    sort: 'sortOrder',
  }

  if (filters?.filter === 'system') {
    searchParams['where[isSystem][equals]'] = 'true'
  } else if (filters?.filter === 'custom') {
    searchParams['where[isSystem][equals]'] = 'false'
  } else if (filters?.filter === 'challenge') {
    searchParams['where[challenge.enabled][equals]'] = 'true'
  }

  const result = await payloadFetch<PayloadPaginatedDocs<Watchlist>>('/api/watchlists', {
    clerkUserId,
    method: 'GET',
    searchParams,
  })

  return result.docs
}
