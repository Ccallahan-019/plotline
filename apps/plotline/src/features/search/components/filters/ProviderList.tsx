"use client";

import { useSearchFilters } from "../../providers/SearchFiltersProvider";
import { sortGenresWithSelectedFirst } from "../../services/get-genres";
import { WatchProvider } from "../../types";
import { FilterCheckbox } from "./FilterCheckbox";

type ProviderListProps = {
  providerList: WatchProvider[];
};

export function ProviderList({ providerList }: ProviderListProps) {
  const { draftFilters, setDraftFilters } = useSearchFilters();

  const selectedProviderIds = draftFilters.providerIds ?? [];

  const toggleProvider = (providerId: number, checked: boolean) => {
    setDraftFilters({
      ...draftFilters,
      providerIds: checked
        ? [...selectedProviderIds, providerId]
        : selectedProviderIds.filter((id) => id !== providerId),
    });
  };

  const sortedProviderList = sortGenresWithSelectedFirst(
    providerList,
    selectedProviderIds,
  );

  return sortedProviderList.map((provider) => (
    <FilterCheckbox
      fieldIdPrefix="provider"
      filterItem={provider}
      isChecked={selectedProviderIds.includes(provider.id)}
      key={provider.id}
      onToggle={toggleProvider}
    />
  ));
}
