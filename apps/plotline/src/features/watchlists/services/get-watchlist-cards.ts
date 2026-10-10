import type { LibraryItem, Watchlist, WatchlistMembership } from '@plotline/payload-types'

import { appendInFilter } from '@/lib/payload/append-in-filter'
import { fetchAllPages } from '@/lib/payload/fetch-all-pages'
import { payloadFetch, type PayloadPaginatedDocs } from '@/lib/payload/payload-fetch'

import type { WatchlistCard } from '../types'

import {
  buildWatchlistCards,
  collectPreviewLibraryItemIds,
  WATCHLIST_CARD_PREVIEW_LIMIT,
} from './build-watchlist-cards'
import { getWatchlists } from './get-watchlists'

const PAYLOAD_PAGE_SIZE = 100

// Keeps each library-item request URL short. Must stay under PAYLOAD_PAGE_SIZE.
const LIBRARY_ITEM_CHUNK_SIZE = 50

/** List order for "first three titles": manual order, then when added, then id so ties are stable. */
const WATCHLIST_CARD_MEMBERSHIP_SORT = 'sortOrder,addedAt,id'

/**
 * Loads watchlist cards for the signed-in profile.
 *
 * Uses the same watchlist set as `getWatchlists`. Each list asks Payload for
 * only its first three memberships, in parallel, and reads the list's full
 * title count from `totalDocs`. Posters for those memberships then load in a
 * few chunked library-item requests. The result is not name-sorted; callers
 * apply `sortWatchlistCards`.
 *
 * @param clerkUserId - Clerk user id forwarded to Payload
 * @returns Cards in `getWatchlists` order
 * @throws When a Payload request fails, or paging does not finish
 */
export async function getWatchlistCards(clerkUserId: string): Promise<WatchlistCard[]> {
  const watchlists = await getWatchlists(clerkUserId)

  if (watchlists.length === 0) {
    return []
  }

  const { memberships, titleCounts } = await fetchPreviewMemberships(clerkUserId, watchlists)
  const previewIds = collectPreviewLibraryItemIds(watchlists, memberships)
  const libraryItems = await fetchPreviewLibraryItems(clerkUserId, previewIds)

  return buildWatchlistCards({ libraryItems, memberships, titleCounts, watchlists })
}

// Splits ids into groups of at most `size`, keeping order.
function chunk<T>(values: readonly T[], size: number): T[][] {
  const chunks: T[][] = []

  for (let start = 0; start < values.length; start += size) {
    chunks.push(values.slice(start, start + size))
  }

  return chunks
}

// Loads the preview library items in parallel chunks so no request carries hundreds of ids.
async function fetchPreviewLibraryItems(
  clerkUserId: string,
  libraryItemIds: readonly number[],
): Promise<LibraryItem[]> {
  const chunks = await Promise.all(
    chunk(libraryItemIds, LIBRARY_ITEM_CHUNK_SIZE).map((ids) =>
      fetchAllPages<LibraryItem>(
        (page) =>
          payloadFetch<PayloadPaginatedDocs<LibraryItem>>('/api/library-items', {
            clerkUserId,
            method: 'GET',
            searchParams: libraryItemSearchParams(ids, page),
          }),
        '/api/library-items',
      ),
    ),
  )

  return chunks.flat()
}

// One small request per list, run in parallel, instead of paging every membership.
async function fetchPreviewMemberships(
  clerkUserId: string,
  watchlists: readonly Watchlist[],
): Promise<{ memberships: WatchlistMembership[]; titleCounts: Map<number, number> }> {
  const results = await Promise.all(
    watchlists.map((watchlist) =>
      payloadFetch<PayloadPaginatedDocs<WatchlistMembership>>('/api/watchlist-memberships', {
        clerkUserId,
        method: 'GET',
        searchParams: membershipPreviewSearchParams(watchlist.id),
      }),
    ),
  )

  return {
    memberships: results.flatMap((result) => result.docs),
    titleCounts: new Map(
      watchlists.map((watchlist, index) => [watchlist.id, results[index]!.totalDocs]),
    ),
  }
}

// Depth 1 so `media.posterPath` and `media.title` are populated. Sort by id so pages cannot skip a row.
function libraryItemSearchParams(
  libraryItemIds: readonly number[],
  page: number,
): Record<string, number | string> {
  const searchParams: Record<string, number | string> = {
    depth: 1,
    limit: PAYLOAD_PAGE_SIZE,
    page,
    sort: 'id',
  }

  appendInFilter(searchParams, 'id', libraryItemIds)

  return searchParams
}

// Depth 0 memberships are enough to pick the first three ids. `totalDocs` is the full count.
function membershipPreviewSearchParams(watchlistId: number): Record<string, number | string> {
  return {
    depth: 0,
    limit: WATCHLIST_CARD_PREVIEW_LIMIT,
    sort: WATCHLIST_CARD_MEMBERSHIP_SORT,
    'where[watchlist][equals]': watchlistId,
  }
}
