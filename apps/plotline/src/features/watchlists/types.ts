import type { Watchlist } from '@plotline/payload-types'

/**
 * Watchlist row for the cards grid.
 *
 * `titleCount` is the membership count, not a challenge goal. `previews` holds
 * the first three titles in list order; a null `posterPath` is an empty frame.
 */
export type WatchlistCard = {
  createdAt: string
  description: null | string
  id: number
  name: string
  previews: WatchlistCardPreview[]
  slug: string
  titleCount: number
  updatedAt: string
  visibility: Watchlist['visibility']
}

export type WatchlistCardPreview = {
  posterPath: null | string
  title: string
}

export const WATCHLIST_CARD_SORT_OPTIONS = [
  { label: 'Name (A–Z)', value: 'name-asc' },
  { label: 'Name (Z–A)', value: 'name-desc' },
  { label: 'Recently updated', value: 'recently-updated' },
  { label: 'Newest', value: 'newest' },
  { label: 'Most titles', value: 'most-titles' },
] as const

export type WatchlistCardSort = (typeof WATCHLIST_CARD_SORT_OPTIONS)[number]['value']

export const DEFAULT_WATCHLIST_CARD_SORT: WatchlistCardSort = 'name-asc'

// Trigger text for a watchlist card sort option.
export function getWatchlistCardSortLabel(sort: WatchlistCardSort): string {
  return WATCHLIST_CARD_SORT_OPTIONS.find((option) => option.value === sort)?.label ?? 'Name (A–Z)'
}
