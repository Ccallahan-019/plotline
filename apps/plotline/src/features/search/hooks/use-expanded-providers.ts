import { useState } from "react";

import { useSearchFilters } from "../providers/SearchFiltersProvider";
import {
  getHiddenGenres as getHiddenProviders,
  getVisibleGenres as getVisibleProviders,
} from "../services/get-genres";
import { WatchProvider } from "../types";

type UseExpandedProvidersProps = {
  providers: WatchProvider[];
};

export function useExpandedProviders({ providers }: UseExpandedProvidersProps) {
  const { draftFilters } = useSearchFilters();
  const selectedProviderIds = draftFilters.providerIds ?? [];

  const [expanded, setExpanded] = useState(false);

  const visibleProviders = getVisibleProviders(providers, selectedProviderIds);
  const hiddenProviders = getHiddenProviders(visibleProviders, providers);
  const hasHiddenProviders = hiddenProviders.length > 0;
  const triggerText = expanded
    ? "Show less"
    : `Show all ${providers.length} services`;

  return {
    expanded,
    hasHiddenProviders,
    hiddenProviders,
    setExpanded,
    triggerText,
    visibleProviders,
  };
}
