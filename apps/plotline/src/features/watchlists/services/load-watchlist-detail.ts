import type { Watchlist, WatchlistMembership } from '@plotline/payload-types'

import { PayloadClientError } from '@/lib/payload/payload-fetch'

import { getWatchlistDetailMemberships } from './get-watchlist-detail-memberships'
import { getWatchlistBySlug } from './get-watchlists'

export type WatchlistDetailLoad =
  | {
      kind: 'missing'
    }
  | {
      kind: 'ready'
      memberships: null | WatchlistMembership[]
      membershipsError: null | string
      watchlist: Watchlist
    }

/**
 * Loads a watchlist and its memberships for the detail page.
 *
 * A missing watchlist is `kind: 'missing'` so the page can 404. Membership
 * failures are returned on a ready watchlist so the header can still render.
 *
 * @param clerkUserId - Signed-in Clerk user id
 * @param slug - Watchlist slug from the route
 * @returns The watchlist, or a missing result when Payload has no matching list
 * @throws When loading the watchlist fails for a reason other than not found
 */
export async function loadWatchlistDetail(
  clerkUserId: string,
  slug: string,
): Promise<WatchlistDetailLoad> {
  let watchlist: null | Watchlist = null

  try {
    watchlist = await getWatchlistBySlug(clerkUserId, slug)
  } catch (error) {
    if (error instanceof PayloadClientError && error.status === 404) {
      return { kind: 'missing' }
    }

    throw error
  }

  if (!watchlist) {
    return { kind: 'missing' }
  }

  try {
    const memberships = await getWatchlistDetailMemberships(clerkUserId, watchlist.id)

    return {
      kind: 'ready',
      memberships,
      membershipsError: null,
      watchlist,
    }
  } catch (error) {
    return {
      kind: 'ready',
      memberships: null,
      membershipsError: error instanceof Error ? error.message : 'Failed to load watchlist titles',
      watchlist,
    }
  }
}
