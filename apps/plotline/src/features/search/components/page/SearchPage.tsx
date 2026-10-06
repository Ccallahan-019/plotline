import { SearchFilterBar } from '../filters/SearchFilterBar'
import { SearchFilterBarSeparator } from '../filters/SearchFilterBarSeparator'
import { ResultsTitle } from '../results/ResultsTitle'
import { SearchResultGrid } from '../results/SearchResultGrid'
import { BrowseModeToggle } from './BrowseModeToggle'
import { IsFetchingIndicator } from './IsFetchingIndicator'
import { MediaTypeToggle } from './MediaTypeToggle'
import { SearchInputGroup } from './SearchInputGroup'
import { SearchPagination } from './SearchPagination'
import { SearchSortSelector } from './SearchSortSelector'

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
      <SearchFilterBarSeparator />

      <section className="flex flex-col gap-5 scroll-mt-6" id="search-results">
        <div className="flex items-end justify-between ">
          <ResultsTitle />
          <SearchSortSelector />
        </div>

        <SearchResultGrid />
        <SearchPagination />
      </section>
    </div>
  )
}
