import type { QueryClient } from '@tanstack/react-query'

export function invalidateAfterCreateWatchlist(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: ['watchlists'] })
}
