import { useOpenState } from "@/providers/OpenStateProvider";

import { useFilterErrors } from "../providers/FilterErrorsProvider";
import { useSearchFilters } from "../providers/SearchFiltersProvider";
import { useTmdbBrowse } from "../providers/TmdbBrowseProvider";

export function useApplySearchFilters() {
  const { setIsOpen } = useOpenState();
  const { applyDraft, draftFilters } = useSearchFilters();
  const { setRatingError, setRuntimeError } = useFilterErrors();
  const { setPage } = useTmdbBrowse();

  const handleApply = () => {
    const ratingMin = draftFilters.ratingMin;
    const ratingMax = draftFilters.ratingMax;
    const runtimeMin = draftFilters.runtimeMin;
    const runtimeMax = draftFilters.runtimeMax;

    const ratingInvalid =
      ratingMin !== undefined &&
      ratingMax !== undefined &&
      ratingMin > ratingMax;

    const runtimeInvalid =
      runtimeMin !== undefined &&
      runtimeMax !== undefined &&
      runtimeMin > runtimeMax;

    setRatingError(
      ratingInvalid
        ? "Minimum rating must be less than or equal to maximum."
        : null,
    );

    setRuntimeError(
      runtimeInvalid
        ? "Minimum runtime must be less than or equal to maximum."
        : null,
    );

    if (ratingInvalid || runtimeInvalid) {
      return;
    }

    applyDraft();
    setPage(1);
    setIsOpen(false);
  };

  return {
    handleApply,
  };
}
