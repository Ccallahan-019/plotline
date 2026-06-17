import type { TmdbSearchResponse } from "@plotline/shared/tmdb";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { fetchTmdbSearch } from "@/lib/query/services/api";
import { queryKeys } from "@/lib/query/services/keys";

const DEBOUNCE_MS = 300;

type UseTmdbSearchOptions = {
  debounceMs?: number;
  enabled?: boolean;
  page?: number;
};

export function useTmdbSearch(query: string, options?: UseTmdbSearchOptions) {
  const page = options?.page ?? 1;
  const debounceMs = options?.debounceMs ?? DEBOUNCE_MS;
  const [debouncedQuery, setDebouncedQuery] = useState(query.trim());

  useEffect(() => {
    const trimmed = query.trim();
    const timer = window.setTimeout(
      () => setDebouncedQuery(trimmed),
      debounceMs,
    );

    return () => window.clearTimeout(timer);
  }, [debounceMs, query]);

  const enabled = (options?.enabled ?? true) && debouncedQuery.length > 0;

  return useQuery<TmdbSearchResponse>({
    enabled,
    queryFn: () => fetchTmdbSearch(debouncedQuery, page),
    queryKey: queryKeys.tmdbSearch(debouncedQuery, page),
  });
}
