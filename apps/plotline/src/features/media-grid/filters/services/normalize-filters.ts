import type { SearchFilters } from '@/features/search/types'

import type { LibraryItemSource } from '../constants'
import type { MediaFilters } from '../types'

import { getDefaultRuntimeRange, getDefaultYearRange } from '../constants'

export type PayloadLibraryFilters = {
  mediaTypes?: MediaFilters['mediaTypes']
  onWatchlist?: boolean
  sources?: LibraryItemSource[]
  statuses?: MediaFilters['statuses']
  watchlistIds?: number[]
}

export function hasActiveFilters(filters: MediaFilters): boolean {
  return Object.keys(normalizeMediaFilters(filters)).length > 0
}

/**
 * Drops empty lists and default ranges, and sorts list filters so Apply and query keys stay stable.
 * Non-empty keywords are kept in selection order so badges match what the user picked.
 *
 * @param filters - Draft or applied media filters
 * @returns Filters with only active, canonical values
 */
export function normalizeMediaFilters(filters: MediaFilters): MediaFilters {
  const { max: defaultYearMax, min: defaultYearMin } = getDefaultYearRange()
  const { max: defaultRuntimeMax, min: defaultRuntimeMin } = getDefaultRuntimeRange()
  const normalized: MediaFilters = {}

  if (filters.statuses?.length) {
    normalized.statuses = [...filters.statuses].sort()
  }

  if (filters.mediaTypes?.length) {
    normalized.mediaTypes = [...filters.mediaTypes].sort()
  }

  if (filters.sources?.length) {
    normalized.sources = [...filters.sources].sort()
  }

  if (filters.watchlistIds?.length) {
    normalized.watchlistIds = [...filters.watchlistIds].sort((left, right) => left - right)
  }

  if (filters.onWatchlist !== undefined) {
    normalized.onWatchlist = filters.onWatchlist
  }

  if (filters.genreIds?.length) {
    normalized.genreIds = [...filters.genreIds].sort((left, right) => left - right)
  }

  if (filters.keywords?.length) {
    normalized.keywords = [...filters.keywords]
  }

  if (filters.providerIds?.length) {
    normalized.providerIds = [...filters.providerIds].sort((left, right) => left - right)
  }

  if (filters.yearMin !== undefined && filters.yearMin !== defaultYearMin) {
    normalized.yearMin = filters.yearMin
  }

  if (filters.yearMax !== undefined && filters.yearMax !== defaultYearMax) {
    normalized.yearMax = filters.yearMax
  }

  if (filters.ratingMin !== undefined) {
    normalized.ratingMin = filters.ratingMin
  }

  if (filters.ratingMax !== undefined) {
    normalized.ratingMax = filters.ratingMax
  }

  if (filters.runtimeMin !== undefined && filters.runtimeMin !== defaultRuntimeMin) {
    normalized.runtimeMin = filters.runtimeMin
  }

  if (filters.runtimeMax !== undefined && filters.runtimeMax !== defaultRuntimeMax) {
    normalized.runtimeMax = filters.runtimeMax
  }

  return normalized
}

export function toPayloadLibraryFilters(filters: MediaFilters): PayloadLibraryFilters {
  const normalized = normalizeMediaFilters(filters)

  return {
    mediaTypes: normalized.mediaTypes,
    onWatchlist: normalized.onWatchlist,
    sources: normalized.sources,
    statuses: normalized.statuses,
    watchlistIds: normalized.watchlistIds,
  }
}

/**
 * Maps client media filters to the discover request shape.
 * Selected keywords become ids sorted ascending, so the browse query key is stable regardless of
 * selection order; names stay off the key and the request.
 *
 * @param filters - Client media filters, including keyword names
 * @returns Discover filters for the browse query key and `/api/tmdb/search`
 */
export function toTmdbDiscoverFilters(filters: MediaFilters): SearchFilters {
  const normalized = normalizeMediaFilters(filters)

  return {
    genreIds: normalized.genreIds,
    keywordIds: normalized.keywords
      ?.map((keyword) => keyword.id)
      .sort((left, right) => left - right),
    providerIds: normalized.providerIds,
    ratingMax: normalized.ratingMax,
    ratingMin: normalized.ratingMin,
    runtimeMax: normalized.runtimeMax,
    runtimeMin: normalized.runtimeMin,
    yearMax: normalized.yearMax,
    yearMin: normalized.yearMin,
  }
}
