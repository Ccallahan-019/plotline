import type {
  LibraryItem,
  WatchEvent,
  Watchlist,
} from "@plotline/payload-types";
import type { TmdbSearchResponse } from "@plotline/shared/tmdb";

import type {
  AddToListInput,
  AddToListResult,
  LogWatchInput,
  LogWatchResult,
} from "@/lib/payload/types/library-mutations";
import type {
  LibraryFilters,
  WatchEventFilters,
  WatchlistFilters,
} from "@/lib/query/services/keys";

import { fetchJson } from "@/lib/api/fetch-json";

export function fetchLibraryItems(
  filters?: LibraryFilters,
): Promise<LibraryItem[]> {
  return fetchJson<LibraryItem[]>(
    `/api/library-items${buildSearchParams({
      mediaType: filters?.mediaType,
      status: filters?.status,
    })}`,
  );
}

export function fetchTmdbSearch(
  q: string,
  page = 1,
): Promise<TmdbSearchResponse> {
  return fetchJson<TmdbSearchResponse>(
    `/api/tmdb/search${buildSearchParams({ page, q })}`,
  );
}

export function fetchWatchEvents(
  filters?: WatchEventFilters,
): Promise<WatchEvent[]> {
  return fetchJson<WatchEvent[]>(
    `/api/watch-events${buildSearchParams({
      limit: filters?.limit,
      sort: filters?.sort,
    })}`,
  );
}

export function fetchWatchlist(slug: string): Promise<Watchlist> {
  return fetchJson<Watchlist>(`/api/watchlists/${encodeURIComponent(slug)}`);
}

export function fetchWatchlists(
  filters?: WatchlistFilters,
): Promise<Watchlist[]> {
  return fetchJson<Watchlist[]>(
    `/api/watchlists${buildSearchParams({
      filter: filters?.filter,
    })}`,
  );
}

export function postAddToList(input: AddToListInput): Promise<AddToListResult> {
  return fetchJson<AddToListResult>("/api/library/add-to-list", {
    body: JSON.stringify(input),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
}

export function postLogWatch(input: LogWatchInput): Promise<LogWatchResult> {
  return fetchJson<LogWatchResult>("/api/library/log-watch", {
    body: JSON.stringify(input),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
}

function buildSearchParams(
  filters: Record<string, number | string | undefined>,
): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined) {
      params.set(key, String(value));
    }
  }

  const query = params.toString();

  return query ? `?${query}` : "";
}
