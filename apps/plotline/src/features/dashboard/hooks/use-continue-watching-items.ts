'use client'

import type { LibraryItem } from '@plotline/payload-types'

import type { LibraryItemsResponse } from '@/features/library/library-grid/types'

import { useLibraryGridItems } from '@/features/library/library-grid/hooks/use-library-grid-items'

import { type ContinueWatchingItem, toContinueWatchingItems } from '../services/continue-watching'
import { CONTINUE_WATCHING_LIBRARY_QUERY } from '../services/query-keys'

export type ContinueWatchingRows = {
  libraryItems: ReadonlyMap<number, LibraryItem>
  query: ReturnType<typeof useContinueWatchingItems>
  rows: ContinueWatchingItem[]
}

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

/**
 * Loads watching titles and maps them into continue-watching rows.
 *
 * The library query is the same one `useContinueWatchingItems` uses, so the
 * overview queue and the continue-watching page share a cache. `libraryItems`
 * keeps the Payload row for the log-watch button.
 *
 * @param options.initialData - Server-prefetched watching page for this same query
 * @returns The library query, view-model rows, and the source items by id
 */
export function useContinueWatchingRows(
  options?: UseContinueWatchingItemsOptions,
): ContinueWatchingRows {
  const query = useContinueWatchingItems(options)
  const docs = query.data?.docs ?? []

  return {
    libraryItems: new Map(docs.map((item) => [item.id, item])),
    query,
    rows: toContinueWatchingItems(docs, new Date()),
  }
}
