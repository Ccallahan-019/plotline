export type WatchlistFilters = {
  filter?: 'challenge' | 'custom' | 'system'
}

export const watchlistQueryKeys = {
  cards: () => ['watchlists', { view: 'cards' }] as const,
  watchlist: (slug: string) => ['watchlists', slug] as const,
  watchlistDetailMemberships: (slug: string) => ['watchlists', slug, 'memberships'] as const,
  watchlistMemberships: (libraryItemId: number) =>
    ['watchlist-memberships', libraryItemId] as const,
  watchlists: (filters?: WatchlistFilters) => ['watchlists', filters ?? {}] as const,
} as const
