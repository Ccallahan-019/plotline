import 'server-only'

import type { LibraryItemsResponse } from '@/features/library/library-grid/types'

import { getLibraryItems } from '@/features/library/library-grid/services/get-library-items'
import { PayloadClientError } from '@/lib/payload/payload-fetch'

import { CONTINUE_WATCHING_LIBRARY_QUERY } from './query-keys'

export type DashboardOverviewInitialData = {
  continueWatching?: LibraryItemsResponse
}

/**
 * Prefetches the watching library for the continue-watching page.
 *
 * @param clerkUserId - Clerk user id forwarded to Payload
 * @returns The watching page, or undefined when the load fails
 */
export async function getInitialContinueWatching(
  clerkUserId: string,
): Promise<LibraryItemsResponse | undefined> {
  return loadContinueWatching(clerkUserId)
}

/**
 * Prefetches the overview widget that is one cheap Payload page.
 *
 * Summary and activity stay client-fetched because their query keys include the
 * viewer's IANA zone. Trending and recommendations also stay client-fetched: each
 * fans out to several TMDB calls (recommendations also reads the whole library), and
 * awaiting them here would hold back the whole page. A failed prefetch is omitted so
 * the client query can retry.
 *
 * @param clerkUserId - Clerk user id forwarded to Payload
 * @returns Initial data for continue watching
 */
export async function getInitialDashboardOverview(
  clerkUserId: string,
): Promise<DashboardOverviewInitialData> {
  const continueWatching = await loadContinueWatching(clerkUserId)

  return continueWatching ? { continueWatching } : {}
}

// Watching library page. A missing profile is an empty list; other failures retry on the client.
async function loadContinueWatching(
  clerkUserId: string,
): Promise<LibraryItemsResponse | undefined> {
  try {
    return await getLibraryItems(clerkUserId, CONTINUE_WATCHING_LIBRARY_QUERY.filters, {
      page: CONTINUE_WATCHING_LIBRARY_QUERY.page,
      pageSize: CONTINUE_WATCHING_LIBRARY_QUERY.pageSize,
      sort: CONTINUE_WATCHING_LIBRARY_QUERY.sort,
    })
  } catch (error) {
    if (error instanceof PayloadClientError && error.status === 404) {
      return {
        docs: [],
        limit: CONTINUE_WATCHING_LIBRARY_QUERY.pageSize ?? 100,
        page: CONTINUE_WATCHING_LIBRARY_QUERY.page ?? 1,
        totalDocs: 0,
        totalPages: 1,
      }
    }

    return undefined
  }
}
