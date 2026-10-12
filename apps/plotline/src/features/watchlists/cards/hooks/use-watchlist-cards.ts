import { useQuery, type UseQueryOptions } from '@tanstack/react-query'

import type { WatchlistCard, WatchlistCardFilter } from '../types'

import { watchlistQueryKeys } from '../../services/query-keys'
import { fetchWatchlistCards } from '../services/fetch-watchlist-cards'

type UseWatchlistCardsOptions = {
  filter: WatchlistCardFilter
  initialData?: WatchlistCard[]
}

/**
 * Loads watchlist or challenge cards for an index page.
 *
 * The query key is `['watchlists', { filter, view: 'cards' }]`. `filter` keeps
 * the watchlists index and the challenges index in separate caches, and
 * invalidating `['watchlists']` still refreshes both. Pass server-prefetched
 * cards as `initialData` to hydrate the first paint.
 *
 * @param options.filter - `list` omits challenges. `challenge` is challenge lists only
 * @param options.initialData - Cards from the server prefetch for this filter
 * @returns A React Query result for `WatchlistCard[]`
 */
export function useWatchlistCards(options: UseWatchlistCardsOptions) {
  return useQuery({
    initialData: options.initialData,
    queryFn: () => fetchWatchlistCards(options.filter),
    queryKey: watchlistQueryKeys.cards(options.filter),
  } satisfies UseQueryOptions<WatchlistCard[]>)
}
