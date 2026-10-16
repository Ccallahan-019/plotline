import 'server-only'
import { createTmdbClient } from '@plotline/shared/tmdb'

import type { LibraryItemsResponse } from '@/features/library/library-grid/types'

import { getLibraryItems } from '@/features/library/library-grid/services/get-library-items'
import { PayloadClientError } from '@/lib/payload/payload-fetch'

import type { DashboardRecommendations, TrendingTitles } from '../types'

import { getDashboardRecommendations } from './get-dashboard-recommendations'
import { getTrendingTitles } from './get-trending'
import { CONTINUE_WATCHING_LIBRARY_QUERY } from './query-keys'

export type DashboardOverviewInitialData = {
  continueWatching?: LibraryItemsResponse
  recommendations?: DashboardRecommendations
  trending?: TrendingTitles
}

/**
 * Prefetches the watching library for the continue-watching page.
 *
 * @param clerkUserId - Clerk user id forwarded to Payload
 * @returns The watching page, or undefined when the load fails
 */
export async function getInitialContinueWatching(
  clerkUserId: string,
): Promise<LibraryItemsResponse | undefined> {
  return loadContinueWatching(clerkUserId)
}

/**
 * Prefetches overview widgets that do not depend on the browser timezone.
 *
 * Summary and activity stay client-fetched because their query keys include the
 * viewer's IANA zone. A failed prefetch is omitted so the client query can retry.
 *
 * @param clerkUserId - Clerk user id forwarded to Payload
 * @returns Initial data for continue watching, recommendations, and trending
 */
export async function getInitialDashboardOverview(
  clerkUserId: string,
): Promise<DashboardOverviewInitialData> {
  const [continueWatching, recommendations, trending] = await Promise.all([
    loadContinueWatching(clerkUserId),
    loadRecommendations(clerkUserId),
    loadTrending(),
  ])

  return {
    ...(continueWatching ? { continueWatching } : {}),
    ...(recommendations ? { recommendations } : {}),
    ...(trending ? { trending } : {}),
  }
}

// Watching library page. A missing profile is an empty list; other failures retry on the client.
async function loadContinueWatching(
  clerkUserId: string,
): Promise<LibraryItemsResponse | undefined> {
  try {
    return await getLibraryItems(clerkUserId, CONTINUE_WATCHING_LIBRARY_QUERY.filters, {
      page: CONTINUE_WATCHING_LIBRARY_QUERY.page,
      pageSize: CONTINUE_WATCHING_LIBRARY_QUERY.pageSize,
      sort: CONTINUE_WATCHING_LIBRARY_QUERY.sort,
    })
  } catch (error) {
    if (error instanceof PayloadClientError && error.status === 404) {
      return {
        docs: [],
        limit: CONTINUE_WATCHING_LIBRARY_QUERY.pageSize ?? 100,
        page: CONTINUE_WATCHING_LIBRARY_QUERY.page ?? 1,
        totalDocs: 0,
        totalPages: 1,
      }
    }

    return undefined
  }
}

// Recommendation card, or undefined when TMDB is unset or the request fails.
async function loadRecommendations(
  clerkUserId: string,
): Promise<DashboardRecommendations | undefined> {
  const accessToken = process.env.TMDB_READ_ACCESS_TOKEN

  if (!accessToken) {
    return undefined
  }

  try {
    return await getDashboardRecommendations(clerkUserId, createTmdbClient(accessToken))
  } catch {
    return undefined
  }
}

// Weekly trending list, or undefined when TMDB is unset or the request fails.
async function loadTrending(): Promise<TrendingTitles | undefined> {
  const accessToken = process.env.TMDB_READ_ACCESS_TOKEN

  if (!accessToken) {
    return undefined
  }

  try {
    return await getTrendingTitles(createTmdbClient(accessToken))
  } catch {
    return undefined
  }
}
