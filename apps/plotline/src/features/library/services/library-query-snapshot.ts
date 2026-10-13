import type { LibraryItem } from '@plotline/payload-types'
import type { QueryClient, QueryKey } from '@tanstack/react-query'

import type { LibraryItemsResponse } from '../library-grid/types'

export type LibraryItemQuerySnapshot = {
  previousGridItems: Array<[QueryKey, LibraryItemsResponse | undefined]>
  previousLookupItems: Array<[QueryKey, LibraryItem[] | undefined]>
}

/**
 * Puts grid and lookup caches back to a pre-mutation snapshot.
 *
 * Replaces whole query results, so it suits a mutation that owns every row it
 * touched. A single-item edit that may overlap another in-flight edit should
 * revert only its own fields instead.
 *
 * @param queryClient - Client holding library grid and lookup queries
 * @param snapshot - Snapshot from `snapshotLibraryItemQueries`; ignored when missing
 */
export function restoreLibraryItemQuerySnapshot(
  queryClient: QueryClient,
  snapshot: LibraryItemQuerySnapshot | undefined,
): void {
  if (!snapshot) {
    return
  }

  for (const [queryKey, data] of snapshot.previousGridItems) {
    queryClient.setQueryData(queryKey, data)
  }

  for (const [queryKey, data] of snapshot.previousLookupItems) {
    queryClient.setQueryData(queryKey, data)
  }
}

/**
 * Cancels in-flight library queries and copies the grid and lookup caches.
 *
 * The `library-items` prefix includes watched-episode queries, so those requests
 * are cancelled too and cannot overwrite an optimistic library row.
 *
 * @param queryClient - Client holding library queries
 * @returns Grid and lookup snapshots to restore if the mutation fails
 */
export async function snapshotLibraryItemQueries(
  queryClient: QueryClient,
): Promise<LibraryItemQuerySnapshot> {
  await queryClient.cancelQueries({ queryKey: ['library-items'] })

  return {
    previousGridItems: queryClient.getQueriesData<LibraryItemsResponse>({
      queryKey: ['library-items', 'grid'],
    }),
    previousLookupItems: queryClient.getQueriesData<LibraryItem[]>({
      queryKey: ['library-items', 'lookup'],
    }),
  }
}
