'use client'

import { FilterBar } from '@/features/media-grid/filters/components/FilterBar'

import { useLibraryBrowse } from '../../providers/LibraryBrowseProvider'

export function LibraryFilterBar() {
  const { setPage } = useLibraryBrowse()

  return <FilterBar onApply={() => setPage(1)} />
}
