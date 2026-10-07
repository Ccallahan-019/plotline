import type { LibraryItem, WatchlistMembership } from '@plotline/payload-types'

import { payloadFetch, type PayloadPaginatedDocs } from '@/lib/payload/payload-fetch'

import type { WatchlistCard } from '../types'

import { buildWatchlistCards, collectPreviewLibraryItemIds } from './build-watchlist-cards'
import { getWatchlists } from './get-watchlists'

const MAX_PAYLOAD_PAGES = 100
const PAYLOAD_PAGE_SIZE = 100

/** List order for "first three titles": manual order, then when the title was added. */
const WATCHLIST_CARD_MEMBERSHIP_SORT = 'sortOrder,addedAt'

/**
 * Loads watchlist cards for the signed-in profile.
 *
 * Uses the same watchlist set as `getWatchlists`. Memberships are paged in list
 * order, then only the first three library items per list are loaded for posters.
 * Title counts include every membership. The result is not name-sorted; callers
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

  const watchlistIds = watchlists.map((watchlist) => watchlist.id)
  const memberships = await fetchAllPayloadDocs<WatchlistMembership>(
    clerkUserId,
    '/api/watchlist-memberships',
    (page) => membershipSearchParams(watchlistIds, page),
  )
  const previewIds = collectPreviewLibraryItemIds(watchlists, memberships)
  const libraryItems =
    previewIds.length === 0
      ? []
      : await fetchAllPayloadDocs<LibraryItem>(clerkUserId, '/api/library-items', (page) =>
          libraryItemSearchParams(previewIds, page),
        )

  return buildWatchlistCards({ libraryItems, memberships, watchlists })
}

// Writes `where[field][in][index]` params in the shape Payload's REST API expects.
function appendInFilter(
  searchParams: Record<string, number | string>,
  field: string,
  values: readonly number[],
) {
  values.forEach((value, index) => {
    searchParams[`where[${field}][in][${index}]`] = value
  })
}

/**
 * Follows Payload `hasNextPage` until every matching doc is loaded.
 *
 * @param clerkUserId - Clerk user id forwarded to Payload
 * @param path - Payload REST collection path
 * @param createSearchParams - Page-specific query. Called once per page
 * @returns Docs from every page, in page order
 * @throws When the next page does not advance or the page cap is hit
 */
async function fetchAllPayloadDocs<T>(
  clerkUserId: string,
  path: string,
  createSearchParams: (page: number) => Record<string, number | string>,
): Promise<T[]> {
  const docs: T[] = []
  let page = 1

  while (page <= MAX_PAYLOAD_PAGES) {
    const result = await payloadFetch<PayloadPaginatedDocs<T>>(path, {
      clerkUserId,
      method: 'GET',
      searchParams: createSearchParams(page),
    })

    docs.push(...result.docs)

    if (!result.hasNextPage) {
      return docs
    }

    const nextPage = result.nextPage ?? page + 1

    if (nextPage <= page) {
      throw new Error(`Payload page did not advance for ${path}`)
    }

    page = nextPage
  }

  throw new Error(`Payload page limit exceeded for ${path}`)
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

// Depth 0 memberships are enough to count titles and pick the first three ids.
function membershipSearchParams(
  watchlistIds: readonly number[],
  page: number,
): Record<string, number | string> {
  const searchParams: Record<string, number | string> = {
    depth: 0,
    limit: PAYLOAD_PAGE_SIZE,
    page,
    sort: WATCHLIST_CARD_MEMBERSHIP_SORT,
  }

  appendInFilter(searchParams, 'watchlist', watchlistIds)

  return searchParams
}
