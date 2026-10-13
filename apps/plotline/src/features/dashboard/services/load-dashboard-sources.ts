import type { LibraryItem, Review, WatchEvent, Watchlist } from '@plotline/payload-types'

import { getWatchlists } from '@/features/watchlists/services/get-watchlists'
import { fetchAllPages } from '@/lib/payload/fetch-all-pages'
import { payloadFetch, type PayloadPaginatedDocs } from '@/lib/payload/payload-fetch'

/**
 * Counts completed films on the profile.
 *
 * The count is Payload's `totalDocs` for status `completed` and movie progress.
 * The response row itself is unused.
 *
 * @param clerkUserId - Clerk user id forwarded to Payload
 * @returns How many completed movie library items the profile has
 * @throws When the Payload request fails
 */
export async function countCompletedFilms(clerkUserId: string): Promise<number> {
  const result = await payloadFetch<PayloadPaginatedDocs<LibraryItem>>('/api/library-items', {
    clerkUserId,
    method: 'GET',
    searchParams: {
      depth: 0,
      limit: 1,
      'where[progress.type][equals]': 'movie',
      'where[status][equals]': 'completed',
    },
  })

  return result.totalDocs
}

/**
 * Loads the profile's enabled challenge watchlists.
 *
 * Stats live on the watchlist document, so the lists are enough for the
 * activity snapshot and the completed-challenge count.
 *
 * @param clerkUserId - Clerk user id forwarded to Payload
 * @returns Challenge watchlists in list order
 * @throws When a Payload request fails or paging does not finish
 */
export async function loadChallengeWatchlists(clerkUserId: string): Promise<Watchlist[]> {
  return getWatchlists(clerkUserId, { filter: 'challenge' })
}

/**
 * Loads every library item for the signed-in profile.
 *
 * Media is populated so recommendation seeds and library keys can use TMDB ids.
 *
 * @param clerkUserId - Clerk user id forwarded to Payload
 * @returns Library items in id order
 * @throws When a Payload request fails or paging does not finish
 */
export async function loadLibraryItems(clerkUserId: string): Promise<LibraryItem[]> {
  return loadCollection<LibraryItem>(clerkUserId, '/api/library-items', 1)
}

/**
 * Loads every review for the signed-in profile.
 *
 * @param clerkUserId - Clerk user id forwarded to Payload
 * @param depth - Payload relationship depth. `1` populates the reviewed title
 * @returns Reviews in id order
 * @throws When a Payload request fails or paging does not finish
 */
export async function loadReviews(clerkUserId: string, depth: 0 | 1): Promise<Review[]> {
  return loadCollection<Review>(clerkUserId, '/api/reviews', depth)
}

/**
 * Loads every watch event for the signed-in profile.
 *
 * `depth` 0 leaves `media` as an id for the year summary. `depth` 1 populates
 * titles for the activity feed. Paging continues until Payload reports no next page.
 *
 * @param clerkUserId - Clerk user id forwarded to Payload
 * @param depth - Payload relationship depth
 * @returns Watch events in id order
 * @throws When a Payload request fails or paging does not finish
 */
export async function loadWatchEvents(
  clerkUserId: string,
  depth: 0 | 1,
): Promise<WatchEvent[]> {
  return loadCollection<WatchEvent>(clerkUserId, '/api/watch-events', depth)
}

// Follows Payload pages for one collection. `id` keeps offset paging stable.
async function loadCollection<T>(
  clerkUserId: string,
  path: string,
  depth: 0 | 1,
): Promise<T[]> {
  return fetchAllPages<T>(
    (page) =>
      payloadFetch<PayloadPaginatedDocs<T>>(path, {
        clerkUserId,
        method: 'GET',
        searchParams: { depth, limit: 100, page, sort: 'id' },
      }),
    path,
  )
}
