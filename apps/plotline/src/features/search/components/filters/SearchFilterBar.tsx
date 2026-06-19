"use client";

import { ShowIf } from "@/components/utils/ShowIf";

import { useBrowseMode } from "../../providers/BrowseModeProvider";
import { useSearchFilters } from "../../providers/SearchFiltersProvider";
import { useTmdbGenres } from "../../providers/TmdbGenresProvider";
import { useTmdbWatchProviders } from "../../providers/TmdbWatchProvidersProvider";
import { getFilterBadges } from "../../services/get-filter-badges";
import { ClearAllFiltersButton } from "./ClearAllFiltersButton";
import { NoFiltersBadge } from "./NoFiltersBadge";
import { SearchFilterBadge } from "./SearchFilterBadge";
import { SearchFilters } from "./SearchFilters";
import { ShowFiltersButton } from "./ShowFiltersButton";

export function SearchFilterBar() {
  const { appliedFilters } = useSearchFilters();
  const { genreNameById } = useTmdbGenres();
  const { providerNameById } = useTmdbWatchProviders();
  const { mode } = useBrowseMode();

  const isDiscoverMode = mode === "discover";

  const badges = getFilterBadges(
    appliedFilters,
    genreNameById,
    providerNameById,
  );
  const hasFilters = badges.length > 0;

  if (!isDiscoverMode) return null;

  return (
    <div className="flex flex-wrap items-center gap-4">
      <SearchFilters />
      <div className="flex flex-1 items-center flex-wrap gap-2">
        <ShowIf condition={!hasFilters}>
          <NoFiltersBadge />
        </ShowIf>

        {badges.map((badge) => (
          <SearchFilterBadge badge={badge} key={badge.key} />
        ))}

        <ClearAllFiltersButton
          badgeVariant="outline"
          className="rounded-full"
          showBadge={false}
          size="default"
        />
      </div>

      <ShowFiltersButton />
    </div>
  );
}
