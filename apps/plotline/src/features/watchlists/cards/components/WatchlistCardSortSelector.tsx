'use client'

import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'

import {
  getWatchlistCardSortLabel,
  WATCHLIST_CARD_SORT_OPTIONS,
  type WatchlistCardSort,
} from '../types'

type WatchlistCardSortSelectorProps = {
  label?: string
  onSortChange: (sort: WatchlistCardSort) => void
  sort: WatchlistCardSort
}

export function WatchlistCardSortSelector({
  label = 'Sort watchlists',
  onSortChange,
  sort,
}: WatchlistCardSortSelectorProps) {
  const handleChange = (value: null | WatchlistCardSort) => {
    if (!value) {
      return
    }

    onSortChange(value)
  }

  return (
    <Select onValueChange={handleChange} value={sort}>
      <SelectTrigger aria-label={label} className="min-w-45">
        Sort: {getWatchlistCardSortLabel(sort)}
      </SelectTrigger>
      <SelectContent align="end" alignItemWithTrigger={false} className="p-1">
        {WATCHLIST_CARD_SORT_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
