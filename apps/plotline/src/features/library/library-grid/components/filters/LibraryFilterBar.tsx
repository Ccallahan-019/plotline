'use client'

import { FilterBar } from '@/features/media-grid/filters/components/FilterBar'

import { useLibraryBrowse } from '../../providers/LibraryBrowseProvider'
import { LibrarySortSelector } from './LibrarySortSelector'

export function LibraryFilterBar() {
  const { setPage } = useLibraryBrowse()

  return (
    <FilterBar endActions={<LibrarySortSelector />} onApply={() => setPage(1)} />
  )
}
