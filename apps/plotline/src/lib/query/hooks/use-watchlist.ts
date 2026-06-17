import type { Watchlist } from "@plotline/payload-types";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { fetchWatchlist } from "@/lib/query/services/api";
import { queryKeys } from "@/lib/query/services/keys";

type UseWatchlistOptions = {
  initialData?: Watchlist;
};

export function useWatchlist(slug: string, options?: UseWatchlistOptions) {
  return useQuery({
    enabled: slug.length > 0,
    initialData: options?.initialData,
    queryFn: () => fetchWatchlist(slug),
    queryKey: queryKeys.watchlist(slug),
  } satisfies UseQueryOptions<Watchlist>);
}
