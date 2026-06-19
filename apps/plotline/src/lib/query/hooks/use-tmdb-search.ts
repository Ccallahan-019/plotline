import type { TmdbSearchResponse } from "@plotline/shared/tmdb";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import {
  DEFAULT_SEARCH_FILTERS,
  DEFAULT_SEARCH_MEDIA_TYPE,
  DEFAULT_SEARCH_SORT,
  type SearchMediaType,
} from "@/features/search/types";
import { fetchTmdbSearch } from "@/lib/query/services/api";
import { queryKeys } from "@/lib/query/services/keys";
import { isBrowseRequestEnabled } from "@/lib/tmdb/search-filters";

const DEBOUNCE_MS = 300;

type UseTmdbSearchOptions = {
  debounceMs?: number;
  enabled?: boolean;
  mediaType?: SearchMediaType;
  page?: number;
};

export function useTmdbSearch(query: string, options?: UseTmdbSearchOptions) {
  const page = options?.page ?? 1;
  const debounceMs = options?.debounceMs ?? DEBOUNCE_MS;
  const mediaType = options?.mediaType ?? DEFAULT_SEARCH_MEDIA_TYPE;
  const [debouncedQuery, setDebouncedQuery] = useState(query.trim());

  useEffect(() => {
    const trimmed = query.trim();
    const timer = window.setTimeout(
      () => setDebouncedQuery(trimmed),
      debounceMs,
    );

    return () => window.clearTimeout(timer);
  }, [debounceMs, query]);

  const enabled =
    (options?.enabled ?? true) &&
    isBrowseRequestEnabled("search", debouncedQuery);

  return useQuery<TmdbSearchResponse>({
    enabled,
    queryFn: () => fetchTmdbSearch(debouncedQuery, page, mediaType),
    queryKey: queryKeys.tmdbSearch(
      "search",
      debouncedQuery,
      mediaType,
      DEFAULT_SEARCH_FILTERS,
      DEFAULT_SEARCH_SORT,
      page,
    ),
  });
}
