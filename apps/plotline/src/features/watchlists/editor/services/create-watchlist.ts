import type { Watchlist } from '@plotline/payload-types'

import { payloadFetch } from '@/lib/payload/payload-fetch'

import type { WatchlistWriteInput } from './watchlist-write'

/**
 * Creates an owned watchlist.
 *
 * Forwards to the Payload endpoint that sets the owner and generates a unique
 * slug from the name. The caller does not choose the slug.
 *
 * @param clerkUserId - Clerk user id sent as the profile context
 * @param input - Name, visibility, cover, and challenge settings
 * @returns The created watchlist, including its slug
 * @throws {PayloadClientError} When Payload rejects the create
 */
export async function createWatchlist(
  clerkUserId: string,
  input: WatchlistWriteInput,
): Promise<Watchlist> {
  return payloadFetch<Watchlist>('/api/watchlists/create', {
    body: input,
    clerkUserId,
    method: 'POST',
  })
}
