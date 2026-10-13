import type { DashboardActivityPage } from '../types'

import { buildActivityRows, selectActivityPage } from './activity'
import {
  loadChallengeWatchlists,
  loadReviews,
  loadWatchEvents,
} from './load-dashboard-sources'
import { DashboardQueryError, type ParsedDashboardActivityQuery } from './parse-dashboard-query'

/**
 * Builds one page of the activity feed for the signed-in profile.
 *
 * Events and reviews are loaded with populated media so rows can link to a
 * title. Milestones are derived from the full event history before the range
 * and cursor cut the page.
 *
 * @param clerkUserId - Clerk user id forwarded to Payload
 * @param query - Parsed kind, media, range, cursor, limit, and timezone
 * @param now - Instant the rolling and year ranges are measured from
 * @returns The page of rows and a cursor when older rows remain
 * @throws {DashboardQueryError} When the cursor is not readable
 * @throws When a Payload request fails or paging does not finish
 */
export async function getDashboardActivity(
  clerkUserId: string,
  query: ParsedDashboardActivityQuery,
  now = new Date(),
): Promise<DashboardActivityPage> {
  const [events, reviews, challenges] = await Promise.all([
    loadWatchEvents(clerkUserId, 1),
    loadReviews(clerkUserId, 1),
    loadChallengeWatchlists(clerkUserId),
  ])
  const selected = selectActivityPage(
    buildActivityRows({
      challenges,
      events,
      reviews,
      timeZone: query.timeZone,
    }),
    query,
    now,
  )

  if (!selected.ok) {
    throw new DashboardQueryError(selected.error)
  }

  return selected.page
}
