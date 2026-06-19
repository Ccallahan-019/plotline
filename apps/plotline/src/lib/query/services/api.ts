import type {
  LibraryItem,
  Review,
  WatchEvent,
  Watchlist,
  WatchlistMembership,
} from "@plotline/payload-types";
import type { TmdbSearchResponse } from "@plotline/shared/tmdb";

import type {
  LibraryFilters,
  ReviewFilters,
  WatchEventFilters,
  WatchlistFilters,
} from "@/lib/query/services/keys";

import {
  type BrowseMode,
  DEFAULT_SEARCH_FILTERS,
  type SearchFilters,
  type SearchMediaType,
  type SearchSort,
  type TmdbGenresResponse,
  type TmdbWatchProvidersResponse,
} from "@/features/search/types";
import { fetchJson } from "@/lib/api/fetch-json";
import {
  type AddToListInput,
  type AddToListResult,
  hasAddToListTmdbRef,
  type LogWatchInput,
  type LogWatchResult,
} from "@/lib/payload/types/library-mutations";

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

export function fetchReviews(filters?: ReviewFilters): Promise<Review[]> {
  return fetchJson<Review[]>(
    `/api/reviews${buildSearchParams({
      hasBody:
        filters?.hasBody === undefined ? undefined : String(filters.hasBody),
    })}`,
  );
}

export function fetchTmdbBrowse(
  mode: BrowseMode,
  q: string,
  mediaType: SearchMediaType,
  filters: SearchFilters,
  sort: SearchSort,
  page = 1,
): Promise<TmdbSearchResponse> {
  return fetchJson<TmdbSearchResponse>(
    `/api/tmdb/search${buildSearchParams({
      genreIds: filters.genreIds?.join(","),
      mediaType,
      mode,
      page,
      providerIds: filters.providerIds?.join(","),
      q: mode === "search" ? q || undefined : undefined,
      ratingMax: filters.ratingMax,
      ratingMin: filters.ratingMin,
      runtimeMax: filters.runtimeMax,
      runtimeMin: filters.runtimeMin,
      sort,
      yearMax: filters.yearMax,
      yearMin: filters.yearMin,
    })}`,
  );
}

export function fetchTmdbGenres(): Promise<TmdbGenresResponse> {
  return fetchJson<TmdbGenresResponse>("/api/tmdb/genres");
}

export function fetchTmdbSearch(
  q: string,
  page = 1,
  mediaType: SearchMediaType = "movie",
): Promise<TmdbSearchResponse> {
  return fetchTmdbBrowse(
    "search",
    q,
    mediaType,
    DEFAULT_SEARCH_FILTERS,
    "popularity",
    page,
  );
}

export function fetchTmdbWatchProviders(
  mediaType: SearchMediaType,
): Promise<TmdbWatchProvidersResponse> {
  return fetchJson<TmdbWatchProvidersResponse>(
    `/api/tmdb/watch-providers${buildSearchParams({ mediaType })}`,
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

export function fetchWatchlistMemberships(
  libraryItemId: number,
): Promise<WatchlistMembership[]> {
  return fetchJson<WatchlistMembership[]>(
    `/api/watchlist-memberships${buildSearchParams({ libraryItemId })}`,
  );
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

export async function postAddToLists(
  inputs: AddToListInput[],
): Promise<AddToListResult[]> {
  const usesTmdbRef = inputs.some(hasAddToListTmdbRef);

  if (!usesTmdbRef) {
    return Promise.all(inputs.map((input) => postAddToList(input)));
  }

  const results: AddToListResult[] = [];
  let mediaId: number | string | undefined;

  for (const input of inputs) {
    const requestInput =
      mediaId != null ? toMediaIdAddToListInput(input, mediaId) : input;
    const result = await postAddToList(requestInput);
    results.push(result);
    mediaId ??= getMediaIdFromAddToListResult(result);
  }

  return results;
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

function getMediaIdFromAddToListResult(
  result: AddToListResult,
): number | string | undefined {
  const media = result.libraryItem.media;

  if (typeof media === "object" && media != null) {
    return media.id;
  }

  return media;
}

function toMediaIdAddToListInput(
  input: AddToListInput,
  mediaId: number | string,
): AddToListInput {
  return {
    mediaId,
    note: input.note,
    status: input.status,
    watchlistId: input.watchlistId,
    watchlistSlug: input.watchlistSlug,
  };
}
