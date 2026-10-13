export type RemoveWatchlistMembershipResult = {
  id: number
}

export type ReorderWatchlistMembershipsResult = {
  membershipIds: number[]
}

export type UpdateWatchlistMembershipInput = {
  excludeFromGoal: boolean
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
