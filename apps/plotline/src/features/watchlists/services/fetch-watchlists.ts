import type { Watchlist, WatchlistMembership } from '@plotline/payload-types'

import { buildSearchParams } from '@/lib/api/build-search-params'
import { fetchJson } from '@/lib/api/fetch-json'

export type WatchlistFilters = {
  filter?: 'challenge' | 'custom' | 'system'
}

export function fetchWatchlist(slug: string): Promise<Watchlist> {
  return fetchJson<Watchlist>(`/api/watchlists/${encodeURIComponent(slug)}`)
}

export function fetchWatchlistMemberships(libraryItemId: number): Promise<WatchlistMembership[]> {
  return fetchJson<WatchlistMembership[]>(
    `/api/watchlist-memberships${buildSearchParams({ libraryItemId })}`,
  )
}

export function fetchWatchlists(filters?: WatchlistFilters): Promise<Watchlist[]> {
  return fetchJson<Watchlist[]>(
    `/api/watchlists${buildSearchParams({
      filter: filters?.filter,
    })}`,
  )
}
