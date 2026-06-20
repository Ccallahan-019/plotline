import type { MediaStatus, MediaType } from '@plotline/shared/constants/media'
import type { ReactNode } from 'react'

import type { LibraryItemSource } from './constants'

export type FilterBadge = { key: string; label: string; prefix: string }

export type FilterCheckboxItem = {
  id: number | string
  name: string
}

export type FilterDefinition = {
  group?: 'general' | 'library' | 'tmdb'
  isEnabled?: (context: FilterRenderContext) => boolean
  key: string
  label: string
  remove: (filters: MediaFilters) => MediaFilters
  render: (props: FilterFieldRenderProps) => ReactNode
  toBadge?: (filters: MediaFilters, context: FilterRenderContext) => FilterBadge | null
  validate?: (filters: MediaFilters) => FilterValidationErrors
}

export type FilterFieldRenderProps = {
  context: FilterRenderContext
  draftFilters: MediaFilters
  errors: FilterValidationErrors
  setDraftFilters: (filters: MediaFilters) => void
  setError: (key: string, error: null | string) => void
}

export type FilterRegistry = {
  definitions: FilterDefinition[]
}

export type FilterRenderContext = {
  genreNameById?: Map<number, string>
  genres?: FilterCheckboxItem[]
  mediaTypeOptions?: FilterCheckboxItem[]
  providerNameById?: Map<number, string>
  providerRegion?: string
  providers?: FilterCheckboxItem[]
  sourceOptions?: FilterCheckboxItem[]
  statusOptions?: FilterCheckboxItem[]
  watchlistNameById?: Map<number, string>
  watchlists?: FilterCheckboxItem[]
}

export type FilterValidationErrors = Record<string, null | string>

/**
 * Unified filter model shared across library (Payload) and search (TMDB) views.
 * Route-based library segments will collapse into this shape for server-side filtering.
 */
export type MediaFilters = {
  genreIds?: number[]
  mediaTypes?: MediaType[]
  onWatchlist?: boolean
  providerIds?: number[]
  ratingMax?: number
  ratingMin?: number
  runtimeMax?: number
  runtimeMin?: number
  sources?: LibraryItemSource[]
  statuses?: MediaStatus[]
  watchlistIds?: number[]
  yearMax?: number
  yearMin?: number
}
