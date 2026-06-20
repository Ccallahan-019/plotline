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

export function toTmdbDiscoverFilters(
  filters: MediaFilters,
): Pick<
  MediaFilters,
  | 'genreIds'
  | 'providerIds'
  | 'ratingMax'
  | 'ratingMin'
  | 'runtimeMax'
  | 'runtimeMin'
  | 'yearMax'
  | 'yearMin'
> {
  const normalized = normalizeMediaFilters(filters)

  return {
    genreIds: normalized.genreIds,
    providerIds: normalized.providerIds,
    ratingMax: normalized.ratingMax,
    ratingMin: normalized.ratingMin,
    runtimeMax: normalized.runtimeMax,
    runtimeMin: normalized.runtimeMin,
    yearMax: normalized.yearMax,
    yearMin: normalized.yearMin,
  }
}
