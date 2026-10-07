import type { Watchlist, WatchlistMembership } from '@plotline/payload-types'

import { buildSearchParams } from '@/lib/api/build-search-params'
import { fetchJson } from '@/lib/api/fetch-json'

import type { WatchlistCard } from '../types'

export type WatchlistFilters = {
  filter?: 'challenge' | 'custom' | 'system'
}

/** Loads one watchlist by slug from the BFF. */
export function fetchWatchlist(slug: string): Promise<Watchlist> {
  return fetchJson<Watchlist>(`/api/watchlists/${encodeURIComponent(slug)}`)
}

/** Loads watchlist cards from the BFF for the signed-in user. */
export function fetchWatchlistCards(): Promise<WatchlistCard[]> {
  return fetchJson<WatchlistCard[]>('/api/watchlists/cards')
}

/** Loads watchlist memberships for a library item from the BFF. */
export function fetchWatchlistMemberships(libraryItemId: number): Promise<WatchlistMembership[]> {
  return fetchJson<WatchlistMembership[]>(
    `/api/watchlist-memberships${buildSearchParams({ libraryItemId })}`,
  )
}

/** Loads the signed-in user's watchlists from the BFF. */
export function fetchWatchlists(filters?: WatchlistFilters): Promise<Watchlist[]> {
  return fetchJson<Watchlist[]>(
    `/api/watchlists${buildSearchParams({
      filter: filters?.filter,
    })}`,
  )
}
