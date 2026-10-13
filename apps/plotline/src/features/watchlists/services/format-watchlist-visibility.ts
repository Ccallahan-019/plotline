import type { Watchlist } from '@plotline/payload-types'

const VISIBILITY_LABELS: Record<Watchlist['visibility'], string> = {
  friends: 'Friends',
  private: 'Private',
  public: 'Public',
  unlisted: 'Unlisted',
}

/** Display label for a stored watchlist visibility value. */
export function formatWatchlistVisibilityLabel(visibility: Watchlist['visibility']): string {
  return VISIBILITY_LABELS[visibility]
}
