import { FilterBarSeparator } from "../filters/FilterBarSeparator";
import { SearchFilterBar } from "../filters/SearchFilterBar";
import { SearchInputGroup } from "../input/SearchInputGroup";
import { ResultsTitle } from "../results/ResultsTitle";
import { SearchResultGrid } from "../results/SearchResultGrid";
import { SearchResultPagination } from "../results/SearchResultPagination";
import { SearchSortSelector } from "../sort/SearchSortSelector";
import { BrowseModeToggle } from "./BrowseModeToggle";
import { IsFetchingIndicator } from "./IsFetchingIndicator";
import { MediaTypeToggle } from "./MediaTypeToggle";

export function SearchPage() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <BrowseModeToggle />
          <IsFetchingIndicator />
        </div>
        <MediaTypeToggle />
      </div>

      <SearchInputGroup />

      <SearchFilterBar />
      <FilterBarSeparator />

      <section className="flex flex-col gap-5 scroll-mt-6" id="search-results">
        <div className="flex items-end justify-between ">
          <ResultsTitle />
          <SearchSortSelector />
        </div>

        <SearchResultGrid />
        <SearchResultPagination />
      </section>
    </div>
  );
}
