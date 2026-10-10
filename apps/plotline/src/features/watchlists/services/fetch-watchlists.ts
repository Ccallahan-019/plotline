import type { Watchlist, WatchlistMembership } from '@plotline/payload-types'

import { buildSearchParams } from '@/lib/api/build-search-params'
import { fetchJson } from '@/lib/api/fetch-json'

import type {
  RemoveWatchlistMembershipResult,
  ReorderWatchlistMembershipsResult,
  UpdateWatchlistInput,
  WatchlistCard,
} from '../types'

export type WatchlistFilters = {
  filter?: 'challenge' | 'custom' | 'system'
}

/** Removes one title from a watchlist. The library item stays. */
export function deleteWatchlistMembership(
  slug: string,
  membershipId: number,
): Promise<RemoveWatchlistMembershipResult> {
  return fetchJson<RemoveWatchlistMembershipResult>(watchlistMembershipPath(slug, membershipId), {
    method: 'DELETE',
  })
}

/** Loads one watchlist by slug from the BFF. */
export function fetchWatchlist(slug: string): Promise<Watchlist> {
  return fetchJson<Watchlist>(`/api/watchlists/${encodeURIComponent(slug)}`)
}

/** Loads watchlist cards from the BFF for the signed-in user. */
export function fetchWatchlistCards(): Promise<WatchlistCard[]> {
  return fetchJson<WatchlistCard[]>('/api/watchlist-cards')
}

/** Loads watchlist memberships for a library item from the BFF. */
export function fetchWatchlistMemberships(libraryItemId: number): Promise<WatchlistMembership[]> {
  return fetchJson<WatchlistMembership[]>(
    `/api/watchlist-memberships${buildSearchParams({ libraryItemId })}`,
  )
}

/** Loads memberships for one watchlist, ordered by `sortOrder`, then `addedAt`, then `id`. */
export function fetchWatchlistMembershipsBySlug(slug: string): Promise<WatchlistMembership[]> {
  return fetchJson<WatchlistMembership[]>(watchlistMembershipsPath(slug))
}

/** Loads the signed-in user's watchlists from the BFF. */
export function fetchWatchlists(filters?: WatchlistFilters): Promise<Watchlist[]> {
  return fetchJson<Watchlist[]>(
    `/api/watchlists${buildSearchParams({
      filter: filters?.filter,
    })}`,
  )
}

/** Saves the name, description, and visibility of one watchlist. The slug stays the same. */
export function patchWatchlist(slug: string, input: UpdateWatchlistInput): Promise<Watchlist> {
  return fetchJson<Watchlist>(`/api/watchlists/${encodeURIComponent(slug)}`, {
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
