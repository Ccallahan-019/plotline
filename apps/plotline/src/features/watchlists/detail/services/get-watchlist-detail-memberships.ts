import type { WatchlistMembership } from '@plotline/payload-types'

import { fetchAllPages } from '@/lib/payload/fetch-all-pages'
import { payloadFetch, type PayloadPaginatedDocs } from '@/lib/payload/payload-fetch'

const MEMBERSHIP_SORT = 'sortOrder,addedAt,id'
const PAYLOAD_PAGE_SIZE = 100

/**
 * Loads every membership on a watchlist, with library item and media populated.
 *
 * Pages through Payload in list order (`sortOrder`, then `addedAt`, then `id`).
 * The id tiebreaker keeps offset pages stable when earlier keys match, including
 * legacy rows whose `sortOrder` is null.
 *
 * @param clerkUserId - Clerk user id forwarded to Payload
 * @param watchlistId - Watchlist whose memberships to load
 * @returns Memberships in list order
 * @throws When a Payload request fails, or paging does not finish
 */
export function getWatchlistDetailMemberships(
  clerkUserId: string,
  watchlistId: number,
): Promise<WatchlistMembership[]> {
  return fetchAllPages<WatchlistMembership>(
    (page) =>
      payloadFetch<PayloadPaginatedDocs<WatchlistMembership>>('/api/watchlist-memberships', {
        clerkUserId,
        method: 'GET',
        searchParams: {
          depth: 2,
          limit: PAYLOAD_PAGE_SIZE,
          page,
          sort: MEMBERSHIP_SORT,
          'where[watchlist][equals]': watchlistId,
        },
      }),
    '/api/watchlist-memberships',
  )
}
