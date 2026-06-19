import type { MediaStatus, MediaType } from '@plotline/shared/constants/media'

import type { BrowseMode, SearchFilters, SearchMediaType, SearchSort } from '@/features/search/types'

import { normalizeSearchFilters } from '@/features/search/services/normalize-search-filters'

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
  tmdbGenres: () => ['tmdb-genres'] as const,
  tmdbSearch: (
    mode: BrowseMode,
    q: string,
    mediaType: SearchMediaType,
    filters: SearchFilters,
    sort: SearchSort,
    page: number,
  ) =>
    ['tmdb-search', mode, q, mediaType, normalizeSearchFilters(filters), sort, page] as const,
  tmdbWatchProviders: (mediaType: SearchMediaType) =>
    ['tmdb-watch-providers', mediaType] as const,
  watchEvents: (filters?: WatchEventFilters) => ['watch-events', filters ?? {}] as const,
  watchlist: (slug: string) => ['watchlists', slug] as const,
  watchlistMemberships: (libraryItemId: number) =>
    ['watchlist-memberships', libraryItemId] as const,
  watchlists: (filters?: WatchlistFilters) => ['watchlists', filters ?? {}] as const,
} as const
