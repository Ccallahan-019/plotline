import type { Watchlist } from '@plotline/payload-types'

import { useQuery, type UseQueryOptions } from '@tanstack/react-query'

import { fetchWatchlists } from '../services/fetch-watchlists'
import { type WatchlistFilters, watchlistQueryKeys } from '../services/query-keys'

type UseWatchlistsOptions = {
  initialData?: Watchlist[]
}

export function useWatchlists(filters?: WatchlistFilters, options?: UseWatchlistsOptions) {
  return useQuery({
    initialData: options?.initialData,
    queryFn: () => fetchWatchlists(filters),
    queryKey: watchlistQueryKeys.watchlists(filters),
  } satisfies UseQueryOptions<Watchlist[]>)
}
