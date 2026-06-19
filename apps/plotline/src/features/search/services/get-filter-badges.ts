import { FilterBadge } from "../types";
import {
  formatRuntimeLabel,
  getDefaultRuntimeRange,
  getDefaultYearRange,
  SearchFilters,
} from "../types";

export function getFilterBadges(
  appliedFilters: SearchFilters,
  genreNameById: Map<number, string>,
  providerNameById: Map<number, string>,
) {
  const badges: FilterBadge[] = [];

  if (appliedFilters.genreIds?.length) {
    const genreLabels = appliedFilters.genreIds.map(
      (genreId) => genreNameById.get(genreId) ?? `Genre ${genreId}`,
    );
    badges.push({
      key: "genres",
      label: genreLabels.join(", "),
      prefix: "Genres",
    });
  }

  if (appliedFilters.providerIds?.length) {
    const providerLabels = appliedFilters.providerIds.map(
      (providerId) =>
        providerNameById.get(providerId) ?? `Provider ${providerId}`,
    );
    badges.push({
      key: "streaming",
      label: providerLabels.join(", "),
      prefix: "Streaming",
    });
  }

  if (
    appliedFilters.yearMin !== undefined ||
    appliedFilters.yearMax !== undefined
  ) {
    const { max: defaultYearMax, min: defaultYearMin } = getDefaultYearRange();
    const min = appliedFilters.yearMin ?? defaultYearMin;
    const max = appliedFilters.yearMax ?? defaultYearMax;
    badges.push({ key: "year", label: `${min}–${max}`, prefix: "Year" });
  }

  if (
    appliedFilters.ratingMin !== undefined ||
    appliedFilters.ratingMax !== undefined
  ) {
    const min = appliedFilters.ratingMin ?? 0;
    const max = appliedFilters.ratingMax ?? 10;
    badges.push({ key: "rating", label: `${min}–${max}`, prefix: "Rating" });
  }

  if (
    appliedFilters.runtimeMin !== undefined ||
    appliedFilters.runtimeMax !== undefined
  ) {
    const { max: defaultRuntimeMax, min: defaultRuntimeMin } =
      getDefaultRuntimeRange();
    const min = appliedFilters.runtimeMin ?? defaultRuntimeMin;
    const max = appliedFilters.runtimeMax ?? defaultRuntimeMax;
    badges.push({
      key: "runtime",
      label: `${formatRuntimeLabel(min)}–${formatRuntimeLabel(max)}`,
      prefix: "Runtime",
    });
  }

  return badges;
}
