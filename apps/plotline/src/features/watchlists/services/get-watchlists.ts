import type { Watchlist } from '@plotline/payload-types'

import { fetchAllPages } from '@/lib/payload/fetch-all-pages'
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
  const filterParams: Record<string, number | string> = {}

  if (filters?.filter === 'system') {
    filterParams['where[isSystem][equals]'] = 'true'
  } else if (filters?.filter === 'custom') {
    filterParams['where[isSystem][equals]'] = 'false'
  } else if (filters?.filter === 'challenge') {
    filterParams['where[challenge.enabled][equals]'] = 'true'
  }

  // `id` breaks `sortOrder` ties so offset paging cannot skip or repeat a list.
  return fetchAllPages<Watchlist>(
    (page) =>
      payloadFetch<PayloadPaginatedDocs<Watchlist>>('/api/watchlists', {
        clerkUserId,
        method: 'GET',
        searchParams: { ...filterParams, depth: 0, limit: 100, page, sort: 'sortOrder,id' },
      }),
    '/api/watchlists',
  )
}
