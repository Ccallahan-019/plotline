import { Watchlist } from '@plotline/payload-types'
import { useMemo } from 'react'

import { useWatchlists } from '@/features/watchlists/hooks/use-watchlists'

import { toWatchlistComboboxItem } from '../services/to-watchlist-combobox-item'

export const EMPTY_WATCHLISTS: Watchlist[] = []
export const EMPTY_DISABLED_WATCHLIST_IDS = new Set<number>()

type UseWatchlistFieldProps = {
  disabledWatchlistIds?: Set<number>
}

/**
 * Loads the current user's watchlists as combobox items for the add-to-library form.
 *
 * Items in `disabledWatchlistIds` are marked disabled. Empty-state copy depends on
 * whether watchlists are still loading, remaining lists exist, or the title is already
 * on every list.
 *
 * @param options.disabledWatchlistIds - Watchlist ids that cannot be selected (already added)
 * @returns Combobox `items` and `emptyContent` for the watchlist field
 */
export function useWatchlistField({
  disabledWatchlistIds = EMPTY_DISABLED_WATCHLIST_IDS,
}: UseWatchlistFieldProps) {
  const { data: watchlistsData, isLoading } = useWatchlists()
  const watchlists = watchlistsData ?? EMPTY_WATCHLISTS

  const items = useMemo(
    () => watchlists.map((watchlist) => toWatchlistComboboxItem(watchlist, disabledWatchlistIds)),
    [disabledWatchlistIds, watchlists],
  )

  const hasSelectableWatchlists = items.some((item) => !item.disabled)

  const emptyContent = isLoading
    ? 'Loading watchlists…'
    : hasSelectableWatchlists
      ? 'No watchlists found'
      : 'Already on all watchlists'

  return {
    emptyContent,
    items,
  }
}
