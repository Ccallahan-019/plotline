import type { Watchlist } from '@plotline/payload-types'

import { refreshChallengePacing } from '@plotline/shared/watchlist-stats'

import { fetchAllPages } from '@/lib/payload/fetch-all-pages'
import { payloadFetch, type PayloadPaginatedDocs } from '@/lib/payload/payload-fetch'

import type { WatchlistListFilter } from '../types'

import { toWatchlistFilterSearchParams } from './watchlist-list-filter'

export type WatchlistQueryFilters = {
  filter?: WatchlistListFilter
}

/**
 * Loads one watchlist by slug for the signed-in profile.
 *
 * Payload's read access limits the lookup to the profile's own lists, so a
 * slug another profile also uses cannot match. Challenge pacing on `statsCache`
 * uses the current date. Totals and `lastCalculatedAt` stay as stored.
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

  const watchlist = result.docs[0]

  return watchlist ? withCurrentChallengePacing(watchlist) : null
}

/**
 * Loads every watchlist the signed-in profile owns, in manual order.
 *
 * Follows Payload paging until all lists are loaded, so a profile with more
 * than one page of lists is not truncated. The optional filter narrows to
 * system, custom, challenge, or non-challenge lists. Challenge pacing on
 * `statsCache` uses the current date. Totals and `lastCalculatedAt` stay as stored.
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
  const filterParams = toWatchlistFilterSearchParams(filters?.filter)

  // `id` breaks `sortOrder` ties so offset paging cannot skip or repeat a list.
  const watchlists = await fetchAllPages<Watchlist>(
    (page) =>
      payloadFetch<PayloadPaginatedDocs<Watchlist>>('/api/watchlists', {
        clerkUserId,
        method: 'GET',
        searchParams: { ...filterParams, depth: 0, limit: 100, page, sort: 'sortOrder,id' },
      }),
    '/api/watchlists',
  )

  return watchlists.map(withCurrentChallengePacing)
}

// Recomputes challenge pacing from the current date. Totals and lastCalculatedAt stay cached.
function withCurrentChallengePacing(watchlist: Watchlist): Watchlist {
  const stats = watchlist.statsCache

  if (stats == null) {
    return watchlist
  }

  return {
    ...watchlist,
    statsCache: refreshChallengePacing({
      challenge: watchlist.challenge,
      stats,
      watchlistCreatedAt: watchlist.createdAt,
    }),
  }
}
