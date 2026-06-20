import type { LibraryItem } from '@plotline/payload-types'

import { toPayloadLibraryFilters } from '@/features/media-grid/filters/services/normalize-filters'
import { buildSearchParams } from '@/lib/api/build-search-params'
import { fetchJson } from '@/lib/api/fetch-json'

import type { LibraryItemsQuery, LibraryItemsResponse } from '../types/library-items'

export function fetchAllLibraryItems(): Promise<LibraryItem[]> {
  return fetchLibraryItems({
    page: 1,
    pageSize: 1000,
  }).then((result) => result.docs)
}

export function fetchLibraryItems(query: LibraryItemsQuery = {}): Promise<LibraryItemsResponse> {
  const payloadFilters = toPayloadLibraryFilters(query.filters ?? {})

  return fetchJson<LibraryItemsResponse>(
    `/api/library-items${buildSearchParams({
      mediaTypes: payloadFilters.mediaTypes?.join(','),
      onWatchlist:
        payloadFilters.onWatchlist === undefined ? undefined : String(payloadFilters.onWatchlist),
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 24,
      sources: payloadFilters.sources?.join(','),
      statuses: payloadFilters.statuses?.join(','),
      watchlistIds: payloadFilters.watchlistIds?.join(','),
    })}`,
  )
}
