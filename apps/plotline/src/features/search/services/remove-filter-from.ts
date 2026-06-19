import type { SearchFilters } from "../types";

import { normalizeSearchFilters } from "./normalize-search-filters";

export function removeFilterFrom(
  filters: SearchFilters,
  key: string,
): SearchFilters {
  const next = { ...filters };

  if (key === "genres") {
    delete next.genreIds;
  }

  if (key === "streaming") {
    delete next.providerIds;
  }

  if (key === "year") {
    delete next.yearMin;
    delete next.yearMax;
  }

  if (key === "rating") {
    delete next.ratingMin;
    delete next.ratingMax;
  }

  if (key === "runtime") {
    delete next.runtimeMin;
    delete next.runtimeMax;
  }

  return normalizeSearchFilters(next);
}
