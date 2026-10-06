'use client'

import { useFilters } from '@/features/media-grid/filters/providers/FiltersProvider'

import { useLibraryBrowse } from '../../providers/LibraryBrowseProvider'

export function LibraryPageHeading() {
  const { totalResults } = useLibraryBrowse()
  const { appliedFilters } = useFilters()

  const hasFilters = Object.keys(appliedFilters).length > 0
  const headingText = hasFilters ? 'Filtered Results' : 'All Titles'
  const subtitleText = hasFilters
    ? `${totalResults} titles listed from your library`
    : `${totalResults} titles in your library`

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold">{headingText}</h1>

        <p className="text-sm text-muted-foreground">{subtitleText}</p>
      </div>
    </div>
  )
}
