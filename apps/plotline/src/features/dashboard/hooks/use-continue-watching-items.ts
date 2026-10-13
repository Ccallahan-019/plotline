'use client'

import type { LibraryItemsResponse } from '@/features/library/library-grid/types'

import { useLibraryGridItems } from '@/features/library/library-grid/hooks/use-library-grid-items'

import { CONTINUE_WATCHING_LIBRARY_QUERY } from '../services/query-keys'

type UseContinueWatchingItemsOptions = {
  initialData?: LibraryItemsResponse
}

/**
 * Loads the watching library used by continue watching and the overview queue.
 *
 * The query is fixed: status `watching`, sort recently watched, page size 100.
 * Log-watch invalidates the `library-items` prefix, so this list refreshes with
 * the rest of the library.
 *
 * @param options.initialData - Server-prefetched watching page for this same query
 * @returns A React Query result for the watching library page
 */
export function useContinueWatchingItems(options?: UseContinueWatchingItemsOptions) {
  return useLibraryGridItems(CONTINUE_WATCHING_LIBRARY_QUERY, {
    initialData: options?.initialData,
    initialQuery: CONTINUE_WATCHING_LIBRARY_QUERY,
  })
}
