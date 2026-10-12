import type { WatchlistCardFilter, WatchlistListFilter } from '../types'

export type WatchlistFilters = {
  filter?: WatchlistListFilter
}

const removeMembershipMutationKey = ['watchlists', 'remove-membership'] as const

export const watchlistQueryKeys = {
  // `filter` keeps the watchlists and challenges indexes in separate caches.
  cards: (filter?: WatchlistCardFilter) =>
    filter
      ? (['watchlists', { filter, view: 'cards' }] as const)
      : (['watchlists', { view: 'cards' }] as const),
  removeMembership: () => removeMembershipMutationKey,
  watchlist: (slug: string) => ['watchlists', slug] as const,
  watchlistDetailMemberships: (slug: string) => ['watchlists', slug, 'memberships'] as const,
  watchlistMemberships: (libraryItemId: number) =>
    ['watchlist-memberships', libraryItemId] as const,
  watchlists: (filters?: WatchlistFilters) => ['watchlists', filters ?? {}] as const,
} as const
