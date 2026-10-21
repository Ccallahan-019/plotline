'use client'

import { PageHeading } from '@/components/pages/PageHeading'
import { useFilters } from '@/features/media-grid/filters/providers/FiltersProvider'
import { LibraryTitleSearchDialog } from '@/features/search/components/title-search/LibraryTitleSearchDialog'

import { useLibraryBrowse } from '../../providers/LibraryBrowseProvider'
import { useLibraryTitleSearch } from '../../providers/LibraryTitleSearchProvider'

export function LibraryPageHeading() {
  const { totalResults } = useLibraryBrowse()
  const { open, setOpen } = useLibraryTitleSearch()
  const { appliedFilters } = useFilters()

  const hasFilters = Object.keys(appliedFilters).length > 0
  const headingText = hasFilters ? 'Filtered Results' : 'All Titles'
  const subtitleText = hasFilters
    ? `${totalResults} titles listed from your library`
    : `${totalResults} titles in your library`

  return (
    <PageHeading description={subtitleText} title={headingText}>
      <LibraryTitleSearchDialog onOpenChange={setOpen} open={open} />
    </PageHeading>
  )
}
