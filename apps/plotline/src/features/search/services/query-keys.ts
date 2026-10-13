import type { MediaFilters } from '@/features/media-grid/filters/types'
import type { BrowseMode, SearchMediaType, SearchSort } from '@/features/search/types'

import { toTmdbDiscoverFilters } from '@/features/media-grid/filters/services/normalize-filters'

export const searchQueryKeys = {
  tmdbGenres: () => ['tmdb-genres'] as const,
  // TMDB keyword search is case-insensitive, so case variants share one cache entry.
  tmdbKeywords: (query: string) => ['tmdb-keywords', query.toLowerCase()] as const,
  tmdbSearch: (
    mode: BrowseMode,
    q: string,
    mediaType: SearchMediaType,
    filters: MediaFilters,
    sort: SearchSort,
    page: number,
  ) => ['tmdb-search', mode, q, mediaType, toTmdbDiscoverFilters(filters), sort, page] as const,
  tmdbWatchProviders: (mediaType: SearchMediaType) => ['tmdb-watch-providers', mediaType] as const,
} as const
