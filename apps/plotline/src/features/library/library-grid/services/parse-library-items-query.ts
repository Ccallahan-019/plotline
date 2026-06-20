import type { MediaStatus, MediaType } from '@plotline/shared/constants/media'

import type { LibraryItemSource } from '@/features/media-grid/filters/constants'
import type { MediaFilters } from '@/features/media-grid/filters/types'

import { normalizeMediaFilters } from '@/features/media-grid/filters/services/normalize-filters'

import type { LibraryItemsQuery } from '../types'

import { parseLibrarySort } from './resolve-library-sort'

const VALID_STATUSES = new Set<MediaStatus>([
  'completed',

  'dropped',

  'on_hold',

  'planned',

  'watching',
])

const VALID_MEDIA_TYPES = new Set<MediaType>(['movie', 'tv'])

const VALID_SOURCES = new Set<LibraryItemSource>(['import', 'manual', 'recommendation'])

export function parseLibraryItemsQuery(searchParams: URLSearchParams): LibraryItemsQuery {
  const filters: MediaFilters = {}

  const statuses = parseCsvStrings(searchParams.get('statuses'), VALID_STATUSES)

  const mediaTypes = parseCsvStrings(
    searchParams.get('mediaTypes'),

    VALID_MEDIA_TYPES,
  )

  const sources = parseCsvStrings(searchParams.get('sources'), VALID_SOURCES)

  const watchlistIds = parseCsvNumbers(searchParams.get('watchlistIds'))

  const onWatchlist = parseOptionalBoolean(searchParams.get('onWatchlist'))

  if (statuses) {
    filters.statuses = statuses
  }

  if (mediaTypes) {
    filters.mediaTypes = mediaTypes
  }

  if (sources) {
    filters.sources = sources
  }

  if (watchlistIds) {
    filters.watchlistIds = watchlistIds
  }

  if (onWatchlist !== undefined) {
    filters.onWatchlist = onWatchlist
  }

  return {
    filters: normalizeMediaFilters(filters),

    page: parseOptionalNumber(searchParams.get('page')) ?? 1,

    pageSize: parseOptionalNumber(searchParams.get('pageSize')) ?? 24,

    sort: parseLibrarySort(searchParams.get('sort')),
  }
}

function parseCsvNumbers(value: null | string): number[] | undefined {
  if (!value) {
    return undefined
  }

  const parsed = value

    .split(',')

    .map((item) => Number(item.trim()))

    .filter((item) => !Number.isNaN(item))

  return parsed.length > 0 ? parsed : undefined
}

function parseCsvStrings<T extends string>(
  value: null | string,

  validValues: Set<T>,
): T[] | undefined {
  if (!value) {
    return undefined
  }

  const parsed = value

    .split(',')

    .map((item) => item.trim())

    .filter((item): item is T => validValues.has(item as T))

  return parsed.length > 0 ? parsed : undefined
}

function parseOptionalBoolean(value: null | string): boolean | undefined {
  if (value === 'true') {
    return true
  }

  if (value === 'false') {
    return false
  }

  return undefined
}

function parseOptionalNumber(value: null | string): number | undefined {
  if (!value) {
    return undefined
  }

  const parsed = Number(value)

  return Number.isNaN(parsed) ? undefined : parsed
}
