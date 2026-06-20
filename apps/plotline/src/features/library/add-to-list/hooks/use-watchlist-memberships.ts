import { useQuery } from '@tanstack/react-query'

import { fetchWatchlistMemberships } from '@/features/watchlists/services/fetch-watchlists'
import { watchlistQueryKeys } from '@/features/watchlists/services/query-keys'

type UseWatchlistMembershipsOptions = {
  enabled?: boolean
}

export function useWatchlistMemberships(
  libraryItemId: number | undefined,
  options?: UseWatchlistMembershipsOptions,
) {
  return useQuery({
    enabled: (options?.enabled ?? true) && libraryItemId != null,
    queryFn: () => fetchWatchlistMemberships(libraryItemId as number),
    queryKey: watchlistQueryKeys.watchlistMemberships(libraryItemId as number),
  })
}
