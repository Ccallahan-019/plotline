import { useQuery, type UseQueryOptions } from '@tanstack/react-query'

import type { WatchlistCard } from '../types'

import { fetchWatchlistCards } from '../services/fetch-watchlists'
import { watchlistQueryKeys } from '../services/query-keys'

type UseWatchlistCardsOptions = {
  initialData?: WatchlistCard[]
}

/**
 * Loads watchlist cards for the watchlists page.
 *
 * The query key is `['watchlists', { view: 'cards' }]`. The object segment
 * cannot collide with a watchlist slug, and invalidating `['watchlists']` still
 * refreshes this grid. Pass server-prefetched cards as `initialData` to
 * hydrate the first paint.
 *
 * @param options.initialData - Cards from the server prefetch
 * @returns A React Query result for `WatchlistCard[]`
 */
export function useWatchlistCards(options?: UseWatchlistCardsOptions) {
  return useQuery({
    initialData: options?.initialData,
    queryFn: () => fetchWatchlistCards(),
    queryKey: watchlistQueryKeys.cards(),
  } satisfies UseQueryOptions<WatchlistCard[]>)
}
