import type { WatchedEpisodePair } from '@plotline/shared/log-watch'

import { payloadFetch } from '@/lib/payload/payload-fetch'

/**
 * Loads unique watched TV episodes for a library item from Payload.
 *
 * The Payload route is owner-scoped through the Clerk user id. Events without
 * `tvContext` are already omitted.
 *
 * @param clerkUserId - Clerk user id forwarded so Payload can resolve the owner profile
 * @param libraryItemId - Library item to read episode coverage for
 * @returns Unique `{ season, episode }` pairs
 * @throws PayloadClientError when the library item is missing or not owned
 */
export async function getWatchedEpisodes(
  clerkUserId: string,
  libraryItemId: number,
): Promise<WatchedEpisodePair[]> {
  return payloadFetch<WatchedEpisodePair[]>('/api/library/watched-episodes', {
    clerkUserId,
    method: 'GET',
    searchParams: {
      libraryItemId,
    },
  })
}
