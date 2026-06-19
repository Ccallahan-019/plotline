import {
  getDefaultRuntimeRange,
  getDefaultYearRange,
  type SearchFilters,
} from "../types";

export function countActiveDiscoverFilters(filters: SearchFilters): number {
  return Object.keys(normalizeSearchFilters(filters)).length;
}

export function hasActiveDiscoverFilters(filters: SearchFilters): boolean {
  return countActiveDiscoverFilters(filters) > 0;
}

export function normalizeSearchFilters(filters: SearchFilters): SearchFilters {
  const { max: defaultYearMax, min: defaultYearMin } = getDefaultYearRange();
  const normalized: SearchFilters = {};

  if (filters.genreIds?.length) {
    normalized.genreIds = [...filters.genreIds].sort((left, right) => left - right);
  }

  if (filters.providerIds?.length) {
    normalized.providerIds = [...filters.providerIds].sort(
      (left, right) => left - right,
    );
  }

  if (
    filters.yearMin !== undefined &&
    filters.yearMin !== defaultYearMin
  ) {
    normalized.yearMin = filters.yearMin;
  }

  if (
    filters.yearMax !== undefined &&
    filters.yearMax !== defaultYearMax
  ) {
    normalized.yearMax = filters.yearMax;
  }

  if (filters.ratingMin !== undefined) {
    normalized.ratingMin = filters.ratingMin;
  }

  if (filters.ratingMax !== undefined) {
    normalized.ratingMax = filters.ratingMax;
  }

  const { max: defaultRuntimeMax, min: defaultRuntimeMin } =
    getDefaultRuntimeRange();

  if (
    filters.runtimeMin !== undefined &&
    filters.runtimeMin !== defaultRuntimeMin
  ) {
    normalized.runtimeMin = filters.runtimeMin;
  }

  if (
    filters.runtimeMax !== undefined &&
    filters.runtimeMax !== defaultRuntimeMax
  ) {
    normalized.runtimeMax = filters.runtimeMax;
  }

  return normalized;
}
