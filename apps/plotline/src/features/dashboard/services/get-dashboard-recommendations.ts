import type { TmdbClient } from '@plotline/shared/tmdb'

import type { DashboardRecommendations } from '../types'

import { loadLibraryItems, loadReviews } from './load-dashboard-sources'
import {
  libraryMediaKeys,
  selectRecommendationPosters,
  selectRecommendationSeeds,
} from './recommendations'

/**
 * Builds the overview recommendation card.
 *
 * Seeds are up to two titles rated 7 or higher, or the two most recently
 * completed titles when no rating qualifies. TMDB recommendations for those
 * seeds are filtered against the library. The card payload has no seeds when
 * the profile has neither.
 *
 * @param clerkUserId - Clerk user id forwarded to Payload
 * @param client - TMDB client used for each seed's recommendations
 * @returns Seeds, why they were chosen, and up to four posters
 * @throws When a Payload request fails, or every TMDB recommendation call fails
 */
export async function getDashboardRecommendations(
  clerkUserId: string,
  client: TmdbClient,
): Promise<DashboardRecommendations> {
  const [libraryItems, reviews] = await Promise.all([
    loadLibraryItems(clerkUserId),
    loadReviews(clerkUserId, 1),
  ])
  const selection = selectRecommendationSeeds({
    completed: libraryItems.filter((item) => item.status === 'completed'),
    rated: reviews,
  })

  if (selection.seeds.length === 0) {
    return { items: [], reason: null, seeds: [] }
  }

  const settled = await Promise.allSettled(
    selection.seeds.map((seed) => client.getRecommendations(seed.mediaType, seed.tmdbId)),
  )
  const pages = settled.flatMap((result, index) => {
    const seed = selection.seeds[index]

    if (result.status !== 'fulfilled' || !seed) {
      return []
    }

    return [{ mediaType: seed.mediaType, results: result.value.results }]
  })

  if (pages.length === 0) {
    const failure = settled.find((result) => result.status === 'rejected')

    if (failure?.status === 'rejected') {
      throw failure.reason
    }
  }

  return {
    items: selectRecommendationPosters({
      libraryKeys: libraryMediaKeys(libraryItems),
      pages,
      seeds: selection.seeds,
    }),
    reason: selection.reason,
    seeds: selection.seeds,
  }
}
