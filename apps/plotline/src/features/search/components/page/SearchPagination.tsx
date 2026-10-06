'use client'

import { PaginationBar } from '@/features/media-grid/pagination/components/PaginationBar'

import { useTmdbBrowse } from '../../providers/TmdbBrowseProvider'

export function SearchPagination() {
  const { errorMessage, page, searchResults, setPage, showPrompt, totalPages } = useTmdbBrowse()

  const showPagination =
    !showPrompt && !errorMessage && totalPages > 1 && (searchResults?.results.length ?? 0) > 0

  if (!showPagination) {
    return null
  }

  return (
    <PaginationBar
      onPageChange={setPage}
      page={page}
      scrollTargetId="search-results"
      totalPages={totalPages}
      totalResults={searchResults?.total_results}
    />
  )
}
