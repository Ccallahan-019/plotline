import type { WatchlistMembership } from '@plotline/payload-types'

import { payloadFetch, type PayloadPaginatedDocs } from '@/lib/payload/payload-fetch'

const MAX_PAYLOAD_PAGES = 100
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
export async function getWatchlistDetailMemberships(
  clerkUserId: string,
  watchlistId: number,
): Promise<WatchlistMembership[]> {
  const memberships: WatchlistMembership[] = []
  let page = 1

  while (page <= MAX_PAYLOAD_PAGES) {
    const result = await payloadFetch<PayloadPaginatedDocs<WatchlistMembership>>(
      '/api/watchlist-memberships',
      {
        clerkUserId,
        method: 'GET',
        searchParams: {
          depth: 2,
          limit: PAYLOAD_PAGE_SIZE,
          page,
          sort: MEMBERSHIP_SORT,
          'where[watchlist][equals]': watchlistId,
        },
      },
    )

    memberships.push(...result.docs)

    if (!result.hasNextPage) {
      return memberships
    }

    const nextPage = result.nextPage ?? page + 1

    if (nextPage <= page) {
      throw new Error('Payload page did not advance for watchlist memberships')
    }

    page = nextPage
  }

  throw new Error('Payload page limit exceeded for watchlist memberships')
}
