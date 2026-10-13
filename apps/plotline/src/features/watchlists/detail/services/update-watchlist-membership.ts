import type { WatchlistMembership } from '@plotline/payload-types'

import { payloadFetch } from '@/lib/payload/payload-fetch'

/**
 * Sets whether one membership counts toward its watchlist goal.
 *
 * Forwards `{ excludeFromGoal }` to Payload, which recomputes the row and
 * refreshes watchlist stats. Turning counts on is rejected when the challenge
 * rules already exclude the title.
 *
 * @param clerkUserId - Clerk user id sent as the profile context
 * @param slug - Watchlist slug
 * @param membershipId - Membership to update
 * @param excludeFromGoal - `true` keeps the title out of the goal
 * @returns The updated membership
 * @throws {PayloadClientError} When Payload rejects the update
 */
export async function updateWatchlistMembership(
  clerkUserId: string,
  slug: string,
  membershipId: string,
  excludeFromGoal: boolean,
): Promise<WatchlistMembership> {
  return payloadFetch<WatchlistMembership>(
    `/api/watchlists/${encodeURIComponent(slug)}/memberships/${encodeURIComponent(membershipId)}`,
    {
      body: { excludeFromGoal },
      clerkUserId,
      method: 'PATCH',
    },
  )
}
