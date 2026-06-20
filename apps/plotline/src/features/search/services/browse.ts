import type { TmdbClient } from '@plotline/shared/tmdb'
import type { TmdbSearchResponse, TmdbSearchResultItem } from '@plotline/shared/tmdb'

import type {
  BrowseMode,
  SearchFilters,
  SearchMediaType,
  SearchSort,
} from '@/features/search/types'

import { getDiscoverSortParams } from '@/features/search/services/resolve-sort-by'
import { MIN_TMDB_QUERY_LENGTH } from '@/features/search/services/search-filters'

export class BrowseValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'BrowseValidationError'
  }
}

export async function browseTmdb(
  client: TmdbClient,
  mode: BrowseMode,
  query: string,
  mediaType: SearchMediaType,
  filters: SearchFilters,
  sort: SearchSort,
  page: number,
  watchRegion: string,
): Promise<TmdbSearchResponse> {
  if (mode === 'search') {
    return searchByMediaType(client, query, mediaType, page)
  }

  return discoverByMediaType(client, mediaType, filters, sort, page, watchRegion)
}

function buildDiscoverParams(
  filters: SearchFilters,
  mediaType: SearchMediaType,
  watchRegion: string,
): Record<string, string> {
  const params: Record<string, string> = {}

  if (filters.genreIds?.length) {
    params.with_genres = filters.genreIds.join('|')
  }

  if (filters.providerIds?.length) {
    params.with_watch_providers = filters.providerIds.join('|')
    params.with_watch_monetization_types = 'flatrate'
    params.watch_region = watchRegion
  }

  if (filters.ratingMin !== undefined) {
    params['vote_average.gte'] = String(filters.ratingMin)
  }

  if (filters.ratingMax !== undefined) {
    params['vote_average.lte'] = String(filters.ratingMax)
  }

  if (filters.runtimeMin !== undefined) {
    params['with_runtime.gte'] = String(filters.runtimeMin)
  }

  if (filters.runtimeMax !== undefined) {
    params['with_runtime.lte'] = String(filters.runtimeMax)
  }

  if (mediaType === 'movie') {
    if (filters.yearMin !== undefined) {
      params['primary_release_date.gte'] = `${filters.yearMin}-01-01`
    }

    if (filters.yearMax !== undefined) {
      params['primary_release_date.lte'] = `${filters.yearMax}-12-31`
    }
  }

  if (mediaType === 'tv') {
    if (filters.yearMin !== undefined) {
      params['first_air_date.gte'] = `${filters.yearMin}-01-01`
    }

    if (filters.yearMax !== undefined) {
      params['first_air_date.lte'] = `${filters.yearMax}-12-31`
    }
  }

  return params
}

async function discoverByMediaType(
  client: TmdbClient,
  mediaType: SearchMediaType,
  filters: SearchFilters,
  sort: SearchSort,
  page: number,
  watchRegion: string,
): Promise<TmdbSearchResponse> {
  const discoverParams = {
    ...buildDiscoverParams(filters, mediaType, watchRegion),
    ...getDiscoverSortParams(sort, mediaType),
  }

  if (mediaType === 'movie') {
    return tagResponse(await client.discoverMovie(page, discoverParams), 'movie')
  }

  return tagResponse(await client.discoverTv(page, discoverParams), 'tv')
}

async function searchByMediaType(
  client: TmdbClient,
  query: string,
  mediaType: SearchMediaType,
  page: number,
): Promise<TmdbSearchResponse> {
  if (query.length < MIN_TMDB_QUERY_LENGTH) {
    throw new BrowseValidationError(
      `Provide a search query of at least ${MIN_TMDB_QUERY_LENGTH} characters`,
    )
  }

  if (mediaType === 'movie') {
    return tagResponse(await client.searchMovies(query, page), 'movie')
  }

  return tagResponse(await client.searchTv(query, page), 'tv')
}

function tagResponse(response: TmdbSearchResponse, mediaType: SearchMediaType): TmdbSearchResponse {
  return {
    ...response,
    results: tagResults(response.results, mediaType),
  }
}

function tagResults(
  results: TmdbSearchResultItem[],
  mediaType: SearchMediaType,
): TmdbSearchResultItem[] {
  return results.map((result) => ({ ...result, media_type: mediaType }))
}
