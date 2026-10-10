import type { Watchlist } from '@plotline/payload-types'

import { payloadFetch } from '@/lib/payload/payload-fetch'

import type { UpdateWatchlistInput } from '../types'

/**
 * Updates the name, description, and visibility of one owned watchlist.
 *
 * Forwards to the owner-scoped Payload endpoint. The slug is not changed.
 *
 * @param clerkUserId - Clerk user id sent as the profile context
 * @param slug - Watchlist slug
 * @param input - Name, description, and visibility to save
 * @returns The updated watchlist
 * @throws {PayloadClientError} When Payload rejects the update
 */
export async function updateWatchlist(
  clerkUserId: string,
  slug: string,
  input: UpdateWatchlistInput,
): Promise<Watchlist> {
  return payloadFetch<Watchlist>(`/api/watchlists/${encodeURIComponent(slug)}/details`, {
    body: input,
    clerkUserId,
    method: 'PATCH',
  })
}
