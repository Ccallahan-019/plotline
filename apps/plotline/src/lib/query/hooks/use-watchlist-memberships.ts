import { useQuery } from "@tanstack/react-query";

import { fetchWatchlistMemberships } from "@/lib/query/services/api";
import { queryKeys } from "@/lib/query/services/keys";

type UseWatchlistMembershipsOptions = {
  enabled?: boolean;
};

export function useWatchlistMemberships(
  libraryItemId: number | undefined,
  options?: UseWatchlistMembershipsOptions,
) {
  return useQuery({
    enabled: (options?.enabled ?? true) && libraryItemId != null,
    queryFn: () => fetchWatchlistMemberships(libraryItemId as number),
    queryKey: queryKeys.watchlistMemberships(libraryItemId as number),
  });
}
