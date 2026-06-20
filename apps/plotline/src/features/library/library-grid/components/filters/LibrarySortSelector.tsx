'use client'

import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'

import { useLibraryBrowse } from '../../providers/LibraryBrowseProvider'
import { getLibrarySortLabel, LIBRARY_SORT_OPTIONS, type LibrarySort } from '../../types'

export function LibrarySortSelector() {
  const { setPage, setSort, sort } = useLibraryBrowse()

  const handleChange = (value: LibrarySort | null) => {
    if (!value) {
      return
    }

    setSort(value)
    setPage(1)
  }

  return (
    <Select onValueChange={handleChange} value={sort}>
      <SelectTrigger aria-label="Sort library" className="min-w-[180px]">
        Sort: {getLibrarySortLabel(sort)}
      </SelectTrigger>
      <SelectContent align="end" alignItemWithTrigger={false} className="p-1">
        {LIBRARY_SORT_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
