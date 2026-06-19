export type BrowseMode = "discover" | "search";

export type SearchMediaType = "movie" | "tv";

export const DEFAULT_SEARCH_MEDIA_TYPE: SearchMediaType = "movie";

export type SearchFilters = {
  genreIds?: number[];
  providerIds?: number[];
  ratingMax?: number;
  ratingMin?: number;
  runtimeMax?: number;
  runtimeMin?: number;
  yearMax?: number;
  yearMin?: number;
};

export const RUNTIME_RANGE_MIN = 0;
export const RUNTIME_RANGE_MAX = 240;

export function formatRuntimeLabel(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
}

export function getDefaultRuntimeRange(): { max: number; min: number } {
  return {
    max: RUNTIME_RANGE_MAX,
    min: RUNTIME_RANGE_MIN,
  };
}

export const YEAR_RANGE_MIN = 1950;

export function getCurrentYear(): number {
  return new Date().getFullYear();
}

export function getDefaultYearRange(): { max: number; min: number } {
  return {
    max: getCurrentYear(),
    min: YEAR_RANGE_MIN,
  };
}

export const DEFAULT_SEARCH_FILTERS: SearchFilters = {};

export const SEARCH_SORT_OPTIONS = [
  { label: "Popularity", value: "popularity" },
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
  { label: "Top Rated", value: "rating" },
] as const;

export type SearchSort = (typeof SEARCH_SORT_OPTIONS)[number]["value"];

export const DEFAULT_SEARCH_SORT: SearchSort = "popularity";

export type FilterBadge = {
  key: string;
  label: string;
  prefix: string;
};

export type Genre = { id: number; name: string };

export type TmdbGenresResponse = {
  movie: { id: number; name: string }[];
  tv: { id: number; name: string }[];
};

export type TmdbWatchProvidersResponse = {
  providers: WatchProvider[];
  region: string;
};

export type WatchProvider = {
  id: number;
  logoPath?: null | string;
  name: string;
};

export function getSearchSortLabel(sort: SearchSort): string {
  return (
    SEARCH_SORT_OPTIONS.find((option) => option.value === sort)?.label ??
    "Popularity"
  );
}
