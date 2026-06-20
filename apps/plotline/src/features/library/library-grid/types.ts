import type { LibraryItem } from '@plotline/payload-types'

import type { MediaFilters } from '@/features/media-grid/filters/types'

export const LIBRARY_SORT_OPTIONS = [
  { label: 'Recently Watched', value: 'recently-watched' },
  { label: 'Recently Added', value: 'recently-added' },
  { label: 'Recently Updated', value: 'recently-updated' },
  { label: 'Started', value: 'started' },
  { label: 'Completed', value: 'completed' },
] as const

export type LibrarySort = (typeof LIBRARY_SORT_OPTIONS)[number]['value']

export const DEFAULT_LIBRARY_SORT: LibrarySort = 'recently-watched'

export type LibraryItemsQuery = {
  filters?: MediaFilters
  page?: number
  pageSize?: number
  sort?: LibrarySort
}

export type LibraryItemsResponse = {
  docs: LibraryItem[]
  limit: number
  page: number
  totalDocs: number
  totalPages: number
}

export function getLibrarySortLabel(sort: LibrarySort): string {
  return LIBRARY_SORT_OPTIONS.find((option) => option.value === sort)?.label ?? 'Recently Watched'
}

export const DEFAULT_LIBRARY_PAGE_SIZE = 24
