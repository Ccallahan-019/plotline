import type { QueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query/services/keys";

export function invalidateAfterCreateWatchlist(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: ["watchlists"] });
}

export function invalidateAfterLibraryMutation(
  queryClient: QueryClient,
  options?: { watchlistSlug?: string; watchlistSlugs?: string[] },
) {
  void queryClient.invalidateQueries({ queryKey: ["library-items"] });
  void queryClient.invalidateQueries({ queryKey: ["watch-events"] });
  void queryClient.invalidateQueries({ queryKey: ["watchlists"] });
  void queryClient.invalidateQueries({ queryKey: ["watchlist-memberships"] });

  const watchlistSlugs = [
    ...new Set(
      [
        ...(options?.watchlistSlugs ?? []),
        ...(options?.watchlistSlug ? [options.watchlistSlug] : []),
      ].filter(Boolean),
    ),
  ];

  for (const slug of watchlistSlugs) {
    void queryClient.invalidateQueries({
      queryKey: queryKeys.watchlist(slug),
    });
  }
}

export function invalidateAfterReviewMutation(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: ["reviews"] });
  void queryClient.invalidateQueries({ queryKey: ["library-items"] });
}
