import type { Watchlist } from '@plotline/payload-types'

import { useQuery, type UseQueryOptions } from '@tanstack/react-query'

import { fetchWatchlist } from '../services/fetch-watchlists'
import { watchlistQueryKeys } from '../services/query-keys'

type UseWatchlistOptions = {
  initialData?: Watchlist
}

export function useWatchlist(slug: string, options?: UseWatchlistOptions) {
  return useQuery({
    enabled: slug.length > 0,
    initialData: options?.initialData,
    queryFn: () => fetchWatchlist(slug),
    queryKey: watchlistQueryKeys.watchlist(slug),
  } satisfies UseQueryOptions<Watchlist>)
}
