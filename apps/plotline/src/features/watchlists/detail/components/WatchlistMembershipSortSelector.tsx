'use client'

import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'

import {
  getWatchlistMembershipSortLabel,
  WATCHLIST_MEMBERSHIP_SORT_OPTIONS,
  type WatchlistMembershipSort,
} from '../types'

type WatchlistMembershipSortSelectorProps = {
  onSortChange: (sort: WatchlistMembershipSort) => void
  sort: WatchlistMembershipSort
}

export function WatchlistMembershipSortSelector({
  onSortChange,
  sort,
}: WatchlistMembershipSortSelectorProps) {
  const handleChange = (value: null | WatchlistMembershipSort) => {
    if (!value) {
      return
    }

    onSortChange(value)
  }

  return (
    <Select onValueChange={handleChange} value={sort}>
      <SelectTrigger aria-label="Sort titles" className="min-w-45">
        Sort: {getWatchlistMembershipSortLabel(sort)}
      </SelectTrigger>
      <SelectContent align="end" alignItemWithTrigger={false} className="p-1">
        {WATCHLIST_MEMBERSHIP_SORT_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
