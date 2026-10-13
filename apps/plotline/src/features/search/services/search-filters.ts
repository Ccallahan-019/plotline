import type {
  BrowseMode,
  SearchFilters,
  SearchMediaType,
  SearchSort,
} from '@/features/search/types'

import { DEFAULT_SEARCH_SORT } from '@/features/search/types'

export const MIN_TMDB_QUERY_LENGTH = 2

export function isBrowseRequestEnabled(mode: BrowseMode, query: string): boolean {
  if (mode === 'discover') {
    return true
  }

  return query.length >= MIN_TMDB_QUERY_LENGTH
}

export function parseBrowseMode(value: null | string): BrowseMode {
  return value === 'search' ? 'search' : 'discover'
}

export function parseMediaType(value: null | string): SearchMediaType {
  return value === 'tv' ? 'tv' : 'movie'
}

/** Upper bound on ids accepted per list param, so a crafted query cannot build an oversized TMDB URL. */
const MAX_ID_LIST_LENGTH = 50

/**
 * Reads discover filters from the search request query string.
 * `genreIds`, `keywordIds` and `providerIds` are comma-separated positive integers; invalid values are dropped.
 *
 * @param searchParams - Request search params
 * @returns Filters passed to TMDB discover
 */
export function parseSearchFilters(searchParams: URLSearchParams): SearchFilters {
  return {
    genreIds: parseIdList(searchParams.get('genreIds')),
    keywordIds: parseIdList(searchParams.get('keywordIds')),
    providerIds: parseIdList(searchParams.get('providerIds')),
    ratingMax: parseOptionalNumber(searchParams.get('ratingMax')),
    ratingMin: parseOptionalNumber(searchParams.get('ratingMin')),
    runtimeMax: parseOptionalNumber(searchParams.get('runtimeMax')),
    runtimeMin: parseOptionalNumber(searchParams.get('runtimeMin')),
    yearMax: parseOptionalNumber(searchParams.get('yearMax')),
    yearMin: parseOptionalNumber(searchParams.get('yearMin')),
  }
}

export function parseSearchSort(value: null | string): SearchSort {
  switch (value) {
    case 'newest':
    case 'oldest':
    case 'rating':
      return value
    case 'popularity':
    default:
      return DEFAULT_SEARCH_SORT
  }
}

/**
 * Parses a comma-separated id list from a query param.
 * Only positive integers survive, so empty segments (`1,,2`) and `0` never reach TMDB.
 *
 * @param raw - Raw param value, or `null` when absent
 * @returns Up to `MAX_ID_LIST_LENGTH` ids, or `undefined` when none are valid
 */
function parseIdList(raw: null | string): number[] | undefined {
  if (!raw) {
    return undefined
  }

  const ids = raw
    .split(',')
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isInteger(value) && value > 0)
    .slice(0, MAX_ID_LIST_LENGTH)

  return ids.length ? ids : undefined
}

function parseOptionalNumber(value: null | string): number | undefined {
  if (value === null || value?.trim() === '') {
    return undefined
  }

  const parsed = Number(value)

  return Number.isNaN(parsed) ? undefined : parsed
}
