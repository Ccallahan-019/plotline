import type { Watchlist } from '@plotline/payload-types'

import { fetchAllPages } from '@/lib/payload/fetch-all-pages'
import { payloadFetch, type PayloadPaginatedDocs } from '@/lib/payload/payload-fetch'

export type WatchlistQueryFilters = {
  filter?: 'challenge' | 'custom' | 'system'
}

/**
 * Loads one watchlist by slug for the signed-in profile.
 *
 * Payload's read access limits the lookup to the profile's own lists, so a
 * slug another profile also uses cannot match.
 *
 * @param clerkUserId - Clerk user id forwarded to Payload
 * @param slug - Watchlist slug from the route
 * @returns The watchlist, or `null` when this profile has no list with that slug
 * @throws {PayloadClientError} When the Payload request fails
 */
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

/**
 * Loads every watchlist the signed-in profile owns, in manual order.
 *
 * Follows Payload paging until all lists are loaded, so a profile with more
 * than one page of lists is not truncated. The optional filter narrows to
 * system, custom or challenge lists.
 *
 * @param clerkUserId - Clerk user id forwarded to Payload
 * @param filters - Optional list-kind filter
 * @returns Watchlists ordered by `sortOrder`, then `id`
 * @throws When a Payload request fails, or paging does not finish
 */
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
