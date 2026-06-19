"use client";

import { ErrorEmpty } from "@/components/utils/ErrorEmpty";
import { cn } from "@/lib/utils";
import { OpenStateProvider } from "@/providers/OpenStateProvider";

import { useTmdbBrowse } from "../../providers/TmdbBrowseProvider";
import { SearchResultEmptyResults } from "./SearchResultEmptyResults";
import { SearchResultEmptySearch } from "./SearchResultEmptySearch";
import { SearchResultGridContainer } from "./SearchResultGridContainer";
import { SearchResultGridLoading } from "./SearchResultGridLoading";
import { SearchResultMediaGridItem } from "./SearchResultMediaGridItem";

const ERROR_EMPTY_PROPS = {
  description: "Check your connection and TMDB configuration, then try again.",
  title: "Could not load results",
};

export function SearchResultGrid() {
  const {
    errorMessage,
    isFetching,
    isInitialLoading,
    searchResults,
    showPrompt,
  } = useTmdbBrowse();

  if (errorMessage) {
    return <ErrorEmpty {...ERROR_EMPTY_PROPS} errorMessage={errorMessage} />;
  }

  if (showPrompt) {
    return <SearchResultEmptySearch />;
  }

  if (isInitialLoading) {
    return <SearchResultGridLoading />;
  }

  if (searchResults?.results.length === 0) {
    return <SearchResultEmptyResults />;
  }

  return (
    <SearchResultGridContainer
      className={cn(isFetching && "pointer-events-none opacity-50")}
    >
      {searchResults?.results.map((result) => {
        return (
          <OpenStateProvider key={`${result.id}-${result.media_type}`}>
            <SearchResultMediaGridItem item={result} />
          </OpenStateProvider>
        );
      })}
    </SearchResultGridContainer>
  );
}
