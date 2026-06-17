import type { MediaStatus, MediaType } from '@plotline/shared/constants/media'

export type LibraryFilters = {
  mediaType?: MediaType
  status?: MediaStatus
}

export type ReviewFilters = {
  hasBody?: boolean
}

export type WatchEventFilters = {
  limit?: number
  sort?: string
}

export type WatchlistFilters = {
  filter?: 'challenge' | 'custom' | 'system'
}

export const queryKeys = {
  libraryItems: (filters?: LibraryFilters) => ['library-items', filters ?? {}] as const,
  reviews: (filters?: ReviewFilters) => ['reviews', filters ?? {}] as const,
  tmdbSearch: (q: string, page: number) => ['tmdb-search', q, page] as const,
  watchEvents: (filters?: WatchEventFilters) => ['watch-events', filters ?? {}] as const,
  watchlist: (slug: string) => ['watchlists', slug] as const,
  watchlists: (filters?: WatchlistFilters) => ['watchlists', filters ?? {}] as const,
} as const
