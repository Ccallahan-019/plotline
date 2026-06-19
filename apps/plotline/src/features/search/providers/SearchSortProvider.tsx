"use client";

import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useState,
} from "react";

import { DEFAULT_SEARCH_SORT, type SearchSort } from "../types";

type SearchSortContextValue = {
  setSort: (sort: SearchSort) => void;
  sort: SearchSort;
};

const SearchSortContext = createContext<null | SearchSortContextValue>(null);

export function SearchSortProvider({ children }: PropsWithChildren) {
  const [sort, setSortState] = useState<SearchSort>(DEFAULT_SEARCH_SORT);

  const setSort = useCallback((nextSort: SearchSort) => {
    setSortState(nextSort);
  }, []);

  return (
    <SearchSortContext.Provider value={{ setSort, sort }}>
      {children}
    </SearchSortContext.Provider>
  );
}

export function useSearchSort() {
  const context = useContext(SearchSortContext);

  if (!context) {
    throw new Error("useSearchSort must be used within a SearchSortProvider");
  }

  return context;
}
