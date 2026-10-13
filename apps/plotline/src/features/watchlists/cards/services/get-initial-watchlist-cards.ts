import { PayloadClientError } from '@/lib/payload/payload-fetch'

import type { WatchlistCard, WatchlistCardFilter } from '../types'

import { getWatchlistCards } from './get-watchlist-cards'

/**
 * Prefetches cards for a watchlist or challenge index.
 *
 * A missing profile (Payload 404) is an empty list so the page can render its
 * empty state. Other failures are returned as `initialError`.
 *
 * @param clerkUserId - Signed-in Clerk user id
 * @param filter - `list` for the watchlists page, `challenge` for the challenges page
 * @returns Cards for hydration, plus an error message when the load failed
 */
export async function getInitialWatchlistCards(
  clerkUserId: string,
  filter: WatchlistCardFilter,
): Promise<{
  initialError: null | string
  initialWatchlistCards: WatchlistCard[]
}> {
  let initialError: null | string = null
  let initialWatchlistCards: WatchlistCard[] = []

  try {
    initialWatchlistCards = await getWatchlistCards(clerkUserId, filter)
  } catch (error) {
    if (error instanceof PayloadClientError && error.status === 404) {
      initialWatchlistCards = []
    } else if (error instanceof Error) {
      initialError = error.message
    } else {
      initialError =
        filter === 'challenge' ? 'Failed to load challenges' : 'Failed to load watchlists'
    }
  }

  return { initialError, initialWatchlistCards }
}
