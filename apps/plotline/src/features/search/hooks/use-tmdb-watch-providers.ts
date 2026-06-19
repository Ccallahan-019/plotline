import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import type { SearchMediaType } from "@/features/search/types";

import { fetchTmdbWatchProviders } from "@/lib/query/services/api";
import { queryKeys } from "@/lib/query/services/keys";

export function useTmdbWatchProviders(mediaType: SearchMediaType) {
  const query = useQuery({
    queryFn: () => fetchTmdbWatchProviders(mediaType),
    queryKey: queryKeys.tmdbWatchProviders(mediaType),
    staleTime: 1000 * 60 * 60 * 24,
  });

  const providerNameById = useMemo(() => {
    const map = new Map<number, string>();

    for (const provider of query.data?.providers ?? []) {
      map.set(provider.id, provider.name);
    }

    return map;
  }, [query.data]);

  return {
    ...query,
    providerNameById,
    providers: query.data?.providers ?? [],
    region: query.data?.region,
  };
}
