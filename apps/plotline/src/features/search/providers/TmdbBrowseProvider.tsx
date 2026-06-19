"use client";

import { TmdbSearchResponse } from "@plotline/shared/tmdb";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { isBrowseRequestEnabled } from "@/lib/tmdb/search-filters";
import { getErrorMessage } from "@/utils/get-error-message";

import { useTmdbBrowse as useTmdbBrowseHook } from "../hooks/use-tmdb-browse";
import { useBrowseMode } from "./BrowseModeProvider";
import { useMediaType } from "./MediaTypeProvider";
import { useSearchFilters } from "./SearchFiltersProvider";
import { useSearchSort } from "./SearchSortProvider";

type TmdbBrowseContextValue = {
  errorMessage: null | string;
  handleClearQuery: () => void;
  isFetching: boolean;
  isInitialLoading: boolean;
  page: number;
  query: string;
  searchResults: TmdbSearchResponse | undefined;
  setPage: (page: number) => void;
  setQuery: (query: string) => void;
  showPrompt: boolean;
  totalPages: number;
};

const TmdbBrowseContext = createContext<null | TmdbBrowseContextValue>(null);

export function TmdbBrowseProvider({ children }: PropsWithChildren) {
  const { mode } = useBrowseMode();
  const { mediaType } = useMediaType();
  const { appliedFilters } = useSearchFilters();
  const { sort } = useSearchSort();

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const trimmedQuery = query.trim();
  const showPrompt = !isBrowseRequestEnabled(mode, trimmedQuery);
  const isDiscoverMode = mode === "discover";

  const { data, error, isFetching, isLoading } = useTmdbBrowseHook(
    trimmedQuery,
    {
      filters: appliedFilters,
      mediaType,
      mode,
      page,
      sort,
    },
  );

  const setPageCallback = useCallback(
    (nextPage: number) => {
      if (data && nextPage > data.total_pages) {
        return;
      }

      setPage(Math.max(1, nextPage));
    },
    [data],
  );

  const setQueryCallback = useCallback(
    (nextQuery: string) => {
      setQuery(nextQuery);
      setPage(1);
    },
    [setPage],
  );

  const handleClearQuery = () => {
    setQuery("");
  };

  const errorMessage = getErrorMessage(error);
  const totalPages = showPrompt ? 1 : (data?.total_pages ?? 1);
  const isInitialLoading = isLoading && !data;

  const value: TmdbBrowseContextValue = {
    errorMessage,
    handleClearQuery,
    isFetching,
    isInitialLoading,
    page,
    query,
    searchResults: showPrompt ? undefined : data,
    setPage: setPageCallback,
    setQuery: setQueryCallback,
    showPrompt,
    totalPages,
  };

  useEffect(() => {
    if (isDiscoverMode) {
      setQuery("");
    }
  }, [isDiscoverMode]);

  return (
    <TmdbBrowseContext.Provider value={value}>
      {children}
    </TmdbBrowseContext.Provider>
  );
}

export function useTmdbBrowse() {
  const context = useContext(TmdbBrowseContext);
  if (!context) {
    throw new Error("useTmdbBrowse must be used within a TmdbBrowseProvider");
  }
  return context;
}
