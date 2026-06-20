import { useQuery, type UseQueryOptions } from '@tanstack/react-query'

import type { LibraryItemsResponse } from '../types'

import { fetchAllLibraryItems } from '../services/fetch-library-items'
import { libraryGridQueryKeys } from '../services/query-keys'

type UseLibraryItemsLookupOptions = {
  initialData?: LibraryItemsResponse['docs']
}

export function useLibraryItemsLookup(options?: UseLibraryItemsLookupOptions) {
  return useQuery({
    initialData: options?.initialData,
    queryFn: fetchAllLibraryItems,
    queryKey: libraryGridQueryKeys.libraryItemsLookup(),
  } satisfies UseQueryOptions<LibraryItemsResponse['docs']>)
}
