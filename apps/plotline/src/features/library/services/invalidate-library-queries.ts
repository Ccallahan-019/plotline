import type { QueryClient } from '@tanstack/react-query'

import { watchlistQueryKeys } from '@/features/watchlists/services/query-keys'

/**
 * Refreshes library, watch-event, and watchlist queries after a library write.
 *
 * The `library-items` prefix includes watched-episode keys
 * (`['library-items', id, 'watched-episodes']`), so TV log-watch refetches episode
 * coverage along with the grid.
 *
 * @param queryClient - React Query client holding library caches
 * @param options.watchlistSlug - Single watchlist to refresh in addition to the list queries
 * @param options.watchlistSlugs - Watchlists to refresh in addition to the list queries
 */
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

// Refreshes review lists and library rows that embed review state.
export function invalidateAfterReviewMutation(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: ['reviews'] })
  void queryClient.invalidateQueries({ queryKey: ['library-items'] })
}
