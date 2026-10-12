import { payloadFetch } from '@/lib/payload/payload-fetch'

import type { ReorderWatchlistMembershipsResult } from '../types'

/**
 * Persists membership order for one owned watchlist.
 *
 * Forwards the full id list to the Payload reorder endpoint, which writes
 * `sortOrder` as `0..n-1`.
 *
 * @param clerkUserId - Clerk user id sent as the profile context
 * @param slug - Watchlist slug
 * @param membershipIds - Membership ids in the new list order
 * @returns The ids in the order that was saved
 * @throws {PayloadClientError} When Payload rejects the reorder
 */
export async function reorderWatchlistMemberships(
  clerkUserId: string,
  slug: string,
  membershipIds: readonly number[],
): Promise<ReorderWatchlistMembershipsResult> {
  return payloadFetch<ReorderWatchlistMembershipsResult>(
    `/api/watchlists/${encodeURIComponent(slug)}/memberships/reorder`,
    {
      body: { membershipIds },
      clerkUserId,
      method: 'PATCH',
    },
  )
}
