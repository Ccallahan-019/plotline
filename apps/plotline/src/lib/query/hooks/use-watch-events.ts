import type { WatchEvent } from "@plotline/payload-types";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { fetchWatchEvents } from "@/lib/query/services/api";
import { queryKeys, type WatchEventFilters } from "@/lib/query/services/keys";

type UseWatchEventsOptions = {
  initialData?: WatchEvent[];
};

export function useWatchEvents(
  filters?: WatchEventFilters,
  options?: UseWatchEventsOptions,
) {
  return useQuery({
    initialData: options?.initialData,
    queryFn: () => fetchWatchEvents(filters),
    queryKey: queryKeys.watchEvents(filters),
  } satisfies UseQueryOptions<WatchEvent[]>);
}
