"use client";

import { createContext, PropsWithChildren, useContext, useState } from "react";

type FilterErrorsContextValue = {
  ratingError: null | string;
  runtimeError: null | string;
  setRatingError: (error: null | string) => void;
  setRuntimeError: (error: null | string) => void;
};

const FilterErrorsContext = createContext<FilterErrorsContextValue | null>(
  null,
);

export function FilterErrorsProvider({ children }: PropsWithChildren) {
  const [ratingError, setRatingError] = useState<null | string>(null);
  const [runtimeError, setRuntimeError] = useState<null | string>(null);

  return (
    <FilterErrorsContext.Provider
      value={{ ratingError, runtimeError, setRatingError, setRuntimeError }}
    >
      {children}
    </FilterErrorsContext.Provider>
  );
}

export function useFilterErrors() {
  const context = useContext(FilterErrorsContext);
  if (!context) {
    throw new Error(
      "useFilterErrors must be used within a FilterErrorsProvider",
    );
  }
  return context;
}
