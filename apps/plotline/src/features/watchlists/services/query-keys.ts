export type WatchlistFilters = {
  filter?: 'challenge' | 'custom' | 'system'
}

const removeMembershipMutationKey = ['watchlists', 'remove-membership'] as const

export const watchlistQueryKeys = {
  cards: () => ['watchlists', { view: 'cards' }] as const,
  removeMembership: () => removeMembershipMutationKey,
  watchlist: (slug: string) => ['watchlists', slug] as const,
  watchlistDetailMemberships: (slug: string) => ['watchlists', slug, 'memberships'] as const,
  watchlistMemberships: (libraryItemId: number) =>
    ['watchlist-memberships', libraryItemId] as const,
  watchlists: (filters?: WatchlistFilters) => ['watchlists', filters ?? {}] as const,
} as const
