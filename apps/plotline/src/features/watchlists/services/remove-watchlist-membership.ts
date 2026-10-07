import { payloadFetch } from '@/lib/payload/payload-fetch'

import type { RemoveWatchlistMembershipResult } from '../types'

/**
 * Removes one membership from an owned watchlist.
 *
 * The library item stays. Payload recalculates that watchlist's stats after
 * the row is deleted.
 *
 * @param clerkUserId - Clerk user id sent as the profile context
 * @param slug - Watchlist slug
 * @param membershipId - Membership to delete
 * @returns The id of the removed membership
 * @throws {PayloadClientError} When Payload rejects the removal
 */
export async function removeWatchlistMembership(
  clerkUserId: string,
  slug: string,
  membershipId: string,
): Promise<RemoveWatchlistMembershipResult> {
  return payloadFetch<RemoveWatchlistMembershipResult>(
    `/api/watchlists/${encodeURIComponent(slug)}/memberships/${encodeURIComponent(membershipId)}`,
    {
      clerkUserId,
      method: 'DELETE',
    },
  )
}
