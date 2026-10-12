import type { WatchlistMembership } from '@plotline/payload-types'

import { fetchJson } from '@/lib/api/fetch-json'

import type {
  RemoveWatchlistMembershipResult,
  ReorderWatchlistMembershipsResult,
  UpdateWatchlistMembershipInput,
} from '../types'

/** Removes one title from a watchlist. The library item stays. */
export function deleteWatchlistMembership(
  slug: string,
  membershipId: number,
): Promise<RemoveWatchlistMembershipResult> {
  return fetchJson<RemoveWatchlistMembershipResult>(watchlistMembershipPath(slug, membershipId), {
    method: 'DELETE',
  })
}

/** Loads memberships for one watchlist, ordered by `sortOrder`, then `addedAt`, then `id`. */
export function fetchWatchlistMembershipsBySlug(slug: string): Promise<WatchlistMembership[]> {
  return fetchJson<WatchlistMembership[]>(watchlistMembershipsPath(slug))
}

/** Saves whether a membership counts toward the challenge goal. */
export function patchWatchlistMembership(
  slug: string,
  membershipId: number,
  input: UpdateWatchlistMembershipInput,
): Promise<WatchlistMembership> {
  return fetchJson<WatchlistMembership>(watchlistMembershipPath(slug, membershipId), {
    body: JSON.stringify(input),
    headers: { 'Content-Type': 'application/json' },
    method: 'PATCH',
  })
}

/** Saves a full membership id list as `sortOrder` 0..n-1. */
export function patchWatchlistMembershipOrder(
  slug: string,
  membershipIds: readonly number[],
): Promise<ReorderWatchlistMembershipsResult> {
  return fetchJson<ReorderWatchlistMembershipsResult>(watchlistMembershipReorderPath(slug), {
    body: JSON.stringify({ membershipIds }),
    headers: { 'Content-Type': 'application/json' },
    method: 'PATCH',
  })
}

// BFF path for one membership on a watchlist.
function watchlistMembershipPath(slug: string, membershipId: number): string {
  return `${watchlistMembershipsPath(slug)}/${encodeURIComponent(String(membershipId))}`
}

// BFF path that persists membership order for a watchlist.
function watchlistMembershipReorderPath(slug: string): string {
  return `${watchlistMembershipsPath(slug)}/reorder`
}

// BFF path for the membership list of a watchlist.
function watchlistMembershipsPath(slug: string): string {
  return `/api/watchlists/${encodeURIComponent(slug)}/memberships`
}
