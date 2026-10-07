import type { Watchlist } from '@plotline/payload-types'

export type RemoveWatchlistMembershipResult = {
  id: number
}

export type ReorderWatchlistMembershipsResult = {
  membershipIds: number[]
}

export type UpdateWatchlistInput = {
  description: null | string
  name: string
  visibility: Watchlist['visibility']
}

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

export const WATCHLIST_MEMBERSHIP_SORT_OPTIONS = [
  { label: 'Manual Order', value: 'manual' },
  { label: 'Title (A–Z)', value: 'title-asc' },
  { label: 'Title (Z–A)', value: 'title-desc' },
  { label: 'Recently Added', value: 'recently-added' },
  { label: 'Newest Release', value: 'release-date' },
] as const

export type WatchlistMembershipSort = (typeof WATCHLIST_MEMBERSHIP_SORT_OPTIONS)[number]['value']

export const DEFAULT_WATCHLIST_MEMBERSHIP_SORT: WatchlistMembershipSort = 'manual'

// Trigger text for a watchlist membership sort option.
export function getWatchlistMembershipSortLabel(sort: WatchlistMembershipSort): string {
  return (
    WATCHLIST_MEMBERSHIP_SORT_OPTIONS.find((option) => option.value === sort)?.label ??
    'Manual Order'
  )
}
