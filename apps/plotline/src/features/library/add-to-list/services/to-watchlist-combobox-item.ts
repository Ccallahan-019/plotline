import { Watchlist } from '@plotline/payload-types'

import type { WatchlistComboboxItem } from '../types'

export function toWatchlistComboboxItem(
  watchlist: Watchlist,
  disabledWatchlistIds: Set<number>,
): WatchlistComboboxItem {
  return {
    disabled: disabledWatchlistIds.has(watchlist.id),
    id: String(watchlist.id),
    label: watchlist.name,
    watchlistId: watchlist.id,
  }
}
