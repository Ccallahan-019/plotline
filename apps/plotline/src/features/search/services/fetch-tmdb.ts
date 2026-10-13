import type { TmdbKeywordSearchResponse, TmdbSearchResponse } from '@plotline/shared/tmdb'

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

/**
 * Loads a page of TMDB browse results.
 * Discover filters send `keywordIds` as a comma-separated query param; title search ignores them server-side.
 *
 * @param mode - `discover` or title `search`
 * @param q - Title query; only sent in search mode
 * @param mediaType - Movie or TV
 * @param filters - Client filters; keyword names are reduced to ids before the request
 * @param sort - Discover sort
 * @param page - Page number, starting at 1
 * @returns The TMDB search page
 */
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
      keywordIds: discoverFilters.keywordIds?.join(','),
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

/**
 * Loads the first page of TMDB keywords for a typeahead query.
 *
 * @param query - Keyword text sent as `q`; the route rejects fewer than 2 characters
 * @returns The TMDB keyword page, with `id` and `name` on each result
 */
export function fetchTmdbKeywords(query: string): Promise<TmdbKeywordSearchResponse> {
  return fetchJson<TmdbKeywordSearchResponse>(
    `/api/tmdb/keywords${buildSearchParams({ q: query })}`,
  )
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
