import type { Watchlist } from '@plotline/payload-types'

export type { WatchlistCardFilter } from '../types'

/**
 * Watchlist row for the cards grid.
 *
 * `titleCount` is the membership count, not a challenge goal. `previews` holds
 * the first three titles in list order; a null `posterPath` is an empty frame.
 * `coverPath` is a TMDB image path for the card backdrop: the cover title's
 * poster, its backdrop when the poster is missing, or the first preview poster.
 * It is null when none of those images exist. `challenge` and `statsCache` are
 * copied from the watchlist so a challenge card can render pace and progress.
 * Each is null when the document omits it.
 */
export type WatchlistCard = {
  challenge: NonNullable<Watchlist['challenge']> | null
  coverPath: null | string
  createdAt: string
  description: null | string
  id: number
  name: string
  previews: WatchlistCardPreview[]
  slug: string
  statsCache: NonNullable<Watchlist['statsCache']> | null
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
  { label: 'Recently Updated', value: 'recently-updated' },
  { label: 'Newest', value: 'newest' },
  { label: 'Most Titles', value: 'most-titles' },
] as const

export type WatchlistCardSort = (typeof WATCHLIST_CARD_SORT_OPTIONS)[number]['value']

export const DEFAULT_WATCHLIST_CARD_SORT: WatchlistCardSort = 'name-asc'

// Trigger text for a watchlist card sort option.
export function getWatchlistCardSortLabel(sort: WatchlistCardSort): string {
  return WATCHLIST_CARD_SORT_OPTIONS.find((option) => option.value === sort)?.label ?? 'Name (A–Z)'
}
