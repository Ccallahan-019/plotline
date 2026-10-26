import type { Watchlist } from '@plotline/payload-types'

import { payloadFetch } from '@/lib/payload/payload-fetch'

/**
 * Reopens a list-size challenge that finished.
 *
 * Forwards to the owner-scoped Payload endpoint, which measures the goal live again.
 * A list that is already fully watched keeps its stored finish.
 *
 * @param clerkUserId - Clerk user id sent as the profile context
 * @param slug - Watchlist slug
 * @returns The watchlist with its recalculated `statsCache`
 * @throws {PayloadClientError} When the list is missing, not a list-size challenge, or not completed
 */
export async function reopenWatchlistChallenge(
  clerkUserId: string,
  slug: string,
): Promise<Watchlist> {
  return payloadFetch<Watchlist>(`/api/watchlists/${encodeURIComponent(slug)}/reopen-challenge`, {
    clerkUserId,
    method: 'POST',
  })
}
