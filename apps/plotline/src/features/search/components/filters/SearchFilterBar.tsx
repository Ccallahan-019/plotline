'use client'

import { FilterBar } from '@/features/media-grid/filters/components/FilterBar'

import { useBrowseMode } from '../../providers/BrowseModeProvider'
import { useTmdbBrowse } from '../../providers/TmdbBrowseProvider'

export function SearchFilterBar() {
  const { mode } = useBrowseMode()
  const { setPage } = useTmdbBrowse()

  return <FilterBar onApply={() => setPage(1)} visible={mode === 'discover'} />
}
