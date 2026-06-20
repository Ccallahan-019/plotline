import type { LibraryItem } from '@plotline/payload-types'

import type { MediaFilters } from './types'

export const RUNTIME_RANGE_MIN = 0
export const RUNTIME_RANGE_MAX = 240

export const YEAR_RANGE_MIN = 1950

export const RATING_MIN = 0
export const RATING_MAX = 10

export const INITIAL_VISIBLE_CHECKBOX_COUNT = 5

export const DEFAULT_MEDIA_FILTERS: MediaFilters = {}

export const LIBRARY_ITEM_SOURCES = [
  'manual',
  'import',
  'recommendation',
] as const satisfies readonly NonNullable<LibraryItem['source']>[]

export type LibraryItemSource = (typeof LIBRARY_ITEM_SOURCES)[number]

export const LIBRARY_ITEM_SOURCE_LABELS: Record<LibraryItemSource, string> = {
  import: 'Import',
  manual: 'Manual',
  recommendation: 'Recommendation',
}

export const LIBRARY_ITEM_SOURCE_OPTIONS = LIBRARY_ITEM_SOURCES.map((source) => ({
  label: LIBRARY_ITEM_SOURCE_LABELS[source],
  value: source,
}))

export function formatRuntimeLabel(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (remainingMinutes === 0) {
    return `${hours}h`
  }

  return `${hours}h ${remainingMinutes}m`
}

export function getCurrentYear(): number {
  return new Date().getFullYear()
}

export function getDefaultRuntimeRange(): { max: number; min: number } {
  return {
    max: RUNTIME_RANGE_MAX,
    min: RUNTIME_RANGE_MIN,
  }
}

export function getDefaultYearRange(): { max: number; min: number } {
  return {
    max: getCurrentYear(),
    min: YEAR_RANGE_MIN,
  }
}
