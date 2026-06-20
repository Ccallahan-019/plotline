import type { LibraryItem } from '@plotline/payload-types'

import type { MediaFilters } from '@/features/media-grid/filters/types'

import { toPayloadLibraryFilters } from '@/features/media-grid/filters/services/normalize-filters'
import { payloadFetch, type PayloadPaginatedDocs } from '@/lib/payload/payload-fetch'

import type { LibrarySort } from '../types'

import { buildLibraryItemSearchParams } from './build-library-item-search-params'
import { getLibraryItemIdsForWatchlistFilter } from './get-library-item-ids-for-watchlist-filter'

export type LibraryItemQuery = {
  filters?: MediaFilters
  page?: number
  pageSize?: number
  sort?: LibrarySort
}

export type LibraryItemsResult = {
  docs: LibraryItem[]
  limit: number
  page: number
  totalDocs: number
  totalPages: number
}

const EMPTY_LIBRARY_ITEMS_RESULT: LibraryItemsResult = {
  docs: [],
  limit: 24,
  page: 1,
  totalDocs: 0,
  totalPages: 1,
}

export async function getAllLibraryItems(clerkUserId: string): Promise<LibraryItem[]> {
  const result = await getLibraryItems(clerkUserId, undefined, {
    page: 1,
    pageSize: 1000,
  })

  return result.docs
}

export async function getLibraryItems(
  clerkUserId: string,
  filters?: MediaFilters,
  pagination?: { page?: number; pageSize?: number; sort?: LibrarySort },
): Promise<LibraryItemsResult> {
  const payloadFilters = toPayloadLibraryFilters(filters ?? {})
  const page = pagination?.page ?? 1
  const pageSize = pagination?.pageSize ?? 24
  const sort = pagination?.sort

  const watchlistFilter = await getLibraryItemIdsForWatchlistFilter(clerkUserId, {
    onWatchlist: payloadFilters.onWatchlist,
    watchlistIds: payloadFilters.watchlistIds,
  })

  if (
    watchlistFilter !== null &&
    !watchlistFilter.exclude &&
    watchlistFilter.libraryItemIds.length === 0
  ) {
    return {
      ...EMPTY_LIBRARY_ITEMS_RESULT,
      limit: pageSize,
      page,
    }
  }

  const searchParams = buildLibraryItemSearchParams({
    excludeLibraryItemIds: watchlistFilter?.exclude ? watchlistFilter.libraryItemIds : undefined,
    libraryItemIds:
      watchlistFilter && !watchlistFilter.exclude ? watchlistFilter.libraryItemIds : undefined,
    mediaTypes: payloadFilters.mediaTypes,
    page,
    pageSize,
    sort,
    sources: payloadFilters.sources,
    statuses: payloadFilters.statuses,
  })

  const result = await payloadFetch<PayloadPaginatedDocs<LibraryItem>>('/api/library-items', {
    clerkUserId,
    method: 'GET',
    searchParams,
  })

  return {
    docs: result.docs,
    limit: result.limit,
    page: result.page,
    totalDocs: result.totalDocs,
    totalPages: result.totalPages,
  }
}
