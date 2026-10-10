'use client'

import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'

import {
  getWatchlistCardSortLabel,
  WATCHLIST_CARD_SORT_OPTIONS,
  type WatchlistCardSort,
} from '../types'

type WatchlistCardSortSelectorProps = {
  onSortChange: (sort: WatchlistCardSort) => void
  sort: WatchlistCardSort
}

export function WatchlistCardSortSelector({ onSortChange, sort }: WatchlistCardSortSelectorProps) {
  const handleChange = (value: null | WatchlistCardSort) => {
    if (!value) {
      return
    }

    onSortChange(value)
  }

  return (
    <Select onValueChange={handleChange} value={sort}>
      <SelectTrigger aria-label="Sort watchlists" className="min-w-45">
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
