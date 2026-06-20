'use client'

import { PageSizeSelector } from '@/features/media-grid/pagination/components/PageSizeSelector'
import { PaginationBar } from '@/features/media-grid/pagination/components/PaginationBar'

import { useLibraryBrowse } from '../../providers/LibraryBrowseProvider'

export function LibraryPagination() {
  const {
    errorMessage,
    libraryItems,
    page,
    pageSize,
    setPage,
    setPageSize,
    totalPages,
    totalResults,
  } = useLibraryBrowse()

  const showPagination = !errorMessage && totalResults > 0 && (libraryItems?.docs.length ?? 0) > 0

  if (!showPagination) {
    return null
  }

  return (
    <div className="flex items-center">
      <PaginationBar
        onPageChange={setPage}
        page={page}
        scrollTargetId="library-results"
        selector={
          <PageSizeSelector
            className="min-w-[120px]"
            onPageSizeChange={setPageSize}
            pageSize={pageSize}
          />
        }
        totalPages={totalPages}
        totalResults={totalResults}
      />
    </div>
  )
}
