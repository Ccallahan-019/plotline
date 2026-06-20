import type { TmdbSearchResponse } from '@plotline/shared/tmdb'

import type { MediaFilters } from '@/features/media-grid/filters/types'
import type {
  BrowseMode,
  SearchMediaType,
  SearchSort,
  TmdbGenresResponse,
  TmdbWatchProvidersResponse,
} from '@/features/search/types'

import { toTmdbDiscoverFilters } from '@/features/media-grid/filters/services/normalize-filters'
import {
  DEFAULT_SEARCH_FILTERS,
  type SearchMediaType as DefaultSearchMediaType,
} from '@/features/search/types'
import { buildSearchParams } from '@/lib/api/build-search-params'
import { fetchJson } from '@/lib/api/fetch-json'

export function fetchTmdbBrowse(
  mode: BrowseMode,
  q: string,
  mediaType: SearchMediaType,
  filters: MediaFilters,
  sort: SearchSort,
  page = 1,
): Promise<TmdbSearchResponse> {
  const discoverFilters = toTmdbDiscoverFilters(filters)

  return fetchJson<TmdbSearchResponse>(
    `/api/tmdb/search${buildSearchParams({
      genreIds: discoverFilters.genreIds?.join(','),
      mediaType,
      mode,
      page,
      providerIds: discoverFilters.providerIds?.join(','),
      q: mode === 'search' ? q || undefined : undefined,
      ratingMax: discoverFilters.ratingMax,
      ratingMin: discoverFilters.ratingMin,
      runtimeMax: discoverFilters.runtimeMax,
      runtimeMin: discoverFilters.runtimeMin,
      sort,
      yearMax: discoverFilters.yearMax,
      yearMin: discoverFilters.yearMin,
    })}`,
  )
}

export function fetchTmdbGenres(): Promise<TmdbGenresResponse> {
  return fetchJson<TmdbGenresResponse>('/api/tmdb/genres')
}

export function fetchTmdbSearch(
  q: string,
  page = 1,
  mediaType: DefaultSearchMediaType = 'movie',
): Promise<TmdbSearchResponse> {
  return fetchTmdbBrowse('search', q, mediaType, DEFAULT_SEARCH_FILTERS, 'popularity', page)
}

export function fetchTmdbWatchProviders(
  mediaType: SearchMediaType,
): Promise<TmdbWatchProvidersResponse> {
  return fetchJson<TmdbWatchProvidersResponse>(
    `/api/tmdb/watch-providers${buildSearchParams({ mediaType })}`,
  )
}
