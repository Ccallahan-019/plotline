import { Watchlist } from '@plotline/payload-types'
import { useMemo } from 'react'

import { useComboboxAnchor } from '@/components/ui/combobox'
import { useWatchlists } from '@/features/watchlists/hooks/use-watchlists'

import { toWatchlistComboboxItem } from '../services/to-watchlist-combobox-item'
import { WatchlistComboboxItem } from '../types'

export const EMPTY_WATCHLISTS: Watchlist[] = []
export const EMPTY_DISABLED_WATCHLIST_IDS = new Set<number>()

type UseWatchlistFieldProps = {
  disabledWatchlistIds?: Set<number>
  onChange: (watchlistIds: number[]) => void
  selectedWatchlistIds: number[]
}

export function useWatchlistField({
  disabledWatchlistIds = EMPTY_DISABLED_WATCHLIST_IDS,
  onChange,
  selectedWatchlistIds,
}: UseWatchlistFieldProps) {
  const anchor = useComboboxAnchor()
  const { data: watchlistsData, isLoading } = useWatchlists()
  const watchlists = watchlistsData ?? EMPTY_WATCHLISTS

  const items = useMemo(
    () => watchlists.map((watchlist) => toWatchlistComboboxItem(watchlist, disabledWatchlistIds)),
    [disabledWatchlistIds, watchlists],
  )

  const selectedItems = useMemo(
    () => items.filter((item) => selectedWatchlistIds.includes(item.watchlistId)),
    [items, selectedWatchlistIds],
  )

  const hasSelectableWatchlists = items.some((item) => !item.disabled)

  const placeholder = selectedItems.length > 0 ? '' : 'Select watchlists'

  const handleValueChange = (nextValue: WatchlistComboboxItem[]) => {
    onChange(nextValue.filter((item) => !item.disabled).map((item) => item.watchlistId))
  }

  const emptyContent = isLoading
    ? 'Loading watchlists…'
    : hasSelectableWatchlists
      ? 'No watchlists found'
      : 'Already on all watchlists'

  return {
    anchor,
    emptyContent,
    handleValueChange,
    items,
    placeholder,
    selectedItems,
  }
}
