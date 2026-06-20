'use client'

import { Badge } from '@/components/ui/badge'
import { useFilters } from '@/features/media-grid/filters/providers/FiltersProvider'

import { useLibraryBrowse } from '../../providers/LibraryBrowseProvider'

export function LibraryPageHeading() {
  const { totalResults } = useLibraryBrowse()
  const { appliedFilters } = useFilters()

  const hasFilters = Object.keys(appliedFilters).length > 0
  const headingText = hasFilters ? 'Filtered Results' : 'All Titles'
  const subtitleText = hasFilters
    ? `${totalResults} titles listed`
    : `${totalResults} titles in your library`

  return (
    <div className="flex flex-col gap-1">
      <Badge className="uppercase text-muted-foreground" variant="secondary">
        Library
      </Badge>

      <div className="flex flex-col">
        <h1 className="text-2xl font-bold">{headingText}</h1>

        <p className="text-sm text-muted-foreground">{subtitleText}</p>
      </div>
    </div>
  )
}
