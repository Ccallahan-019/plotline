export type WatchlistFilters = {
  filter?: 'challenge' | 'custom' | 'system'
}

export const watchlistQueryKeys = {
  watchlist: (slug: string) => ['watchlists', slug] as const,
  watchlistMemberships: (libraryItemId: number) =>
    ['watchlist-memberships', libraryItemId] as const,
  watchlists: (filters?: WatchlistFilters) => ['watchlists', filters ?? {}] as const,
} as const
