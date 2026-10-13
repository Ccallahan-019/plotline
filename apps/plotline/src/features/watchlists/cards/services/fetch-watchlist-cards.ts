import { buildSearchParams } from '@/lib/api/build-search-params'
import { fetchJson } from '@/lib/api/fetch-json'

import type { WatchlistCard, WatchlistCardFilter } from '../types'

/** Loads cards for one index. `list` omits challenges; `challenge` is challenge lists only. */
export function fetchWatchlistCards(filter: WatchlistCardFilter): Promise<WatchlistCard[]> {
  return fetchJson<WatchlistCard[]>(`/api/watchlist-cards${buildSearchParams({ filter })}`)
}
