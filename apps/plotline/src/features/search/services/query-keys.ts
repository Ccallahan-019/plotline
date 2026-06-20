import type { MediaFilters } from '@/features/media-grid/filters/types'
import type { BrowseMode, SearchMediaType, SearchSort } from '@/features/search/types'

import { toTmdbDiscoverFilters } from '@/features/media-grid/filters/services/normalize-filters'

export const searchQueryKeys = {
  tmdbGenres: () => ['tmdb-genres'] as const,
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
