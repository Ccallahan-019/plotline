import { useQuery, type UseQueryOptions } from '@tanstack/react-query'

import { normalizeMediaFilters } from '@/features/media-grid/filters/services/normalize-filters'

import type { LibraryItemsQuery, LibraryItemsResponse } from '../types/library-items'

import { fetchLibraryItems } from '../services/fetch-library-items'
import { libraryGridQueryKeys } from '../services/query-keys'
import { DEFAULT_LIBRARY_PAGE_SIZE } from '../types/library-items'

type UseLibraryGridItemsOptions = {
  initialData?: LibraryItemsResponse
  initialQuery?: LibraryItemsQuery
}

export function useLibraryGridItems(
  query: LibraryItemsQuery,
  options?: UseLibraryGridItemsOptions,
) {
  const shouldUseInitialData =
    options?.initialData !== undefined &&
    options?.initialQuery !== undefined &&
    libraryQueriesMatch(query, options.initialQuery)

  return useQuery({
    initialData: shouldUseInitialData ? options.initialData : undefined,
    placeholderData: (previousData) => previousData,
    queryFn: () => fetchLibraryItems(query),
    queryKey: libraryGridQueryKeys.libraryItems(query),
  } satisfies UseQueryOptions<LibraryItemsResponse>)
}

function libraryQueriesMatch(left: LibraryItemsQuery, right: LibraryItemsQuery): boolean {
  const normalizedLeft = normalizeLibraryQuery(left)
  const normalizedRight = normalizeLibraryQuery(right)

  return (
    normalizedLeft.page === normalizedRight.page &&
    normalizedLeft.pageSize === normalizedRight.pageSize &&
    JSON.stringify(normalizedLeft.filters) === JSON.stringify(normalizedRight.filters)
  )
}

function normalizeLibraryQuery(query: LibraryItemsQuery) {
  return {
    filters: normalizeMediaFilters(query.filters ?? {}),
    page: query.page ?? 1,
    pageSize: query.pageSize ?? DEFAULT_LIBRARY_PAGE_SIZE,
  }
}
