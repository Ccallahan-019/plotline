import { Watchlist } from '@plotline/payload-types'

import type { WatchlistComboboxItem } from '../types'

// Maps a watchlist to a combobox item, marking lists the title is already on as disabled.
export function toWatchlistComboboxItem(
  watchlist: Watchlist,
  disabledWatchlistIds: Set<number>,
): WatchlistComboboxItem {
  return {
    disabled: disabledWatchlistIds.has(watchlist.id),
    label: watchlist.name,
    value: watchlist.id,
  }
}
