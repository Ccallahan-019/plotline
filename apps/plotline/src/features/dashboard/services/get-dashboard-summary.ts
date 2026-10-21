import type { DashboardSummary, DashboardSummaryFilters } from '../types'

import {
  countCompletedFilms,
  loadChallengeWatchlists,
  loadReviews,
  loadWatchEvents,
} from './load-dashboard-sources'
import { buildDashboardSummary, countCompletedChallenges } from './summary'

/**
 * Computes the dashboard year summary for the signed-in profile.
 *
 * Watch events and reviews load only the fields the math reads, alongside the completed
 * film count and challenge lists. The pure summary math then applies the requested year
 * and timezone.
 *
 * @param clerkUserId - Clerk user id forwarded to Payload
 * @param filters - Calendar year and IANA timezone
 * @param now - Instant used for the current streak and highlighted month
 * @returns The summary payload for `GET /api/dashboard/summary`
 * @throws When a Payload request fails or paging does not finish
 */
export async function getDashboardSummary(
  clerkUserId: string,
  filters: DashboardSummaryFilters,
  now = new Date(),
): Promise<DashboardSummary> {
  const [events, reviews, filmsCompleted, challenges] = await Promise.all([
    loadWatchEvents(clerkUserId, 0, {
      select: ['eventType', 'media', 'runtimeMinutes', 'watchedAt'],
    }),
    loadReviews(clerkUserId, 0, { select: ['rating', 'updatedAt'] }),
    countCompletedFilms(clerkUserId),
    loadChallengeWatchlists(clerkUserId),
  ])

  return buildDashboardSummary({
    challengesCompleted: countCompletedChallenges(challenges),
    events: events.map((event) => ({
      eventType: event.eventType,
      mediaId: typeof event.media === 'number' ? event.media : event.media.id,
      runtimeMinutes: event.runtimeMinutes,
      watchedAt: event.watchedAt,
    })),
    filmsCompleted,
    now,
    reviews: reviews.map((review) => ({
      rating: review.rating,
      updatedAt: review.updatedAt,
    })),
    timeZone: filters.timeZone,
    year: filters.year,
  })
}
