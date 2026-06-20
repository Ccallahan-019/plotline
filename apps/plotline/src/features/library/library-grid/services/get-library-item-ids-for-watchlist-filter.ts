import type { WatchlistMembership } from '@plotline/payload-types'

import { payloadFetch, type PayloadPaginatedDocs } from '@/lib/payload/payload-fetch'

type WatchlistFilterInput = {
  onWatchlist?: boolean
  watchlistIds?: number[]
}

export async function getLibraryItemIdsForWatchlistFilter(
  clerkUserId: string,
  filters: WatchlistFilterInput,
): Promise<null | number[]> {
  if (!filters.onWatchlist && !filters.watchlistIds?.length) {
    return null
  }

  const searchParams: Record<string, number | string> = {
    depth: 0,
    limit: 1000,
  }

  if (filters.watchlistIds?.length) {
    filters.watchlistIds.forEach((watchlistId, index) => {
      searchParams[`where[watchlist][in][${index}]`] = watchlistId
    })
  }

  const result = await payloadFetch<PayloadPaginatedDocs<WatchlistMembership>>(
    '/api/watchlist-memberships',
    {
      clerkUserId,
      method: 'GET',
      searchParams,
    },
  )

  const libraryItemIds = result.docs
    .map((membership) => membership.libraryItem)
    .map((libraryItem) => (typeof libraryItem === 'object' ? libraryItem.id : libraryItem))

  return [...new Set(libraryItemIds)]
}
