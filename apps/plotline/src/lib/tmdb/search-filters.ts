import type { BrowseMode, SearchFilters, SearchMediaType, SearchSort } from "@/features/search/types";

import { DEFAULT_SEARCH_SORT } from "@/features/search/types";

export const MIN_TMDB_QUERY_LENGTH = 2;

export function isBrowseRequestEnabled(
  mode: BrowseMode,
  query: string,
): boolean {
  if (mode === "discover") {
    return true;
  }

  return query.length >= MIN_TMDB_QUERY_LENGTH;
}

export function parseBrowseMode(value: null | string): BrowseMode {
  return value === "search" ? "search" : "discover";
}

export function parseMediaType(value: null | string): SearchMediaType {
  return value === "tv" ? "tv" : "movie";
}

export function parseSearchFilters(
  searchParams: URLSearchParams,
): SearchFilters {
  const genreIdsRaw = searchParams.get("genreIds");
  const genreIds = genreIdsRaw
    ? genreIdsRaw
        .split(",")
        .map((value) => Number(value.trim()))
        .filter((value) => !Number.isNaN(value))
    : undefined;

  const providerIdsRaw = searchParams.get("providerIds");
  const providerIds = providerIdsRaw
    ? providerIdsRaw
        .split(",")
        .map((value) => Number(value.trim()))
        .filter((value) => !Number.isNaN(value))
    : undefined;

  return {
    genreIds: genreIds?.length ? genreIds : undefined,
    providerIds: providerIds?.length ? providerIds : undefined,
    ratingMax: parseOptionalNumber(searchParams.get("ratingMax")),
    ratingMin: parseOptionalNumber(searchParams.get("ratingMin")),
    runtimeMax: parseOptionalNumber(searchParams.get("runtimeMax")),
    runtimeMin: parseOptionalNumber(searchParams.get("runtimeMin")),
    yearMax: parseOptionalNumber(searchParams.get("yearMax")),
    yearMin: parseOptionalNumber(searchParams.get("yearMin")),
  };
}

export function parseSearchSort(value: null | string): SearchSort {
  switch (value) {
    case "newest":
    case "oldest":
    case "rating":
      return value;
    case "popularity":
    default:
      return DEFAULT_SEARCH_SORT;
  }
}

function parseOptionalNumber(value: null | string): number | undefined {
  if (value === null || value?.trim() === "") {
    return undefined;
  }

  const parsed = Number(value);

  return Number.isNaN(parsed) ? undefined : parsed;
}
