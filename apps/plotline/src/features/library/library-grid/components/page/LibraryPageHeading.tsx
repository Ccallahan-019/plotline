'use client'

import { Item, ItemContent, ItemDescription, ItemTitle } from '@/components/ui/item'
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
    <Item className="px-0">
      <ItemContent>
        <ItemTitle className="text-2xl">{headingText}</ItemTitle>

        <ItemDescription>{subtitleText}</ItemDescription>
      </ItemContent>
    </Item>
  )
}
