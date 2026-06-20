import type { QueryClient } from '@tanstack/react-query'

import { watchlistQueryKeys } from '@/features/watchlists/services/query-keys'

export function invalidateAfterLibraryMutation(
  queryClient: QueryClient,
  options?: { watchlistSlug?: string; watchlistSlugs?: string[] },
) {
  void queryClient.invalidateQueries({ queryKey: ['library-items'] })
  void queryClient.invalidateQueries({ queryKey: ['watch-events'] })
  void queryClient.invalidateQueries({ queryKey: ['watchlists'] })
  void queryClient.invalidateQueries({ queryKey: ['watchlist-memberships'] })

  const watchlistSlugs = [
    ...new Set(
      [
        ...(options?.watchlistSlugs ?? []),
        ...(options?.watchlistSlug ? [options.watchlistSlug] : []),
      ].filter(Boolean),
    ),
  ]

  for (const slug of watchlistSlugs) {
    void queryClient.invalidateQueries({
      queryKey: watchlistQueryKeys.watchlist(slug),
    })
  }
}

export function invalidateAfterReviewMutation(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: ['reviews'] })
  void queryClient.invalidateQueries({ queryKey: ['library-items'] })
}
