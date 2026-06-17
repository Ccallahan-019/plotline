import type { Watchlist } from "@plotline/payload-types";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { fetchWatchlists } from "@/lib/query/services/api";
import { queryKeys, type WatchlistFilters } from "@/lib/query/services/keys";

type UseWatchlistsOptions = {
  initialData?: Watchlist[];
};

export function useWatchlists(
  filters?: WatchlistFilters,
  options?: UseWatchlistsOptions,
) {
  return useQuery({
    initialData: options?.initialData,
    queryFn: () => fetchWatchlists(filters),
    queryKey: queryKeys.watchlists(filters),
  } satisfies UseQueryOptions<Watchlist[]>);
}
