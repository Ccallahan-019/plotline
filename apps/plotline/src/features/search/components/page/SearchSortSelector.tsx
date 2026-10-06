'use client'

import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'

import { useBrowseMode } from '../../providers/BrowseModeProvider'
import { useSearchSort } from '../../providers/SearchSortProvider'
import { useTmdbBrowse } from '../../providers/TmdbBrowseProvider'
import { getSearchSortLabel, SEARCH_SORT_OPTIONS, type SearchSort } from '../../types'

export function SearchSortSelector() {
  const { mode } = useBrowseMode()
  const { setSort, sort } = useSearchSort()
  const { setPage } = useTmdbBrowse()

  const handleChange = (value: null | SearchSort) => {
    if (!value) {
      return
    }

    setSort(value)
    setPage(1)
  }

  return (
    <Select disabled={mode === 'search'} onValueChange={handleChange} value={sort}>
      <SelectTrigger aria-label="Sort results">Sort: {getSearchSortLabel(sort)}</SelectTrigger>
      <SelectContent align="end" alignItemWithTrigger={false} className="p-1">
        {SEARCH_SORT_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
