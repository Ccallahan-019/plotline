import type { WatchlistCard } from '@/features/watchlists/types'

import { getWatchlistCards } from '@/features/watchlists/services/get-watchlist-cards'
import { PayloadClientError } from '@/lib/payload/payload-fetch'

/**
 * Prefetches watchlist cards for the watchlists page.
 *
 * A missing profile (Payload 404) is an empty list so the page can render its
 * empty state. Other failures are returned as `initialError`.
 *
 * @param clerkUserId - Signed-in Clerk user id
 * @returns Cards for hydration, plus an error message when the load failed
 */
export async function getInitialWatchlistCards(clerkUserId: string): Promise<{
  initialError: null | string
  initialWatchlistCards: WatchlistCard[]
}> {
  let initialError: null | string = null
  let initialWatchlistCards: WatchlistCard[] = []

  try {
    initialWatchlistCards = await getWatchlistCards(clerkUserId)
  } catch (error) {
    if (error instanceof PayloadClientError && error.status === 404) {
      initialWatchlistCards = []
    } else if (error instanceof Error) {
      initialError = error.message
    } else {
      initialError = 'Failed to load watchlists'
    }
  }

  return { initialError, initialWatchlistCards }
}
