import type { Watchlist } from '@plotline/payload-types'

import { fetchJson } from '@/lib/api/fetch-json'

import type { WatchlistWriteInput } from './watchlist-write'

/** Saves a watchlist's details. The slug stays the same. */
export function patchWatchlist(slug: string, input: WatchlistWriteInput): Promise<Watchlist> {
  return fetchJson<Watchlist>(`/api/watchlists/${encodeURIComponent(slug)}`, {
    body: JSON.stringify(input),
    headers: { 'Content-Type': 'application/json' },
    method: 'PATCH',
  })
}

/** Creates an owned watchlist. The response includes the generated slug. */
export function postWatchlist(input: WatchlistWriteInput): Promise<Watchlist> {
  return fetchJson<Watchlist>('/api/watchlists', {
    body: JSON.stringify(input),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  })
}
