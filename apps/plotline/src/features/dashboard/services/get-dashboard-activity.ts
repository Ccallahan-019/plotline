import type { DashboardActivityKind, DashboardActivityPage } from '../types'

import {
  type ActivityEventInput,
  activityRangeBounds,
  buildActivityRows,
  decodeActivityCursor,
  selectActivityPage,
} from './activity'
import { calendarDateInTimeZone } from './calendar'
import { loadChallengeWatchlists, loadReviews, loadWatchEvents } from './load-dashboard-sources'
import { DashboardQueryError, type ParsedDashboardActivityQuery } from './parse-dashboard-query'

// Milestones depend on the lifetime event history, so only these kinds scan all of it.
const MILESTONE_KINDS = new Set<DashboardActivityKind>(['all', 'milestone'])

/**
 * Builds one page of the activity feed for the signed-in profile.
 *
 * Only the sources the selected kind reads are loaded. Milestones are derived from the
 * full event history before the range and cursor cut the page, so `all` and `milestone`
 * read every event. A `watched` page needs no milestones: events load newest first,
 * bounded by the range and cursor, and stop once the page and its next-page check are
 * covered. Rated, reviewed, and challenge pages never read events.
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
  const cursor = query.cursor ? decodeActivityCursor(query.cursor) : null

  if (query.cursor && !cursor) {
    throw new DashboardQueryError('Invalid cursor')
  }

  const { kind } = query
  const [events, reviews, challenges] = await Promise.all([
    loadEvents(clerkUserId, query, cursor?.occurredAt ?? null, now),
    kind === 'challenge' || kind === 'milestone' ? [] : loadReviews(clerkUserId, 1),
    kind === 'all' || kind === 'challenge' ? loadChallengeWatchlists(clerkUserId) : [],
  ])
  const selected = selectActivityPage(
    buildActivityRows({
      challenges,
      events,
      includeMilestones: MILESTONE_KINDS.has(kind),
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

// The earlier of two ISO instants, ignoring a missing one. Both come from `toISOString`, so text order is time order.
function earlierInstant(left: null | string, right: null | string): null | string {
  if (left == null || right == null) {
    return left ?? right
  }

  return left < right ? left : right
}

// Events for the selected kind: everything for milestone kinds, a bounded newest-first slice for
// `watched`, and none when the kind is built from reviews or challenges alone.
async function loadEvents(
  clerkUserId: string,
  query: ParsedDashboardActivityQuery,
  cursorTime: null | string,
  now: Date,
): Promise<ActivityEventInput[]> {
  if (MILESTONE_KINDS.has(query.kind)) {
    return loadWatchEvents(clerkUserId, 1)
  }

  if (query.kind !== 'watched') {
    return []
  }

  const bounds = activityRangeBounds(query.range, calendarDateInTimeZone(now, query.timeZone))

  return loadWatchEvents(clerkUserId, 1, {
    newestFirst: {
      // Later events sort after every loaded row, so once one extra row follows the page
      // the page is final.
      enough: (loaded) => {
        const page = selectActivityPage(
          buildActivityRows({
            challenges: [],
            events: loaded,
            includeMilestones: false,
            reviews: [],
            timeZone: query.timeZone,
          }),
          query,
          now,
        )

        return page.ok && page.page.nextCursor != null
      },
      from: bounds.from,
      to: earlierInstant(bounds.to, cursorTime),
    },
  })
}
