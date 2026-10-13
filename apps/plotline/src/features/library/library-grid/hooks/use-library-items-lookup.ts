import { useQuery, type UseQueryOptions } from '@tanstack/react-query'

import type { LibraryItemsResponse } from '../types'

import { fetchAllLibraryItems } from '../services/fetch-library-items'
import { libraryGridQueryKeys } from '../services/query-keys'

type UseLibraryItemsLookupOptions = {
  /** When `false`, the lookup does not run. */
  enabled?: boolean
  initialData?: LibraryItemsResponse['docs']
}

/**
 * Loads the profile's library items for matching titles by TMDB id.
 *
 * Shares the library lookup cache. Pass `enabled: false` while a surface is
 * closed so the request waits until it is needed.
 *
 * @param options.enabled - When `false`, the query does not run
 * @param options.initialData - Docs already loaded on the server
 * @returns A React Query result for the profile's library items
 */
export function useLibraryItemsLookup(options?: UseLibraryItemsLookupOptions) {
  return useQuery({
    enabled: options?.enabled ?? true,
    initialData: options?.initialData,
    queryFn: fetchAllLibraryItems,
    queryKey: libraryGridQueryKeys.libraryItemsLookup(),
  } satisfies UseQueryOptions<LibraryItemsResponse['docs']>)
}
