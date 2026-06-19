"use client";

import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useState,
} from "react";

import { normalizeSearchFilters } from "../services/normalize-search-filters";
import { removeFilterFrom } from "../services/remove-filter-from";
import { DEFAULT_SEARCH_FILTERS, SearchFilters } from "../types";

type SearchFiltersContextValue = {
  appliedFilters: SearchFilters;
  applyDraft: () => void;
  clearAll: () => void;
  clearGenreFilters: () => void;
  clearProviderFilters: () => void;
  draftFilters: SearchFilters;
  removeFilter: (key: string) => void;
  setDraftFilters: (filters: SearchFilters) => void;
};

const SearchFiltersContext = createContext<null | SearchFiltersContextValue>(
  null,
);

export function SearchFiltersProvider({ children }: PropsWithChildren) {
  const [appliedFilters, setAppliedFilters] = useState<SearchFilters>(
    DEFAULT_SEARCH_FILTERS,
  );
  const [draftFilters, setDraftFilters] = useState<SearchFilters>(
    DEFAULT_SEARCH_FILTERS,
  );

  const applyDraft = useCallback(() => {
    setAppliedFilters(normalizeSearchFilters(draftFilters));
  }, [draftFilters]);

  const clearAll = useCallback(() => {
    setDraftFilters(DEFAULT_SEARCH_FILTERS);
    setAppliedFilters(DEFAULT_SEARCH_FILTERS);
  }, []);

  const clearGenreFilters = useCallback(() => {
    setAppliedFilters((current) =>
      normalizeSearchFilters({ ...current, genreIds: undefined }),
    );
    setDraftFilters((current) =>
      normalizeSearchFilters({ ...current, genreIds: undefined }),
    );
  }, []);

  const clearProviderFilters = useCallback(() => {
    setAppliedFilters((current) =>
      normalizeSearchFilters({ ...current, providerIds: undefined }),
    );
    setDraftFilters((current) =>
      normalizeSearchFilters({ ...current, providerIds: undefined }),
    );
  }, []);

  const removeFilter = useCallback((key: string) => {
    setAppliedFilters((current) => removeFilterFrom(current, key));
    setDraftFilters((current) => removeFilterFrom(current, key));
  }, []);

  return (
    <SearchFiltersContext.Provider
      value={{
        appliedFilters,
        applyDraft,
        clearAll,
        clearGenreFilters,
        clearProviderFilters,
        draftFilters,
        removeFilter,
        setDraftFilters,
      }}
    >
      {children}
    </SearchFiltersContext.Provider>
  );
}

export function useSearchFilters() {
  const context = useContext(SearchFiltersContext);
  if (!context) {
    throw new Error(
      "useSearchFilters must be used within a SearchFiltersProvider",
    );
  }
  return context;
}
